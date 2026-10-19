# demoMaker for Windows 11

Download `demoMaker-Setup-1.3.2.exe` from the GitHub release. Run it, choose the installation folder, and finish. Start **demoMaker** from the desktop icon or Start menu. No development tools, terminal, or separate browser are needed. The x64 installer contains Electron/Node, FFmpeg, embedded Python, Piper, and the American English voice. Narration works without an internet connection after installation.

The installer is unsigned. Windows may display a SmartScreen reputation warning. Only use the release linked from this repository.

## Make a video

1. Open demoMaker and enter your scene script. Existing JSON projects still load. Save projects and recordings to a folder you keep.
2. Choose **Standard Video** or **Social Media Reel** before recording or creating the imported preview. Reel uses 1080 × 1920, with a separate lower caption area and room for platform controls. Standard preserves the existing dimensions and layout.
3. For Reels, use a narrow application window or crop to the part being demonstrated. Whole desktop screens contain too much text for a phone. Inspect the framing before recording. Nothing is automatically cropped away.
4. Generate narration and listen to it. Choose a screen in the native picker, or import footage. Start recording or create the imported preview.
5. Review the result, select **Export MP4**, and choose where to save it. Both formats use H.264 and AAC when audio is present. Upload manually to your chosen service. Platform duration and account restrictions still apply.

Changing format applies to the next take/preview; completed recordings retain their format. Generated captions follow speech segments; imported/live narration uses scene timing and is not transcribed. Desktop audio sharing captures system audio, so mute unrelated applications. Keep demoMaker visible beside your app while recording.

Use Windows **Settings → Apps → Installed apps → demoMaker → Uninstall** to remove it. Files you exported remain yours. No browser-profile projects are moved automatically: use the existing Save/Load project controls.

## Verification boundaries

The Windows workflow builds the actual NSIS installer, installs it, checks both shortcuts, launches the desktop shortcut, confirms the installed UI loads, generates real bundled Piper speech, records a canvas with Chromium MediaRecorder, renders and decodes both captioned MP4 formats, checks codec/dimensions, and uninstalls. The launch/export phase removes Node/Python and other development tools from PATH.

A GitHub Windows runner is not a pristine consumer Windows 11 virtual machine. Automated canvas recording does not replace an interactive physical screen/microphone permission test. No automated upload to Instagram, Facebook or YouTube is attempted. Installer signing and a physical Windows 11 capture test remain separate checks.
