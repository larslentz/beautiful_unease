import test from "node:test";
import assert from "node:assert/strict";
import "../theory.js";

const T=globalThis.CueTheory;
const note=(id,midi,startBeat=0,durationBeats=4,layer="chord")=>({id,midi,startBeat,durationBeats,layer,velocity:48});
const voicing=(pitches,start=0,duration=4,prefix="n")=>pitches.map((m,i)=>note(prefix+i,m,start,duration,i===0?"bass":"chord"));
const minor=voicing([36,43,51,55,62]);

test("minor and major thirds have distinct actual half-step counts",()=>{
  assert.equal(T.interval(60,63).name,"minor third");assert.equal(T.interval(60,63).semitones,3);
  assert.equal(T.interval(60,64).name,"major third");assert.equal(T.interval(60,64).semitones,4);
});
test("compound distance is not silently reduced to a minor third",()=>{
  const i=T.interval(36,51);assert.equal(i.name,"minor tenth");assert.equal(i.semitones,15);
  assert.equal(i.simple,"minor third");assert.equal(i.compound,true);
});
test("ninth, seventeenth and octave retain actual distance",()=>{
  assert.equal(T.interval(48,62).name,"major ninth");
  assert.equal(T.interval(36,63).name,"minor 17th");
  assert.equal(T.interval(36,60).name,"2 octaves");
});
test("descending motion records direction separately",()=>{
  assert.equal(T.interval(60,59).direction,"down");assert.equal(T.interval(60,59).semitones,1);
});
test("the actual Cm(add9) voicing establishes root and note roles",()=>{
  const m=T.analyze(minor,{tonic:0}),r=m.regions[0],info=T.noteInfo(minor[2],r,m);
  assert.equal(r.name,"Cm(add9)");assert.equal(r.root,0);
  assert.equal(info.role,"minor third");assert.equal(info.degree,"♭3");
});
test("finding a minor-third lesson can return a compound, correctly explained interval",()=>{
  const m=T.analyze(minor),f=T.findExample(m,{kind:"interval",interval:"minor third",fromPC:0});
  assert.ok(f);assert.equal(f.semitones,15);assert.match(f.text,/minor tenth/);
});
test("a reference anchor must be the first note, not just either endpoint",()=>{
  const m=T.analyze(voicing([57,60]));
  assert.equal(T.findExample(m,{kind:"interval",interval:"minor third",fromPC:0}),null);
});
test("transposed root, degree and lesson anchor track the actual pitches",()=>{
  const shifted=minor.map(n=>({...n,midi:n.midi+2})),m=T.analyze(shifted,{tonic:2});
  assert.equal(m.regions[0].name,"Dm(add9)");assert.equal(T.noteInfo(shifted[2],m.regions[0],m).degree,"♭3");
  assert.ok(T.findExample(m,{kind:"interval",interval:"minor third",fromPC:2}));
});
test("a held C under G7 remains a pedal, not a G7 chord root",()=>{
  const ev=[note("bass",36,0,16,"bass"),...voicing([60,64,67],0,8,"a").map(n=>({...n,layer:"chord"})),
    ...voicing([55,59,62,65],8,8,"b").map(n=>({...n,layer:"chord"}))];
  const m=T.analyze(ev,{tonic:0}),r=m.regionAt(9);
  assert.equal(r.name,"G7");assert.equal(r.root,7);assert.equal(r.separateBass,true);
  assert.ok(r.facts.some(f=>f.kind==="Pedal point"));
});
test("repeated pedal attacks are explicitly distinguished from one long note",()=>{
  const ev=[note("b1",36,0,8,"bass"),note("b2",36,8,8,"bass"),
    ...voicing([60,64,67],0,8,"upper-a").map(n=>({...n,layer:"chord"})),
    ...voicing([55,59,62,65],8,8,"upper-b").map(n=>({...n,layer:"chord"}))];
  assert.ok(T.analyze(ev).pedals.some(p=>p.reattacked && p.notes.length===2));
});
test("actual G7sus4 to G7 identifies the half-step suspension release",()=>{
  const ev=[...voicing([43,50,53,60],0,4,"s"),...voicing([43,50,53,59],4,4,"r")];
  const m=T.analyze(ev),f=m.facts.find(f=>f.kind==="Suspension");
  assert.ok(f);assert.match(f.text,/one semitone/);assert.ok(f.notes.includes("s3") && f.notes.includes("r3"));
});
test("an altered target cannot keep a stale suspension label",()=>{
  const ev=[...voicing([43,50,53,60],0,4,"s"),...voicing([43,50,53,58],4,4,"r")];
  assert.equal(T.analyze(ev).facts.some(f=>f.kind==="Suspension"),false);
});
test("paired dyads show fourth-to-third without claiming a full triad",()=>{
  const m=T.analyze([...voicing([51,56],0,4,"a"),...voicing([51,55],4,4,"b")]);
  assert.equal(m.regions[0].root,null);assert.ok(m.facts.some(f=>f.kind==="Fourth to third"));
});
test("symmetrical ambiguous chords do not receive a fabricated root",()=>{
  const r=T.analyze(voicing([60,64,68])).regions[0];
  assert.equal(r.root,null);assert.equal(r.alternatives.length,3);
});
test("arbitrary imported pitch collections have honest neutral labels",()=>{
  const m=T.analyze(voicing([48,49,54,58,64,71])),r=m.regions[0];
  assert.equal(r.root,null);assert.equal(T.noteInfo(m.events[0],r,m).degree,null);
  assert.equal(r.name,"Pitch collection");
});
test("analysis recomputes after note changes rather than remembering a preset name",()=>{
  const edited=voicing([60,64,67]);assert.equal(T.analyze(edited).regions[0].name,"C");
  edited[1].midi=63;assert.equal(T.analyze(edited).regions[0].name,"Cm");
});
test("released notes split the harmonic context",()=>{
  const ev=voicing([60,64,67],0,8);ev[0].durationBeats=4;
  const m=T.analyze(ev);assert.equal(m.regionAt(1).root,0);assert.equal(m.regionAt(5).root,null);
});
test("an absent palette interval returns no played example",()=>{
  const m=T.analyze(voicing([60,64,67]));
  assert.equal(T.findExample(m,{kind:"interval",interval:"minor third",fromPC:0}),null);
});
test("analysis leaves every event field intact",()=>{
  const input=structuredClone(minor),before=JSON.stringify(input);T.analyze(input,{tonic:0});
  assert.equal(JSON.stringify(input),before);
});
test("octave label conventions change text, not musical relationships",()=>{
  const fl=T.analyze(minor,{pitchLabel:m=>T.names[T.pc(m)]+Math.floor(m/12)});
  const ableton=T.analyze(minor,{pitchLabel:m=>T.names[T.pc(m)]+(Math.floor(m/12)-2)});
  assert.notEqual(fl.facts[1].title,ableton.facts[1].title);assert.equal(fl.facts[1].semitones,ableton.facts[1].semitones);
});
test("a single melody note still has a concrete lesson target",()=>{
  const m=T.analyze([note("solo",72,0,2,"melody")],{totalBeats:8});
  assert.ok(T.findExample(m,{kind:"layer",layer:"melody"}));
});
test("empty cues and harmony rests remain analyzable without invented notes",()=>{
  const m=T.analyze([],{totalBeats:4});assert.equal(m.regions.length,1);assert.equal(m.facts.length,0);
});
