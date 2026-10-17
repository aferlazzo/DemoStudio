"""Generate narration locally. JSON on stdin; assets stay in the requested job folder."""
import sys, json, re, wave
from pathlib import Path

root = Path(__file__).resolve().parents[1]
local = root / '.local'
config_path = local / 'speech.json'
if config_path.exists():
    config = json.loads(config_path.read_text(encoding='utf-8-sig'))
    if config.get('packages'):
        sys.path.insert(0, config['packages'])
sys.path.insert(0, str(local / 'piper-packages'))

def main():
    from piper import PiperVoice, SynthesisConfig
    from piper.config import PiperConfig
    request = json.load(sys.stdin)
    scenes = request['scenes']
    if not isinstance(scenes, list) or not 1 <= len(scenes) <= 40:
        raise ValueError('Use 1–40 scenes.')
    if sum(len(str(s.get('text', ''))) for s in scenes) > 14000:
        raise ValueError('Keep narration below 14,000 characters.')
    voice = request.get('voice', 'en_US-ljspeech-high')
    if voice != 'en_US-ljspeech-high':
        raise ValueError('Choose one of the available voices.')
    speed = float(request.get('speed', 1))
    if not .75 <= speed <= 1.25:
        raise ValueError('Choose a pace between 0.75 and 1.25.')
    import onnxruntime as ort
    options = ort.SessionOptions()
    options.intra_op_num_threads = 2
    options.inter_op_num_threads = 1
    model_path = local / 'piper-voices' / (voice + '.onnx')
    model_config = json.loads(Path(str(model_path) + '.json').read_text(encoding='utf-8'))
    engine = PiperVoice(session=ort.InferenceSession(str(model_path), sess_options=options,
                         providers=['CPUExecutionProvider']),
                        config=PiperConfig.from_dict(model_config))
    synthesis = SynthesisConfig(length_scale=1 / speed, volume=.85)
    rate = engine.config.sample_rate
    audio, cues, durations = [], [], []
    samples_so_far = 0
    for scene in scenes:
        start = samples_so_far
        text = str(scene.get('text', '')).strip()
        # A caption is generated from exactly the text spoken in that audio segment.
        sentences = re.split(r'(?<=[.!?])\s+', text) if text else []
        chunks = []
        for sentence in sentences:
            words = sentence.split()
            line = ''
            for word in words:
                if line and len(line) + len(word) + 1 > 68:
                    chunks.append(line)
                    line = word
                else:
                    line += (' ' if line else '') + word
            if line:
                chunks.append(line)
        for chunk in chunks:
            data = b''.join(part.audio_int16_bytes for part in engine.synthesize(chunk, syn_config=synthesis))
            sample_count = len(data) // 2
            audio.append(data)
            cues.append({'start': samples_so_far / rate, 'end': (samples_so_far + sample_count) / rate, 'text': chunk})
            samples_so_far += sample_count
            pause = bytes(int(rate * .16) * 2)
            audio.append(pause)
            samples_so_far += len(pause) // 2
        padding = max(int(rate * .35), 2 * rate - (samples_so_far - start))
        audio.append(bytes(padding * 2))
        samples_so_far += padding
        durations.append((samples_so_far - start) / rate)
    folder = Path(request['output'])
    folder.mkdir(parents=True, exist_ok=True)
    with wave.open(str(folder / 'narration.wav'), 'wb') as output:
        output.setnchannels(1)
        output.setsampwidth(2)
        output.setframerate(rate)
        output.writeframes(b''.join(audio))
    result = {'cues': cues, 'sceneDurations': durations, 'duration': samples_so_far / rate,
              'voice': voice, 'engine': 'piper', 'sampleRate': rate}
    (folder / 'timeline.json').write_text(json.dumps(result), encoding='utf-8')
    print(json.dumps({'ok': True, 'duration': result['duration']}))

try:
    main()
except Exception as exc:
    print(str(exc), file=sys.stderr)
    sys.exit(1)
