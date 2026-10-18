export const studioPreset=[
 {duration:12,title:'Meet demoMaker',text:'This is demoMaker. It records a real application screen, adds your narration and captions, and saves a video you can share.',action:'Show demoMaker’s opening screen. Choose Watch demoMaker in action for the finished video, or take the quick interface tour.'},
 {duration:14,title:'Start with a simple story',text:'Give your demo a name and choose the app you want to show. A scene is simply what you plan to do, what you plan to say, and how long it takes.',action:'Show the project name and app URL. Expand the scene editor to reveal a narration field and its duration.'},
 {duration:12,title:'Choose how to tell it',text:'Generate a local American voice, speak as you record, or import a voiceover. Generated captions follow the spoken segments.',action:'Open Narration, generate the voice, and listen. Captions do not transcribe live speech.'},
 {duration:16,title:'Connect the real app',text:'Choose an application tab or import a real screen recording. Check the preview before continuing, and hide anything you do not want people to see.',action:'Choose the target app tab. For a demoMaker demonstration, use a second demoMaker window to avoid an endless mirrored preview. Review privacy before continuing.'},
 {duration:14,title:'Record at your own pace',text:'For imported footage, create the narrated video preview. For live capture, start recording and follow your scene notes. Pause during waits, then finish.',action:'Show the real Record controls. Only demonstrate Start, Pause and Finish if an actual recording is running.'},
 {duration:12,title:'Review, save, repeat',text:'Watch your recording once, then export an MP4. Save the project to reuse your scene plan next time. That is demoMaker, from working app to shareable demo.',action:'Show a real completed recording and export it. If no recording exists, explain that these controls become available after the first take.'}
];
export const preset=[
 {
  "duration": 10,
  "title": "A mysterious rattle",
  "action": "Show the actual SoHelpMe opening screen.",
  "text": "Your refrigerator has picked up a new hobby: percussion. Let's use SoHelpMe to work through an unfamiliar rattle, one observation at a time."
 },
 {
  "duration": 11,
  "title": "Describe the problem",
  "action": "Type the refrigerator description into the real application.",
  "text": "I describe the intermittent rattling and mention that the refrigerator still seems cold. Plain language is enough. I don't need to know the name of a single refrigerator part."
 },
 {
  "duration": 10,
  "title": "Get help",
  "action": "Submit Get help and wait for the real response.",
  "text": "Now I choose Get help. SoHelpMe responds with a practical first check and asks for more information, instead of expecting me to arrive with a diagnosis."
 },
 {
  "duration": 11,
  "title": "Read the first check",
  "action": "Keep the actual response readable on screen.",
  "text": "Here, the response points to items that may be touching or vibrating, and asks what changes the rattle. I can read the suggestion and answer what I actually notice."
 },
 {
  "duration": 11,
  "title": "Answer with an observation",
  "action": "Report the example observation about bottles touching, then send.",
  "text": "For this demonstration, I report that two glass bottles were touching inside the door. Separating them stopped the rattle, and the refrigerator is still cooling normally."
 },
 {
  "duration": 12,
  "title": "A useful next step",
  "action": "Show the real follow-up response. Narrate only if the on-screen response matches.",
  "text": "The follow-up recommends keeping the bottles apart and monitoring whether the sound returns. That's a useful next step for this example, with room to continue if the problem changes."
 },
 {
  "duration": 7,
  "title": "Closing",
  "action": "Leave the guidance visible through the closing line.",
  "text": "A clearer description, a useful question, and a practical next step. SoHelpMe. A little help when you need it."
 }
];
export function validateScenes(input){if(!Array.isArray(input)||!input.length||input.length>40)throw new Error('Use 1–40 scenes.');return input.map(s=>{const duration=Number(s.duration);if(!Number.isFinite(duration)||duration<2||duration>180)throw new Error('Scene durations must be 2–180 seconds.');return{duration,title:String(s.title||'Scene').slice(0,120),text:String(s.text||'').slice(0,3000),action:String(s.action||'').slice(0,3000)};});}
export function locateScene(scenes,seconds){let start=0;for(let i=0;i<scenes.length;i++){if(seconds<start+scenes[i].duration)return{index:i,start,elapsed:seconds-start};start+=scenes[i].duration;}return{index:scenes.length-1,start:start-scenes.at(-1).duration,elapsed:scenes.at(-1).duration};}
export function captionChunks(text,limit=68){const words=text.trim().split(/\s+/).filter(Boolean),result=[];let line='';for(const word of words){if(line&&line.length+word.length+1>limit){result.push(line);line=word;}else line+=(line?' ':'')+word;}if(line)result.push(line);return result;}
export function cueList(scenes){let start=0;return scenes.flatMap(s=>{const chunks=captionChunks(s.text);const cues=chunks.map((text,i)=>({start:start+i*s.duration/chunks.length,end:start+(i+1)*s.duration/chunks.length,text}));start+=s.duration;return cues;});}
export function activeCue(cues,time){return cues.find(c=>time>=c.start&&time<c.end)?.text||'';}
export function timestamp(seconds){const n=Math.round(seconds*1000);return`${String(Math.floor(n/3600000)).padStart(2,'0')}:${String(Math.floor(n/60000)%60).padStart(2,'0')}:${String(Math.floor(n/1000)%60).padStart(2,'0')},${String(n%1000).padStart(3,'0')}`;}
export function srt(cues,duration=Infinity){return cues.filter(c=>c.start<duration).map((c,i)=>`${i+1}\n${timestamp(c.start)} --> ${timestamp(Math.min(c.end,duration))}\n${c.text}\n`).join('\n');}
export function safeName(name){return name.replace(/[^a-z0-9_-]+/gi,'-').replace(/^-|-$/g,'').slice(0,70)||'demo';}
