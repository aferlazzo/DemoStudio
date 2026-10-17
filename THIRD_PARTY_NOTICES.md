# Third-party components

Setup obtains dependencies from upstream distributions. Model weights, Python packages, and FFmpeg binaries are not committed. Original license notices remain with those distributions.

- **Current narration:** [Piper](https://github.com/OHF-Voice/piper1-gpl), `piper-tts` 1.8.0: GPL-3.0. Downloaded locally from PyPI.
- **Current voice:** [en_US-ljspeech-high model card](https://huggingface.co/rhasspy/piper-voices/blob/main/en/en_US/ljspeech/high/MODEL_CARD): American English, 22,050 Hz; trained from scratch on the public-domain LJ Speech dataset. The installer downloads this model and its configuration. Retain the upstream model card and notices if packaging the voice.
- **Historical example videos only:** [kokoro-onnx](https://github.com/thewh1teagle/kokoro-onnx), 0.5.0: MIT local inference wrapper. Its README identifies the Kokoro model as Apache 2.0.
- [Kokoro-82M](https://huggingface.co/hexgrad/Kokoro-82M): Apache 2.0. Model and voices come from the [model-files-v1.0 release](https://github.com/thewh1teagle/kokoro-onnx/releases/tag/model-files-v1.0). The previously published example videos use synthetic American English voice `af_heart`.
- [ONNX Runtime](https://github.com/microsoft/onnxruntime): MIT CPU inference runtime.
- [eSpeak NG](https://github.com/espeak-ng/espeak-ng): GPL-3.0-or-later. Included in the Piper runtime. Previous Kokoro installations used [espeakng-loader](https://pypi.org/project/espeakng-loader/). Consult installed notices for bundled binary/data.
- [SoundFile](https://github.com/bastibe/python-soundfile): BSD-3-Clause wrapper. Consult its distribution for bundled libsndfile licenses.
- [ffmpeg-static](https://github.com/eugeneware/ffmpeg-static), 5.2.0: GPL-3.0-or-later package. Installs an upstream executable. FFmpeg licensing depends on build configuration; inspect `ffmpeg -L` and upstream notices before redistributing a packaged runtime.

This repository distributes app source and finished example MP4s, not an installer bundling these runtimes. Future runtime packaging must retain applicable licenses, notices, and source obligations.
