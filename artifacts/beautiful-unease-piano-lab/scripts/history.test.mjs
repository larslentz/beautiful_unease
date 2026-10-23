import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

// Exercise the production functions themselves without starting audio or a DOM.
const source=fs.readFileSync(new URL("../app.js",import.meta.url),"utf8");
const historyCode=source.slice(source.indexOf("  function historySnapshot()"),source.indexOf("  function remember()"));
function setup() {
  const state={events:[{id:"n",midi:60,startBeat:0,durationBeats:4,layer:"chord",velocity:48}],
    tempo:62,seed:1791,activeMood:null,analysisProvisional:false,selectedId:"n",
    presetId:"romantic",totalBars:8,arrangement:8,transpose:0,ending:"original",density:"sparse",variant:"original",reattack:false,
    octave:"ableton",undo:[],redo:[]};
  const controls=new Map();
  const context=vm.createContext({state,copyEvents:events=>events.map(e=>({...e})),
    $:id=>{if(!controls.has(id))controls.set(id,{});return controls.get(id);}});
  vm.runInContext(historyCode,context);return {state,controls,context};
}
test("undo restores note pitches and their transpose reference together",()=>{
  const {state,controls,context}=setup(),before=context.historySnapshot();
  state.events[0].midi=62;state.transpose=2;state.analysisProvisional=true;
  const after=context.historySnapshot();
  context.restoreHistorySnapshot(before);
  assert.equal(state.events[0].midi,60);assert.equal(state.transpose,0);
  assert.equal(controls.get("transposeInput").value,0);
  context.restoreHistorySnapshot(after);
  assert.equal(state.events[0].midi,62);assert.equal(state.transpose,2);
  assert.equal(controls.get("transposeInput").value,2);
});
test("ending, arrangement and source controls round-trip with the notes",()=>{
  const {state,controls,context}=setup(),before=context.historySnapshot();
  Object.assign(state,{ending:"uneasy",totalBars:9,arrangement:8,presetId:"held",density:"medium",variant:"octaveUp",reattack:true});
  const after=context.historySnapshot();context.restoreHistorySnapshot(before);
  assert.equal(state.ending,"original");assert.equal(state.totalBars,8);assert.equal(state.presetId,"romantic");
  context.restoreHistorySnapshot(after);
  assert.equal(state.ending,"uneasy");assert.equal(state.totalBars,9);assert.equal(state.reattack,true);
  assert.equal(controls.get("presetSelect").value,"held");assert.equal(controls.get("densitySelect").value,"medium");
});
test("musical undo does not reset an independent octave display preference",()=>{
  const {state,context}=setup(),before=context.historySnapshot();
  state.octave="scientific";context.restoreHistorySnapshot(before);
  assert.equal(state.octave,"scientific");
});
test("calibration is independent of the selected octave convention",()=>{
  const context=vm.createContext({state:{octave:"ableton"},pitchNames:["C","C#","D","Eb","E","F","F#","G","Ab","A","Bb","B"]});
  const functions=source.slice(source.indexOf("  const octaveOffset ="),source.indexOf("  function midiFromLabel"));
  const condition=source.match(/addDiagnostic\("Calibration pitches",([\s\S]*?),`MIDI 51 =/)[1];
  vm.runInContext(functions,context);
  for(const octave of ["fl","scientific","ableton"]){context.state.octave=octave;assert.equal(vm.runInContext(condition,context),true);}
});
