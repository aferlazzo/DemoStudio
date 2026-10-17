"""Generate narration locally. JSON on stdin; assets stay in the requested job folder."""
import sys, json, os, re
from pathlib import Path

root = Path(__file__).resolve().parents[1]
local = root / '.local'
config_path = local / 'speech.json'
if config_path.exists():
    config = json.loads(config_path.read_text(encoding='utf-8-sig'))
    if config.get('packages'):
        sys.path.insert(0, config['packages'])
sys.path.insert(0, str(local / 'speech-packages'))

def main():
    import numpy as np
    import soundfile as sf
    import espeakng_loader
    from kokoro_onnx import Kokoro, EspeakConfig
    request = json.load(sys.stdin)
    scenes = request['scenes']
    if not isinstance(scenes, list) or not 1 <= len(scenes) <= 40:
        raise ValueError('Use 1–40 scenes.')
    if sum(len(str(s.get('text', ''))) for s in scenes) > 14000:
        raise ValueError('Keep narration below 14,000 characters.')
    voice = request.get('voice', 'af_heart')
    if voice not in ('af_heart', 'am_michael', 'af_sarah'):
        raise ValueError('Choose one of the available voices.')
    speed = max(.75, min(1.25, float(request.get('speed', 1))))
    import onnxruntime as ort
    options = ort.SessionOptions()
    options.intra_op_num_threads = 2
    options.inter_op_num_threads = 1
    session = ort.InferenceSession(str(local / 'speech-models/kokoro-v1.0.onnx'), sess_options=options, providers=['CPUExecutionProvider'])
    engine = Kokoro.from_session(session, str(local / 'speech-models/voices-v1.0.bin'),
                    espeak_config=EspeakConfig(lib_path=espeakng_loader.get_library_path(),
                                               data_path=espeakng_loader.get_data_path()))
    rate = 24000
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
            data, rate = engine.create(chunk, voice=voice, speed=speed, lang='en-us')
            audio.append(data)
            cues.append({'start': samples_so_far / rate, 'end': (samples_so_far + len(data)) / rate, 'text': chunk})
            samples_so_far += len(data)
            pause = np.zeros(int(rate * .16), dtype=np.float32)
            audio.append(pause)
            samples_so_far += len(pause)
        padding = max(int(rate * .35), 2 * rate - (samples_so_far - start))
        audio.append(np.zeros(padding, dtype=np.float32))
        samples_so_far += padding
        durations.append((samples_so_far - start) / rate)
    folder = Path(request['output'])
    folder.mkdir(parents=True, exist_ok=True)
    sf.write(str(folder / 'narration.wav'), np.concatenate(audio), rate)
    result = {'cues': cues, 'sceneDurations': durations, 'duration': samples_so_far / rate,
              'voice': voice, 'sampleRate': rate}
    (folder / 'timeline.json').write_text(json.dumps(result), encoding='utf-8')
    print(json.dumps({'ok': True, 'duration': result['duration']}))

try:
    main()
except Exception as exc:
    print(str(exc), file=sys.stderr)
    sys.exit(1)
