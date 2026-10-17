# DemoStudio delivery and verification

Verified on Windows with Node 20 and Python 3.12, October 17, 2026. Development continues in the existing aferlazzo/DemoStudio repository, preserving its original commits. SoHelpMe code and deployment were not changed.

## Delivered

- Guided five-step application, with a finished example video as the first learning option.
- Offline Kokoro American narration, three voices, pace control, audio preview, measured caption segments, automatic scene duration updates, and stale-script checks.
- Actual screen-recording import, preview, crop and fixed masks, local FFmpeg composition, H.264/AAC MP4 playback and export, plus separate SRT downloads.
- Existing browser screen/microphone capture retained. Generated narration also connects to the existing live recorder.
- Reusable example projects, local voice installer, simple README, local gallery and public gallery source in docs/.

## Videos

| File | Duration | Picture | Audio | Bytes |
| --- | --- | --- | --- | --- |
| SoHelpMe-Demo.mp4 | 68.70 seconds | 1280×900, H.264, 30 fps, yuv420p | AAC mono, 24 kHz | 2,112,961 |
| DemoStudio-Demo.mp4 | 114.53 seconds | 1280×900, H.264, 30 fps, yuv420p | AAC mono, 24 kHz | 3,376,327 |

Both use genuine continuous browser-frame captures of the actual applications, not recreated HTML, invented app screens, or static storyboards. Embedded Chrome frames were captured repeatedly during the interactions and encoded to 30 fps; source capture cadence varied with browser work, approximately 6–11 fps in most segments. Slow UI operations have fewer distinct frames. The tutorial explicitly explains that its processing wait was shortened. Opening and closing fades are applied by DemoStudio's renderer.

SoHelpMe's actual first response asks the user to check bottles/containers/shelves that could vibrate and report the result. The example follow-up says separating two touching bottles stopped the rattle; the real application recommends keeping them separated and observing whether the sound returns. The narration identifies this as a demonstration observation. The closing is: “SoHelpMe. A little help when you need it.”

The tutorial records the real project loader, script fields, successful local voice request, actual source import, privacy controls, real render, actual Export MP4 download, and playback of the resulting SoHelpMe video. It explains reuse for ThinkAgain and Waiting Room Buddy. Its own finished video was composed using the same DemoStudio renderMovie pipeline. The delivered SoHelpMe file is the exact file downloaded by the app's Export MP4 control.

## Passed checks

- All 7 automated tests: scene validation, boundary handling, captions, SRT, filenames, actual FFmpeg conversion/render/decode, invalid caption rejection, local gallery/range handling, and foreign-origin rejection.
- JavaScript syntax checks for app, guide, narration, server, and media modules.
- Documented PowerShell voice installer completed; a fresh browser project then generated and previewed narration using that installed configuration.
- End-to-end browser trial: load project → generate narration → import real footage → confirm preview → create preview → download MP4. The full SoHelpMe video and a fresh short verification project were both exported through the actual UI.
- Both final MP4s decoded completely with FFmpeg without errors, including their audio streams. Embedded Chrome playback reported readyState 4, correct dimensions/durations, and advancing playback for both gallery videos.
- An independent local tiny.en speech recognizer recovered both complete narrations, including the closing and future-app references. Normalized script-word matches were 95.7% for SoHelpMe and 97.5% for DemoStudio. All matched words fell within their caption interval plus 0.5 seconds; maximum distance outside the intended interval was 0.039 and 0.075 seconds respectively. This is automated intelligibility/synchronization evidence, not a human listening-panel assessment.
- Audio peaks were -1.6 dBFS and -0.5 dBFS; average levels -22.8 and -22.6 dBFS. No digital clipping was detected by the peak measurement.
- Sampled frames across both full videos were visually inspected for readable application text/captions and private data. Capture was limited to app viewports; desktop browser chrome, account menus and email settings were excluded.
- Repository source was checked for common API-token/private-key patterns and email addresses; no matches. Models, local machine configuration, environment files, raw footage and voice files are ignored. Only reviewed public example videos are committed.

## Limits and optional future work

The completed production path uses imported genuine screen footage with generated narration. Direct browser/OS screen-sharing and microphone permission dialogs were not exercised in this embedded-browser run; those existing paths remain dependent on desktop Chrome/Edge support. Shared tab audio is likewise browser dependent.

There is no editing timeline, automatic secret redaction, word-level live transcription, or crash recovery. Generated caption segments are measured to the actual audio; imported/microphone narration still uses manual scene timings. Short imported footage holds its last frame; long footage ends with the script. Voice setup needs compatible Python and an initial download. The app remains a local tool; the public website hosts the videos and download instructions.

These limits are disclosed in the README and are not portrayed as completed features. No paid service or API key was used.

## Published delivery checks

The gallery is published at https://aferlazzo.github.io/DemoStudio/. GitHub Pages deployment and Windows CI both completed successfully. Both public video URLs returned HTTP 200 with video/mp4, and their downloaded bytes matched the local verified originals. Both GitHub Release v1.1.0 assets were independently downloaded and matched as well. Public embedded-Chrome playback reached readyState 4 with advancing time and the expected duration/dimensions for both files.

SHA-256:

- SoHelpMe-Demo.mp4: `3bdfed55d4bb0d8a03e3d4c4e2dcfd23882e01fffacf5e0ea95950f7034ef7cd`
- DemoStudio-Demo.mp4: `444cf8fe2dcb4644528222eaae4509ada420fe8a439f82ed61d42e26e6a7dcec`

All three source commits present at initial publication were scanned for common credential/private-key patterns and email addresses; no matches were found in repository file contents. Commit identity metadata is not application content and was not altered.
