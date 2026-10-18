# DemoStudio

Make narrated demonstration videos of your real applications. DemoStudio combines genuine footage, free local Piper narration, and timed captions into a shareable H.264/AAC MP4. No API key, paid voice subscription, or account is needed.

**[Watch DemoStudio explain itself, then watch its SoHelpMe demo](https://aferlazzo.github.io/DemoStudio/).** Both finished videos can be watched and downloaded without installing anything. DemoStudio itself runs locally; the public page is the video gallery.

## Start on Windows

1. Download this repository using **Code → Download ZIP**, and extract it. Install **Node.js 20 or newer** from [nodejs.org](https://nodejs.org/) if needed.
2. Double-click **Start Demo Studio.cmd**. First launch downloads the video dependency. Keep its terminal window open.
3. Open **http://127.0.0.1:4317/** in desktop Chrome, Edge, or the embedded browser. Choose **Watch Demo Studio in action** for the finished walkthrough.
4. To generate voices, install **Python 3.10–3.12** from [python.org](https://www.python.org/downloads/) if needed. In Narration, choose **Set up narration · one-time download**. Alternatively double-click **Setup Narration.cmd**. Setup downloads roughly 200 MB; allow several minutes and an internet connection.

Do not open `public/index.html` directly. The app needs its local server. Stop the server with Ctrl+C. Advanced launch: `npm ci`, then `npm start`. The server listens only on this computer.

## Make your next video

1. **Story:** name the project and paste your app’s address. Try the SoHelpMe example or load `examples/SoHelpMe.json`. Expand the scene editor to describe what the audience will see and hear. Rehearse the real app first; adjust the script to its actual responses.
2. **Narration:** choose the Piper American English voice and pace, then click **Generate narration & captions**. Wait for the audio player and listen. Generation updates scene durations and captions to the actual spoken segments. Changing the script, voice, pace, or duration requires generating again. Microphone, imported voiceover, and silent modes are also available for live capture.
3. **App preview:** choose a real app tab/window, or import an existing MP4/WebM screen recording. Import works in embedded browsers that cannot share a screen. Check framing and private information. Optional crop controls and fixed privacy masks are available. Tick the preview confirmation.
4. **Record / Create:** for an imported recording, click **Create narrated video preview**. For live capture, click **Start recording** and perform the real workflow beside the studio. Pause during waits and Finish when ready. Narration and recording pause together. Browser permissions are requested only for live capture.
5. **Save video:** watch the finished playback, then **Export MP4**. Save captions separately if desired. Return to Story and **Save project** to reuse the script and layout.

For ThinkAgain, Waiting Room Buddy, or another app, change the project name, address, and scenes, then repeat. Project JSON saves scripts, settings, crop, masks, and voice choice; it does **not** include video, audio, or generated caption data. Reselect source files and regenerate narration after loading a project.

## Piper narration

Piper 1.8.0 generates new narration locally with the American English LJ Speech voice. Setup installs its runtime and model once. Existing installations must run **Setup Narration.cmd** once to switch engines; old project files remain compatible. No paid service, subscription, or API key is required. The current DemoStudio and SoHelpMe demonstration MP4s both use Piper. The walkthrough shows a real Piper generation request, render, export, and resulting video playback.

Run `npm run test:piper` after setup to verify real voice generation, pace control, WAV duration, and caption timing. This optional integration test requires the local model; regular CI does not download it.

## Privacy

Editing, voice generation, and rendering run on this computer after setup. No app credentials are requested and no recordings are uploaded by DemoStudio. Initial setup downloads dependencies from npm, PyPI, and the model’s official GitHub release. `.local/`, environment files, generated audio, and private recordings are excluded from Git. Only the two reviewed public MP4 examples in `docs/media/` are committed.

## Clear screen recordings

Capture the app window at its native size with readable text. Avoid enlarging an already small or blurred recording; export cannot recover details missing from the source. The encoder uses high-quality scaling and a higher-quality H.264 setting to preserve small text. Use the player’s full-screen button or the downloaded MP4 when reviewing detailed controls.

## Practical limits

- Imported recordings require generated narration or an imported voiceover. Microphone and silent modes are for live capture. A short imported source holds its last frame until narration ends; a longer source is cut at the script’s end. There is no timeline editor for rearranging clips.
- Imported exports use 1280×900: up to 1280×800 for the app and a separate caption area. Playback in step 5 is the final layout; the source preview is for framing. Live captures use the selected 16:9 size with overlaid captions.
- Captions are burned into the picture and downloadable as SRT. Generated captions use measured speech segments, not word-by-word alignment. Microphone/imported voiceovers use your scene timings; audio is not transcribed.
- Voice generation can take a few minutes. Media jobs time out after five minutes; use shorter projects on slower computers. Imported files must be under 290 MB; total render uploads under 300 MB; maximum rendered duration is 20 minutes.
- Screen/microphone access depends on the browser and operating system. Use desktop Chrome/Edge if the embedded browser cannot share a screen. Keep the studio visible beside the app to reduce background throttling. Shared tab audio is browser dependent.
- Fixed privacy masks cover positions, not moving personal details. Review the entire video before distribution. There is no automatic secret detection/redaction.
- Save the MP4 before closing or refreshing. Unsaved recordings and narration live in browser memory; there is no crash recovery. Failed jobs show an explanation and leave the project available to retry.

## Examples and verification

- **DemoStudio-Demo.mp4:** 117.53 seconds; real project loading, scene editing, voice generation, source import, privacy controls, MP4 export, resulting SoHelpMe playback, and the finished public watch/download page with copyright footer. Processing waits are shortened.
- **SoHelpMe-Demo.mp4:** 74.27 seconds; real refrigerator conversation and replies, local narration, captions, and the requested closing line.

Watch the [gallery](https://aferlazzo.github.io/DemoStudio/) or local `/demos/` page. [COMPLETION.md](COMPLETION.md) records tests, provenance, and limitations. Run `npm test` for scene/caption helpers, actual FFmpeg conversion, render validation, gallery byte ranges, and origin checks. CI runs on Windows. The voice model is not downloaded in CI.

## Components

`public/core.js` supplies scene/caption helpers; `app.js` handles the browser workflow; `guide.js` provides guidance; `narration.js` manages voices. `server.mjs` serves the local app. `media.mjs` handles narration/render jobs; `scripts/narrate.py` runs the local engine. `scripts/setup-speech.ps1` installs optional voice dependencies. `docs/` contains the public video gallery.

Do not deploy the loopback media server as a public service. A hosted editor would need authentication, isolated jobs, storage, and upload limits. See [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) for downloaded tools.
