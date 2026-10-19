// Guided shell around the recorder. Capture and export stay in app.js.
export function mountGuide(getState){
  const $=id=>document.getElementById(id);
  const main=document.querySelector('main');
  document.querySelector('.intro h1').textContent='Let’s make your next demo.';
  document.querySelector('.intro p:last-child').textContent='Five guided steps, from a real app to a finished video.';
  const introActions=document.createElement('div');introActions.className='intro-actions';
  const watch=document.createElement('a');watch.className='button';watch.href='/demos#studio';watch.target='_blank';watch.rel='noopener';watch.textContent='▶ Watch demoMaker in action';introActions.append(watch);
  const tourStart=document.createElement('button');tourStart.className='secondary';tourStart.textContent='Take a quick interface tour';tourStart.id='tourStart';
  const presetButton=$('preset');presetButton.textContent='Try the SoHelpMe example';introActions.append(tourStart,presetButton);document.querySelector('.intro').append(introActions);
  const layout=document.querySelector('.layout'),stage=document.querySelector('.stage');
  const panels=[...document.querySelectorAll('aside .panel')];
  const guide=document.createElement('section');guide.className='guide';guide.setAttribute('aria-label','Demo setup');
  guide.innerHTML=`<nav class="steps" aria-label="Recording steps"></nav>
    <section class="guide-heading"><p class="eyebrow" id="stepCount"></p><h2 id="stepHeading" tabindex="-1"></h2><p id="stepDescription"></p></section>
    <div id="guideNotice" role="status" aria-live="polite"></div>
    <section id="stepStory" class="guide-page"></section>
    <section id="stepSound" class="guide-page" hidden></section>
    <section id="stepCapture" class="guide-page" hidden></section>
    <section id="stepRecord" class="guide-page" hidden></section>
    <section id="stepExport" class="guide-page" hidden></section>
    <div class="guide-navigation"><button id="guideBack" class="secondary">← Back</button><p id="guideReason" aria-live="polite"></p><button id="guideNext">Continue →</button></div>`;
  main.insertBefore(guide,layout);
  const story=$('stepStory'),sound=$('stepSound'),capture=$('stepCapture'),record=$('stepRecord'),exportPage=$('stepExport');
  story.append(panels[0]);
  const options=document.createElement('details');options.className='script-details';const optionsSummary=document.createElement('summary');optionsSummary.textContent='Optional: recording length and picture size';options.append(optionsSummary,panels[0].querySelector('.row'));panels[0].append(options);
  const formatLabel=$('exportFormat').parentElement,formatHint=formatLabel.nextElementSibling;panels[0].insertBefore(formatLabel,options);panels[0].insertBefore(formatHint,options);
  const explainer=document.createElement('div');explainer.className='guide-tip';explainer.innerHTML='<strong>New here? Watch the finished example first.</strong><p>Choose <b>Watch demoMaker in action</b> above to see a real project become a narrated MP4. Then give your own video a name and app address below. The SoHelpMe example supplies a starting script; review it against your app’s actual responses.</p><p id="storySummary"></p>';
  story.prepend(explainer);
  const script=document.querySelector('.script'),details=document.createElement('details');details.className='script-details';const summary=document.createElement('summary');summary.textContent='Review or edit the narration and scene timing';details.append(summary,script);story.append(details);
  const projectTools=document.querySelector('.script .section-title .transport');script.querySelector('.section-title').append($('addScene'));story.append(projectTools);projectTools.classList.add('project-tools');
  sound.append(panels[1]);
  const soundHelp=document.createElement('div');soundHelp.className='guide-tip';soundHelp.id='soundHelp';sound.prepend(soundHelp);
  const shareHelp=document.createElement('div');shareHelp.className='guide-tip';shareHelp.innerHTML='<strong>Choose the app you want people to see.</strong><ol><li>Open your app using the button below, then return here.</li><li>Click <b>Choose app tab or window</b>. In the browser dialog, select the app’s tab, then click <b>Share</b>.</li><li>Check the preview. Keep passwords, email addresses, and other private details out of view.</li></ol><p>Sharing only prepares a preview. Recording starts in the next step.</p>';
  const openShortcut=document.createElement('button');openShortcut.className='secondary';openShortcut.textContent='Open my app ↗';openShortcut.onclick=()=>$('openApp').click();const shareShortcut=document.createElement('button');shareShortcut.textContent='Choose app to capture';shareShortcut.onclick=()=>$('share').click();const sourceActions=document.createElement('div');sourceActions.className='transport';sourceActions.append(openShortcut,shareShortcut);shareHelp.append(sourceActions);capture.append(shareHelp);
  const importHelp=document.createElement('div');importHelp.className='guide-tip';importHelp.innerHTML='<strong>Already have a screen recording?</strong><p>Import the actual recording, then add your generated narration and captions. This also works when an embedded browser cannot share a screen.</p><label>Screen recording<input id="sourceFile" type="file" accept="video/mp4,video/webm,video/quicktime"></label><button id="previewClip" class="secondary" hidden>Play / pause source preview</button>';
  capture.append(importHelp);
  const stageHead=document.querySelector('.stage-head'),screen=document.querySelector('.screen'),transport=document.querySelector('.stage>.transport'),hint=document.querySelector('.stage>.hint'),director=document.querySelector('.director');
  hint.textContent='Capture the app you intend to demonstrate. To demonstrate demoMaker itself, open a second demoMaker window and capture that window.';
  const preview=document.createElement('div');preview.className='guided-preview';preview.append(stageHead,screen);capture.append(preview);
  const framing=document.createElement('details');framing.className='script-details';const framingSummary=document.createElement('summary');framingSummary.textContent='Optional: crop the picture or hide an area';framing.append(framingSummary,panels[2]);capture.append(framing);
  const review=document.createElement('label');review.className='check review-check';review.innerHTML='<input type="checkbox" id="previewChecked"> I checked the preview and it shows only what I want to share.';capture.append(review);
  $('share').textContent='Choose app tab or window';
  document.querySelector('#empty h2').textContent='Let’s connect your app';
  document.querySelector('#empty p').textContent='Choose your app in the sharing dialog. You’ll see its live preview here before anything is recorded.';
  const switchSource=document.createElement('button');switchSource.className='secondary';switchSource.id='changeSource';switchSource.textContent='Choose a different tab or window';switchSource.onclick=()=>$('share').click();capture.append(switchSource);
  const recordingHelp=document.createElement('div');recordingHelp.className='guide-tip';recordingHelp.innerHTML='<strong>You’re in control of the demo.</strong><ol><li>Keep this studio visible beside your app, using two windows if needed.</li><li>Click <b>Start recording</b>. If prompted, allow your microphone. Recording starts as soon as permission is granted.</li><li>Use the app and follow the narration below. Pause during waits; click Resume when ready.</li><li>Click <b>Finish</b>, or let the scene timer stop the recording. Then review and export.</li></ol><p id="recordSummary"></p>';
  record.append(recordingHelp,transport,hint,director);
  exportPage.append($('result'));
  const exportHelp=document.createElement('div');exportHelp.className='guide-tip';exportHelp.innerHTML='<strong>Watch it once before sharing.</strong><p>Check that the app is readable, narration is audible, captions match, and no private information is visible. Then click <b>Export MP4</b> and choose where to save it.</p><p><b>Save original</b> keeps the available video as a backup (the finished MP4 when using an imported recording). <b>Save captions</b> downloads a separate subtitle file. Save your project in step 1 to reuse the script and layout.</p>';
  exportPage.prepend(exportHelp);
  layout.remove();
  const pages=[story,sound,capture,record,exportPage];
  const titles=['Prepare your story','Choose your narration','Connect and check your app','Record your demonstration','Review and save your video'];
  const descriptions=['Name your demo and choose the app. Use the example as a starting point, or edit it for another project.','Generate a local American narrator, speak as you record, import a voiceover, or make a silent demo.','Check the source picture, crop, and privacy masks. The finished playback in step 5 shows the final caption layout.','The notes below guide what to do and say. Only the app preview and captions appear in the video.','Your recording is ready. Review it, then save a shareable MP4 to your computer.'];
  const labels=['Story','Narration','App preview','Record','Save video'];
  let step=0,seenBlob=null,wasRecording=false,tourActive=false,tourTimer=null,tourPlaying=false,returnStep=0;
  const coach=document.createElement('section');coach.className='tour-coach';coach.hidden=true;coach.setAttribute('aria-label','demoMaker demonstration');
  coach.innerHTML='<div><p class="eyebrow" id="tourCount"></p><h2 id="tourTitle"></h2><p id="tourText"></p><p class="tour-label">Live interface tour · no recording or screen permissions</p></div><div class="transport"><button id="tourPrevious" class="secondary">← Previous</button><button id="tourPause" class="secondary">Pause tour</button><button id="tourNext">Next →</button><button id="tourEnd" class="secondary">Exit tour</button></div>';
  guide.insertBefore(coach,guide.firstChild);
  const tourCopy=[
    ['Plan what you want to show','Here is a real project, already filled in. A scene is a small part of your video: what you do, what you say, and how long it lasts. You can expand the script editor to change it. Your first project is an introduction to demoMaker.'],
    ['Decide how the audience will hear you','Generate a local American voice from your script, then listen to it here. Captions are timed to the generated audio segments. You can also record your microphone or import a voiceover; those modes use your written scene timings.'],
    ['Choose the real application','This is where you select the app tab or window in your browser’s sharing dialog. Its live picture appears below. Check that picture before you continue. The tour leaves the picker disabled; it does not request screen access.'],
    ['Record while following the cues','During a real take, your app stays visible in the preview. The notes tell you what to do, and the narration tells you what to say. Start recording begins the take; Pause lets you wait; Finish ends it. These controls stay disabled in this tour.'],
    ['Watch it, then save the video','After a real recording, playback and export appear here automatically. Watch for clear audio, readable text, and private details. Export MP4 saves the finished video. No video has been recorded in this tour, so playback and export are unavailable.']
  ];
  function stopTourTimer(){clearInterval(tourTimer);tourTimer=null;tourPlaying=false;}
  function startTourTimer(){stopTourTimer();tourPlaying=true;tourTimer=setInterval(()=>{if(step<4){step++;render();coach.scrollIntoView({behavior:'smooth',block:'start'});}else{stopTourTimer();render();}},14000);}
  function endTour(){stopTourTimer();tourActive=false;step=returnStep;render();$('stepHeading').focus();guide.scrollIntoView({behavior:'smooth',block:'start'});}
  tourStart.onclick=()=>{if(getState().busy)return;returnStep=step;tourActive=true;step=0;startTourTimer();render();coach.scrollIntoView({behavior:'smooth',block:'start'});};
  $('tourEnd').onclick=endTour;
  $('tourPause').onclick=()=>{if(tourPlaying)stopTourTimer();else startTourTimer();render();};
  $('tourNext').onclick=()=>{if(step===4){endTour();return;}step++;if(tourPlaying)startTourTimer();render();coach.scrollIntoView({behavior:'smooth',block:'start'});};
  $('tourPrevious').onclick=()=>{step=Math.max(0,step-1);if(tourPlaying)startTourTimer();render();coach.scrollIntoView({behavior:'smooth',block:'start'});};
  const navButtons=labels.map((label,i)=>{const button=document.createElement('button');button.className='step-button';button.textContent=`${i+1}  ${label}`;button.onclick=()=>go(i);document.querySelector('.steps').append(button);return button;});
  function canAdvance(){const state=getState();if(step===0){try{const url=new URL($('appUrl').value);return ['http:','https:'].includes(url.protocol)&&Boolean($('projectName').value.trim());}catch{return false;}}if(step===1)return $('audioMode').value==='generated'?state.narrationReady:$('audioMode').value!=='file'||Boolean($('audioFile').files.length);if(step===2)return state.hasSource&&$('previewChecked').checked&&(!state.imported||['generated','file'].includes($('audioMode').value));return false;}
  function reason(){if(step===0)return 'Give your demo a name and a valid app URL.';if(step===1)return $('audioMode').value==='generated'?'Generate narration for this script, then listen to the preview.':'Choose a narration audio file to continue.';if(step===2&&getState().imported&&!['generated','file'].includes($('audioMode').value))return 'Imported footage needs a prepared voiceover. Return to Narration and generate a voice or choose an audio file.';if(step===2)return getState().hasSource?'Check the preview, then tick the confirmation above.':'Choose an app tab or import a screen recording to continue.';return '';}
  function go(next){const state=getState();if(state.busy)return;if(next>step&&!(next===4&&state.result)&&(!canAdvance()||next!==step+1))return;if(next===4&&!state.result)return;step=next;render();$('stepHeading').focus();guide.scrollIntoView({behavior:'smooth',block:'start'});}
  function render(){const state=getState();pages.forEach((page,i)=>page.hidden=i!==step);
    document.body.classList.toggle('touring',tourActive);
    // The same live canvas is visible during framing and recording.
    if(step===3)record.insertBefore(preview,transport);else capture.insertBefore(preview,framing);
    $('stepCount').textContent=`STEP ${step+1} OF 5`;$('stepHeading').textContent=titles[step];$('stepDescription').textContent=descriptions[step];
    navButtons.forEach((button,i)=>{button.disabled=state.busy||tourActive||(i>step&&!(i===4&&state.result));button.classList.toggle('current',i===step);if(i===step)button.setAttribute('aria-current','step');else button.removeAttribute('aria-current');});
    coach.hidden=!tourActive;guide.querySelector('.guide-navigation').hidden=tourActive;tourStart.disabled=state.busy||tourActive;presetButton.disabled=state.busy||tourActive;
    $('share').disabled=state.busy||tourActive;shareShortcut.disabled=tourActive;openShortcut.disabled=tourActive;
    $('record').disabled=state.busy||tourActive||!state.hasSource;$('disconnect').disabled=state.busy||tourActive||!state.hasSource;
    $('record').textContent=state.imported?'Create narrated video preview':'● Start recording';$('sourceFile').disabled=state.busy||tourActive;$('previewClip').hidden=!state.imported;$('previewClip').disabled=state.busy||tourActive;
    $('pause').hidden=state.imported;$('stop').hidden=state.imported;hint.hidden=state.imported;
    let instructions=recordingHelp.querySelector('ol');instructions.hidden=state.imported;
    recordingHelp.querySelector('strong').textContent=state.imported?'Turn your recording into a finished video.':'You’re in control of the demo.';
    let importInstructions=$('importInstructions');if(!importInstructions){importInstructions=document.createElement('p');importInstructions.id='importInstructions';recordingHelp.insertBefore(importInstructions,$('recordSummary'));}importInstructions.hidden=!state.imported;importInstructions.textContent='Click Create narrated video preview. Your recording, prepared voiceover, and captions are combined locally. When it is ready, watch the result in step 5, then export the MP4. A short source holds its final frame until the narration ends; a longer source ends with the script.';
    if(state.imported&&step===3){$('stepHeading').textContent='Create your narrated video';$('stepDescription').textContent='The recording is ready. Create the finished preview, then check it before sharing.';}
    $('playback').hidden=!state.result;$('result').hidden=!state.result&&!tourActive;
    for(const id of ['mp4','raw','subtitles'])$(id).disabled=!state.result||tourActive;
    if(tourActive){$('tourCount').textContent=`DEMOMAKER IN ACTION · ${step+1} OF 5`;$('tourTitle').textContent=tourCopy[step][0];$('tourText').textContent=tourCopy[step][1];$('tourPrevious').disabled=step===0;$('tourNext').textContent=step===4?'Finish tour →':'Next →';$('tourPause').textContent=tourPlaying?'Pause tour':'Play tour';}
    $('guideBack').hidden=step===0;$('guideBack').disabled=state.busy;
    $('guideNext').hidden=step>=3;$('guideNext').disabled=!canAdvance()||state.busy;
    $('guideNext').textContent=['Continue to narration →','Continue to app preview →','Continue to recording →'][step]||'Continue →';
    $('guideReason').textContent=step<3&&!canAdvance()?reason():step===2?'Your preview is ready. Nothing has been recorded yet.':'';
    $('changeSource').hidden=!state.hasSource||step!==2;$('changeSource').disabled=state.busy;$('previewChecked').disabled=state.busy;shareShortcut.hidden=state.hasSource;
    $('storySummary').textContent=`${state.sceneCount} scenes · ${Math.round(state.duration)} seconds. You can change this below.`;
    const mode=$('audioMode').value;
    $('soundHelp').replaceChildren();const strong=document.createElement('strong');strong.textContent=mode==='generated'?'Let free Piper narrate your script.':mode==='mic'?'Speak as you demonstrate — recommended for your first demo.':mode==='file'?'Have a voiceover ready? Add it here.':'Make a video without narration.';const p=document.createElement('p');p.textContent=mode==='generated'?'Piper uses an American English voice. Choose a pace and click Generate narration & captions. Listen to the audio preview. Scene lengths and captions are timed to the spoken audio.':mode==='mic'?'You’ll read the script aloud while using your app. Microphone permission is requested when you start recording. Speak naturally; the script is a guide, not a test.':mode==='file'?'Choose an MP3, WAV, or another supported audio file. It starts with the recording and pauses with it. Adjust the scene times to match your voiceover.':'No microphone is requested. Script captions can still tell the story. Turn them off below if you want only the app screen.';$('soundHelp').append(strong,p);
    $('recordSummary').textContent=`${Math.round(state.duration)}-second script · ${mode==='generated'?'Generated American narration':mode==='mic'?'Microphone narration':mode==='file'?'Imported voiceover':'No narration'} · ${$('timing').value==='auto'?'Stops at script end':'You choose when to finish'}.`;
    $('guideNotice').textContent=state.message;
  }
  $('guideBack').onclick=()=>go(step-1);$('guideNext').onclick=()=>go(step+1);
  $('previewChecked').onchange=render;
  guide.addEventListener('input',()=>render());guide.addEventListener('change',()=>render());
  window.addEventListener('studio-state',()=>{const state=getState();if(state.result&&state.result!==seenBlob){seenBlob=state.result;step=4;render();$('stepHeading').focus();guide.scrollIntoView({behavior:'smooth',block:'start'});}else{if(wasRecording&&!state.recording&&!state.result)step=3;render();}wasRecording=state.recording;});
  // Reset the preview confirmation whenever capture is changed or disconnected.
  window.addEventListener('studio-source',()=>{$('previewChecked').checked=false;render();});
  window.addEventListener('studio-config',render);
  render();
}
