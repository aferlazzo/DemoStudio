# demoMaker 1.3.2 verification — October 19, 2026

Released from existing repository `aferlazzo/demoMaker`; existing history preserved.

- Built source: `2b57aba15aca5667000e2651e306eed5283737d0`.
- Successful Windows workflow: https://github.com/aferlazzo/demoMaker/actions/runs/39319117488
- Release: https://github.com/aferlazzo/demoMaker/releases/tag/v1.3.2
- Installer: `demoMaker-Setup-1.3.2.exe`, 297,624,653 bytes.
- Installer SHA-256: `4720f3e364fa1618fb739e6ca627b8e221b73b985a2ea72700b8b88136cd521f`.

## Passed

Eight core/server/export tests and the separate Piper integration test passed locally and on Windows. Tests cover timing, caption cue bounds, invalid input, request origins, real H.264/AAC conversion, landscape output and vertical output.

The actual NSIS installer was built, installed, and launched through its desktop shortcut. Desktop and Start menu shortcuts were present. The guided interface initialized. The installed launch/narration/export phase ran with only Windows system directories on PATH, excluding global Node, Python and other development tools.

The installed app captured real Windows desktop footage (30,763 bytes) through Chromium's display-media API. The test selected the desktop and granted permission automatically. It also exercised canvas/MediaRecorder recording, generated local Piper speech and synchronized caption cues, rendered both MP4 layouts, decoded the resulting files, and verified H.264/AAC codecs and output dimensions. Standard imported footage retained 1280 × 900; Reel output was 1080 × 1920, 30 fps. Uninstall completed and removed the desktop shortcut.

Published sample videos contain generated narration (about 5.81 seconds) and synchronized burned captions. They use a synthetic demonstration screen to make layout/readability checks repeatable. Real desktop capture is retained separately in the workflow artifact. Both published sample files were downloaded, matched their release SHA-256 hashes, decoded, and visually inspected at two seconds. Both layouts were also generated and visually inspected locally; Reel caption sizing was corrected after inspection. A DOM-based interface check confirmed initial guided setup and switching preview dimensions.

## Remaining limits

The hosted Windows runner is not a pristine consumer Windows 11 installation. No physical Windows 11 machine, microphone, interactive native picker, or manual social-platform upload was tested. Installer code signing is not configured; SmartScreen may display a reputation warning.

Reels fit content into a portrait layout rather than automatically cropping away information. For readable app text on a phone, choose a narrow source window or deliberately crop to the relevant content, then check the preview. Completed recordings retain the format selected when created; change format before a new take/imported preview. Platform-specific account/duration restrictions remain the user's upload responsibility.
