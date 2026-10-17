// Opt-in integration check: run `npm run test:piper` after voice setup.
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {narrate,speechReady} from '../media.mjs';

test('Piper produces real speech with matching caption and scene durations',async()=>{
  assert.equal(await speechReady(),true,'Run Setup Narration.cmd first.');
  const scenes=[{title:'Piper test',duration:8,text:'Piper narrates your demonstration on this computer. SoHelpMe. A little help when you need it.'}];
  const slow=await narrate({scenes,voice:'en_US-ljspeech-high',speed:.9});
  const fast=await narrate({scenes,voice:'en_US-ljspeech-high',speed:1.1});
  for(const result of [slow,fast]){
    assert.equal(result.engine,'piper');assert.equal(result.voice,'en_US-ljspeech-high');assert.equal(result.sampleRate,22050);
    const wav=Buffer.from(result.audio,'base64');assert.equal(wav.subarray(0,4).toString(),'RIFF');assert.equal(wav.subarray(8,12).toString(),'WAVE');
    assert.ok(Math.abs((wav.length-44)/(22050*2)-result.duration)<.0001,'WAV samples match caption clock');
    assert.ok(wav.subarray(44).some(byte=>byte!==0),'Speech is not silence');
    assert.ok(Math.abs(result.sceneDurations.reduce((a,b)=>a+b,0)-result.duration)<.0001);
    assert.equal(result.cues.map(c=>c.text).join(' '),scenes[0].text);
    let previousEnd=0;for(const cue of result.cues){assert.ok(cue.start>=previousEnd);assert.ok(cue.end>cue.start&&cue.end<=result.duration);previousEnd=cue.end;}
  }
  assert.ok(fast.duration<slow.duration*.95,'Brisk pace produces shorter narration');
  await assert.rejects(narrate({scenes,voice:'unknown',speed:1}),/available voices/);
  await assert.rejects(narrate({scenes,voice:'en_US-ljspeech-high',speed:0}),/pace/);
});
