# DemoStudio — Piper delivery report

Completed in the existing aferlazzo/DemoStudio repository on October 17, 2026. Original history and application functionality are preserved. SoHelpMe code and deployment were not changed.

## Current deliverables

| File | Duration | Format | Bytes |
| --- | --- | --- | --- |
| DemoStudio-Demo.mp4 | 114.00 seconds | H.264, 1280×900, 30 fps; AAC mono 22,050 Hz | 2,753,188 |
| SoHelpMe-Demo.mp4 | 74.27 seconds | H.264, 1280×900, 30 fps; AAC mono 22,050 Hz | 2,103,035 |
| DemoStudio-Narration.wav | 114.00 seconds | PCM signed 16-bit mono, 22,050 Hz | 5,027,478 |
| SoHelpMe-Narration.wav | 74.24 seconds | PCM signed 16-bit mono, 22,050 Hz | 3,274,162 |

Both current videos use locally installed Piper 1.8.0 with the American English LJ Speech high voice. There are no Microsoft speech requests, API keys, paid subscriptions, or cloud synthesis services in the production narration path. Piper runs successfully in this environment, so no fallback engine is needed. The v1.1.0 release preserves the original Kokoro examples; current gallery videos replace them with Piper versions.

## What the walkthrough actually shows

Fresh footage of the existing DemoStudio application: load the SoHelpMe project, review scene text, request real Piper generation, preview its WAV, import actual SoHelpMe footage, review crop/privacy controls, render a real MP4, download that file using Export MP4, play it inside DemoStudio, and return to reusable project settings. Narration explains repeating the workflow for ThinkAgain and Waiting Room Buddy. This is a full 114-second demonstration, not the earlier short voice smoke test.

Footage consists of continuous browser viewport captures during actual interactions. No fictional interface, invented app response, desktop account screen, or storyboard is substituted. The embedded capture interface sampled the new walkthrough at about three distinct frames per second; the MP4 is encoded at 30 fps. Actual UI footage is cropped to remove empty capture padding. Processing waits are shortened and the narration says so. Scene footage is retimed to its spoken section. Opening/closing fades and open captions are applied by DemoStudio's media renderer.

The SoHelpMe source is the previously recorded real refrigerator conversation. It is retimed to its new Piper narration. Its first real reply recommends checking items that could vibrate and reporting the result; the example observation concerns touching bottles. The real follow-up recommends keeping them separated and monitoring for recurrence. Its requested closing line is preserved. The final SoHelpMe MP4 is the exact file downloaded through the working app's Export MP4 button.

## Narration and synchronization

Piper produces local WAV audio. Each caption's text is the same segment passed to Piper, and its boundaries are measured from the generated PCM sample count. Scene durations include measured speech and small pauses. The tutorial voice was synthesized at pace 1.05 and then accelerated by approximately 1.124 with FFmpeg to fit 114 seconds; caption and scene times were scaled by the same factor. The final WAV is padded to exactly 114 seconds before rendering. The SoHelpMe voice uses the app's Natural pace without this postprocessing.

## Verification passed

- All seven existing automated tests passed: scene/caption helpers, filename validation, real FFmpeg conversion and render/decode, invalid timelines, origin rejection, and local gallery range requests. The gallery test also covers versioned MP4 URLs.
- `npm run test:piper` passed using real local synthesis at two paces. It checks WAV samples against caption duration, audible sample data, caption ordering, pace behavior, and invalid voice/pace rejection.
- Both final video/audio streams decoded completely with FFmpeg without errors. DemoStudio narration WAV was also decoded as 16-bit PCM mono at the expected duration and rate.
- Audio measurements: DemoStudio mean -19.4 dBFS, peak -1.4 dBFS; SoHelpMe mean -19.6 dBFS, peak -1.4 dBFS. Both contain sustained speech and their measured peaks are below digital clipping.
- An independent local speech recognizer recovered the full narrations, including the Piper explanation, Microsoft-free workflow, future-app references, and SoHelpMe closing. Normalized script word matches: 94.3% DemoStudio, 96.2% SoHelpMe. All matched words fell within the intended caption interval plus 0.5 seconds; maximum distance outside the intended interval was 0.105 and 0.114 seconds. This is automated intelligibility evidence, not a human listening-panel assessment.
- Frames sampled across both videos were visually checked for genuine UI, readable captions, framing, and private information. Capture was limited to app viewports, with account and email settings closed. Source and generated assets were checked for common secret/email patterns before publication.
- Browser playback and public download checks are recorded after publication below. File hashes are in docs/media/verification.json.

## Access and remaining limits

Watch/download: https://aferlazzo.github.io/DemoStudio/. Run the existing app locally using Start Demo Studio.cmd; voice setup is already complete on this machine. Fresh installations use Setup Narration.cmd once and require compatible Python plus the initial model download. README.md explains the full workflow.

The verified production route is actual imported footage plus generated Piper narration and captions. Direct OS screen/microphone permission prompts were not exercised in this embedded-browser run. Their existing functionality remains browser dependent. There is no timeline editor, automatic redaction, word-level live transcription, or crash recovery. Unsaved media stays in browser memory. The public page is a video gallery; the editor runs locally.

No environmental blocker prevented this delivery.
