import {test} from 'node:test';
import assert from 'node:assert/strict';
import {preset,studioPreset,validateScenes,locateScene,cueList,srt,safeName} from '../public/core.js';
test('first scene plan introduces Demo Studio itself in 80 seconds',()=>{assert.equal(studioPreset.reduce((n,s)=>n+s.duration,0),80);assert.match(studioPreset[0].text,/This is Demo Studio/);assert.equal(validateScenes(studioPreset).length,6);});
test('example runs 72 seconds and preserves closing line',()=>{assert.equal(preset.reduce((n,s)=>n+s.duration,0),72);assert.match(preset.at(-1).text,/SoHelpMe\. A little help when you need it\.$/);});
test('scene boundaries and end clamp',()=>{assert.equal(locateScene(preset,10).index,1);assert.equal(locateScene(preset,100).index,4);});
test('captions cover scene timing without overlap; partial export clips final cue',()=>{const cues=cueList(preset);assert.equal(cues[0].start,0);assert.equal(cues.at(-1).end,72);for(let i=1;i<cues.length;i++)assert.ok(Math.abs(cues[i].start-cues[i-1].end)<.00001);const text=srt(cues,3);assert.match(text,/00:00:03,000/);assert.doesNotMatch(text,/00:01:/);});
test('project rejects empty and invalid durations',()=>{assert.throws(()=>validateScenes([]));assert.throws(()=>validateScenes([{duration:-1}]));assert.throws(()=>validateScenes([{duration:'bad'}]));assert.equal(validateScenes([{duration:5,title:'Test'}])[0].duration,5);});
test('download names cannot escape a filename',()=>{assert.equal(safeName('../../my demo'),'my-demo');assert.equal(safeName(''),'demo');});
