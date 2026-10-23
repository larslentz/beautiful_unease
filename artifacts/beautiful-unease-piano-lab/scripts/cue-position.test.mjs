import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

const source=fs.readFileSync(new URL("../app.js",import.meta.url),"utf8");
const handlers=source.slice(source.indexOf("  function seekToCanvasPosition"),source.indexOf("  function addEvent(layer"));
const insertion=source.slice(source.indexOf("  function addNoteAtCuePosition"),source.indexOf('  $("addNoteButton")'));
function setup({left=100,width=1200,playing=false,hit=null}={}) {
  const listeners={},calls=[],events=[{id:"n",midi:60,startBeat:10,durationBeats:4,layer:"chord",velocity:48}];
  const state={events,seekBeat:0,playhead:0,isPlaying:playing,snap:.25};
  const canvas={clientWidth:1200,getBoundingClientRect:()=>({left,top:50,width}),focus:()=>{},
    setPointerCapture:()=>{},addEventListener:(type,fn)=>(listeners[type]??=[]).push(fn)};
  const context=vm.createContext({state,canvas,learning:{followCue:()=>calls.push(["follow"])},
    beatWidth:()=>36,totalBeats:()=>32,snap:n=>Math.round(n/state.snap)*state.snap,
    playbackEvents:[{id:"comparison",midi:67}],playbackTempo:71,playbackLength:16,playbackToneId:"mist",
    stopAudio:reset=>{calls.push(["stop",reset]);state.isPlaying=false;if(reset)state.seekBeat=0;},
    playAudio:(...args)=>calls.push(["play",...args]),renderRoll:()=>{},currentHarmony:()=>"test harmony",
    $:()=>({}),findCanvasEvent:()=>hit,selectEvent:id=>state.selectedId=id,remember:()=>{},
    rowHeight:15,deleteSelected:()=>{},addEvent:(...args)=>calls.push(["add",...args])});
  vm.runInContext(handlers+insertion,context);
  const click=beat=>({clientX:left+(50+beat*36)*width/1200,clientY:100,pointerId:1,preventDefault:()=>{}});
  return {context,state,calls,listeners,click};
}
test("grid click at bar 5 maps to beat 16, not a pixel-clamped early position",()=>{
  const s=setup();s.listeners.pointerdown[0](s.click(16));
  assert.equal(s.state.seekBeat,16);assert.equal(s.state.playhead,16);
  assert.ok(s.calls.some(c=>c[0]==="follow"));
});
test("CSS-scaled and horizontally scrolled canvas clicks map to the same beat",()=>{
  const s=setup({left:-400,width:600});s.context.seekToCanvasPosition(s.click(24.25));
  assert.equal(s.state.seekBeat,24.25);
});
test("clicking an existing note seeks while retaining selection and drag capture",()=>{
  const hit={id:"n",midi:60,startBeat:10,durationBeats:4},s=setup({hit});
  const before=JSON.stringify(s.state.events);s.listeners.pointerdown[0](s.click(11));
  assert.equal(s.state.selectedId,"n");assert.equal(s.state.seekBeat,11);
  assert.equal(JSON.stringify(s.state.events),before);
  assert.equal(vm.runInContext("drag.id",s.context),"n");
});
test("seeking while playing keeps the clicked offset and current preview's events/options",()=>{
  const s=setup({playing:true});s.context.seekToCanvasPosition(s.click(12));
  assert.equal(s.calls[0][0],"stop");assert.equal(s.calls[0][1],false);
  const play=s.calls.find(c=>c[0]==="play");
  assert.equal(play[1][0].id,"comparison");assert.equal(play[2],12);
  assert.equal(play[3].tempo,71);assert.equal(play[3].length,16);assert.equal(play[3].toneId,"mist");
  assert.equal(s.state.seekBeat,12);
});
test("clicks snap to the selected grid and remain inside the cue",()=>{
  const s=setup();s.context.seekToCanvasPosition(s.click(12.36));assert.equal(s.state.seekBeat,12.25);
  s.context.seekToCanvasPosition(s.click(40));assert.equal(s.state.seekBeat,31.75);
  s.context.seekToCanvasPosition(s.click(0));assert.equal(s.state.seekBeat,0);
});
test("pitch-label gutter clicks do not move the cursor",()=>{
  const s=setup();s.state.seekBeat=8;s.context.seekToCanvasPosition({clientX:120});
  assert.equal(s.state.seekBeat,8);assert.equal(s.calls.length,0);
});
test("Plus Note inserts at the chosen beat without changing existing notes",()=>{
  const s=setup();s.context.seekToCanvasPosition(s.click(16.5));s.context.addNoteAtCuePosition();
  assert.deepEqual(s.calls.find(c=>c[0]==="add"),["add","chord",60,16.5,1,48]);
});
test("last grid step inserts a shorter note instead of moving it earlier or past the end",()=>{
  const s=setup();s.context.seekToCanvasPosition(s.click(31.75));s.context.addNoteAtCuePosition();
  assert.deepEqual(s.calls.find(c=>c[0]==="add"),["add","chord",60,31.75,.25,48]);
});
