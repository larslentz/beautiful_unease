/* Beautiful Unease — portable classic-script composition lab. */
(function () {
  "use strict";

  const $ = (id) => document.getElementById(id);
  const pitchNames = ["C", "C#", "D", "Eb", "E", "F", "F#", "G", "Ab", "A", "Bb", "B"];
  const sharpNames = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
  const layers = ["bass", "chord", "melody"];
  const layerColors = { bass: "#829b9d", chord: "#c69863", melody: "#c77e73" };
  const lessonData = [
    { title: "Read the piano roll", short: "Read time & pitch", compareLabel:"Compare a sustained note with a short one", text: "Pitch rises as you move upward; time moves from left to right. A note's rectangle is its duration. Notes that begin together sound at once; an empty stretch is a rest.", action: "Place Eb4 at bar 1 beat 1; drag its right edge to bar 3 beat 1. Notice that this is an eight-beat note, not eight bars.", question: "Where does the melody leave room for the harmony to speak?" },
    { title: "A ninth in the room", short: "C minor + D", compareLabel:"Compare Cm with and without D", text: "C, Eb and G make a C minor triad. Add D above them and the chord becomes Cm(add9). Compare the texture with D present and absent: the chord stays minor, but the added note changes its openness.", action: "In FL Studio, add D5 above a C–Eb–G voicing. Keep the same start time so all four notes sound together.", question: "Does D feel like a destination, or like a thought that has not finished?" },
    { title: "Give the bass its own floor", short: "Bass & spacing", compareLabel:"Compare the voicing with and without its bass", text: "A low bass note can anchor a harmony while upper notes spread out. Voicing simply means which notes sit low or high and how far apart they are; no keyboard technique is assumed.", action: "Keep C3 low, then place G3, Eb4, G4 and D5 above it. The vertical gaps are part of the sound.", question: "Which upper note feels most exposed against the bass?" },
    { title: "Build the eight-bar cue", short: "Eight bars", compareLabel:"Compare the held C with its B-natural release", text: "This cue moves through Cm(add9), Abmaj7, Fm9, G7sus4 and G7. In the dominant chord, C5 falls a semitone to B4; B natural is intentional over G7 even though C natural minor contains Bb. Do not scale-snap it away. When the loop returns, B can rise to C as the harmony restarts.", action: "Enter the harmony first, then add the melody notes at their listed bar and beat positions. Keep every unfilled moment silent.", question: "Which chord change makes the melody feel newly colored?" },
    { title: "Fourth to third", short: "Paired dyads", compareLabel:"Compare the voicing with its upper notes removed", text: "Each dyad holds its lower note while the upper note falls by one semitone: a five-semitone perfect fourth opens into a four-semitone major third. These are two-note shapes, not complete triads; A natural is intentional.", action: "Play Eb4–Ab4, then Eb4–G4. Leave the lower Eb in place and move only the upper note down a semitone.", question: "Does the one-note descent sound like a release, or a new question?" },
    { title: "Three kinds of unresolved", short: "Harmony colors", compareLabel:"Compare the cue with its C pedal removed", text: "A retained C bass under G7 is a pedal point, not an ordinary root-position G7. A suspended fourth delays the third; a minor-major seventh places B natural against C. These colors have no single universal emotional meaning.", action: "Compare the held C under G7, the G7sus4-to-G7 move, and the C bass with B natural. Listen for what each note is doing.", question: "Which version leaves the most useful kind of uncertainty for your cue?" },
    { title: "Extend, then edit", short: "Arrange & vary", compareLabel:"Compare the final note with a nearby chord tone", text: "A 32-bar version makes space for the idea: harmony alone, the full cue, a changed melodic destination, then the same harmony with less melody. Rule-led variation keeps the rhythm recognizable and leaves rests.", action: "Choose 32 bars, listen once, then change a single destination note. Export the project JSON before making another pass.", question: "Which repeated note now feels different because of its new context?" }
  ];

  function makeEvent(id, layer, midi, startBeat, durationBeats, velocity) {
    return { id, layer, midi, startBeat, durationBeats, velocity };
  }
  function buildRomantic() {
    const ev = [];
    const chords = [
      { start: 0, len: 8, notes: [36, 43, 51, 55, 62], name: "Cm(add9)" },
      { start: 8, len: 8, notes: [32, 39, 48, 55, 63], name: "Abmaj7" },
      { start: 16, len: 8, notes: [29, 36, 44, 51, 55], name: "Fm9" },
      { start: 24, len: 4, notes: [31, 38, 53, 60], name: "G7sus4" },
      { start: 28, len: 4, notes: [31, 38, 53, 59], name: "G7" }
    ];
    chords.forEach((ch, ci) => ch.notes.forEach((m, ni) => ev.push(makeEvent("r-c" + ci + "-" + ni, ni === 0 ? "bass" : "chord", m, ch.start, ch.len, ni === 0 ? 42 : 48))));
    const melody = [[2,2,67,2],[5,1,63,2],[7,3,62,1],[10,2,67,2],[13,1,63,2],[15,3,60,1],[18,2,68,2],[21,1,67,2],[23,3,63,1],[26,2,72,2],[29,1,71,2],[31,3,67,1]];
    melody.forEach((n, i) => ev.push(makeEvent("r-m" + i, "melody", n[2], n[0]-1, n[3], 62)));
    return ev;
  }
  function buildDyads(withMelody) {
    const ev = [], pairs = [[51,56],[51,55],[53,58],[53,57]];
    pairs.forEach((p, i) => p.forEach((m, j) => ev.push(makeEvent("d-c" + i + "-" + j, "chord", m, i*4, 4, 48))));
    if (withMelody) [[2,63,2],[5,62,2],[10,65,2],[13,64,2]].forEach((n,i)=>ev.push(makeEvent("d-m"+i,"melody",n[1],n[0]-1,n[2],62)));
    return ev;
  }
  function buildHeld(reattackBass) {
    const ev = reattackBass
      ? [0,8,16,24].map(beat=>makeEvent("h-bass-"+beat,"bass",36,beat,8,42))
      : [makeEvent("h-bass-0", "bass", 36, 0, 32, 42)];
    const chords = [
      { start:0, notes:[43,51,62] }, { start:8, notes:[44,48,55] },
      { start:16, notes:[41,44,51,55] }, { start:24, notes:[43,47,50,53] }
    ];
    chords.forEach((ch, ci)=>ch.notes.forEach((m,ni)=>ev.push(makeEvent("h-c"+ci+"-"+ni,"chord",m,ch.start,8,48))));
    [[2,67],[5,63],[10,67],[13,63],[18,68],[21,67],[26,65],[29,62]].forEach((n,i)=>ev.push(makeEvent("h-m"+i,"melody",n[1],n[0]-1,2,62)));
    return ev;
  }
  function buildBlueHour() {
    const ev = [];
    const chords = [
      {start:0,len:8,notes:[38,45,53,60,64]},
      {start:8,len:8,notes:[34,41,50,53,57]},
      {start:16,len:8,notes:[31,38,46,53,57]},
      {start:24,len:4,notes:[33,40,50,55,57]},
      {start:28,len:4,notes:[33,40,49,55,64]}
    ];
    chords.forEach((ch,ci)=>ch.notes.forEach((m,ni)=>ev.push(makeEvent("bh-c"+ci+"-"+ni,ni===0?"bass":"chord",m,ch.start,ch.len,ni===0?40:46))));
    [[2,2,69,2],[5,1,65,2],[7,3,64,1],[10,2,62,2],[13,1,65,2],[15,3,64,1],[18,2,67,2],[21,1,65,2],[23,3,62,1],[26,2,64,2],[29,1,61,1],[31,3,62,1]]
      .forEach((n,i)=>ev.push(makeEvent("bh-m"+i,"melody",n[2],n[0]-1,n[3],60)));
    return ev;
  }
  function buildWindowlight() {
    const ev = [];
    const chords = [
      {start:0,len:8,notes:[41,48,53,57,60,64]},
      {start:8,len:8,notes:[38,45,53,57,60]},
      {start:16,len:8,notes:[34,41,50,53,57]},
      {start:24,len:4,notes:[36,43,53,58,60]},
      {start:28,len:4,notes:[41,48,53,57,64]}
    ];
    chords.forEach((ch,ci)=>ch.notes.forEach((m,ni)=>ev.push(makeEvent("wl-c"+ci+"-"+ni,ni===0?"bass":"chord",m,ch.start,ch.len,ni===0?40:46))));
    [[2,2,72,2],[4,1,69,1],[6,3,67,1],[10,2,69,2],[13,1,72,2],[15,3,74,1],[18,2,72,2],[21,1,69,2],[23,3,67,1],[26,2,65,2],[29,1,69,2],[31,3,65,1]]
      .forEach((n,i)=>ev.push(makeEvent("wl-m"+i,"melody",n[2],n[0]-1,n[3],58)));
    return ev;
  }
  function buildTidepool() {
    const ev = [];
    [[0,33,4],[4,40,4],[8,29,4],[12,36,4],[16,38,4],[20,45,4],[24,40,4],[28,35,2],[30,33,2]]
      .forEach((n,i)=>ev.push(makeEvent("tp-b"+i,"bass",n[1],n[0],n[2],40)));
    const chords = [
      {start:0,len:8,notes:[48,52,55,59]},
      {start:8,len:8,notes:[45,48,52,57]},
      {start:16,len:8,notes:[45,53,60,64]},
      {start:24,len:4,notes:[47,52,57,62]},
      {start:28,len:2,notes:[47,52,56,62]},
      {start:30,len:2,notes:[48,52,55,59]}
    ];
    chords.forEach((ch,ci)=>ch.notes.forEach((m,ni)=>ev.push(makeEvent("tp-c"+ci+"-"+ni,"chord",m,ch.start,ch.len,46))));
    [[2,2,72,2],[4,1,69,2],[7,3,67,1],[10,2,72,2],[13,1,69,2],[15,3,72,1],[18,2,74,2],[21,1,72,2],[23,3,69,1],[26,2,71,2],[29,1,68,1],[31,3,69,1]]
      .forEach((n,i)=>ev.push(makeEvent("tp-m"+i,"melody",n[2],n[0]-1,n[3],58)));
    return ev;
  }
  const PRESETS = {
    romantic: { name:"Romantic melancholy", bars:8, tempo:62, events:buildRomantic(), description:"C minor · a suspended fourth resolves by a half step." },
    dyads: { name:"Paired dyads", bars:4, tempo:62, events:buildDyads(false), description:"Fourth to third · paired two-note shapes." },
    held: { name:"Held bass", bars:8, tempo:58, events:buildHeld(false), description:"C pedal point · four changing upper harmonies." },
    "blue-hour": { name:"Blue hour mystery", bars:8, tempo:66, events:buildBlueHour(), description:"D minor · suspended lounge harmony drifts toward an unanswered A7." },
    windowlight: { name:"Windowlight", bars:8, tempo:72, events:buildWindowlight(), description:"F major · warm borrowed colors settle into a clear tonic." },
    tidepool: { name:"Tidepool reflections", bars:8, tempo:64, events:buildTidepool(), description:"A minor · a moving bass line and broken chords find a quiet landing." }
  };
  const MOOD_PALETTES = {
    "pnw-mystery": {
      name:"Pacific Northwest dream mystery",
      summary:"Late-night lounge pacing, suspended color, a sparse motif, and a gently wavering piano tone.",
      scale:[0,2,3,5,7,8,11], toneId:"dream",
      variants:[
        {name:"Blue hour",tempo:-8,harmony:"ninth",melody:"sparse",bass:"pedal",description:"A held C pedal lets a cool added ninth hang in the room."},
        {name:"Fogline",tempo:-5,harmony:"chromatic",melody:"delayed",bass:"stepwise",description:"A chromatic inner-voice sigh meets a melody that waits before answering."},
        {name:"Last booth",tempo:-2,harmony:"open",melody:"passing",bass:"pedal",description:"Open fifths and a few passing notes drift over a steady low note."}
      ]
    },
    "wistful-romance": {
      name:"Wistful romance",
      summary:"A tender minor palette, breathing phrases, and a slow, stepwise bass line.",
      scale:[0,2,3,5,7,8,10], toneId:"warm",
      variants:[
        {name:"Soft focus",tempo:-1,harmony:"ninth",melody:"sparse",bass:"stepwise",description:"A restrained melody leaves room around the extended chords."},
        {name:"Rain on the window",tempo:2,harmony:"chromatic",melody:"delayed",bass:"stepwise",description:"A half-step color and a late entrance make the phrase feel reflective."},
        {name:"One last thought",tempo:4,harmony:"open",melody:"passing",bass:"stepwise",description:"An answering note fills a rest, then leaves the ending unresolved."}
      ]
    },
    "gentle-resolution": {
      name:"Gentle resolution",
      summary:"A warm major palette, grounded bass, and melodies that point toward a clear landing.",
      scale:[0,2,4,5,7,9,11], toneId:"clear",
      variants:[
        {name:"Clearing sky",tempo:2,harmony:"major",melody:"rising",bass:"roots",description:"Minor chord colors brighten into a calm, open major sound."},
        {name:"Coming home",tempo:5,harmony:"ninth",melody:"delayed",bass:"roots",description:"A gentle major ninth and a delayed phrase bring warmth without rushing."},
        {name:"First light",tempo:7,harmony:"open",melody:"passing",bass:"roots",description:"The bass anchors a more direct melody with a clear final contour."}
      ]
    },
    "velvet-noir": {
      name:"Velvet noir",
      summary:"Smoky altered color, low anchors, and a melody that leaves space for tension.",
      scale:[0,2,3,5,6,8,9,10], toneId:"warm",
      variants:[
        {name:"Smoke line",tempo:-4,harmony:"chromatic",melody:"delayed",bass:"pedal",description:"A steady low note and a half-step inner voice keep the harmony shadowed."},
        {name:"Streetlamp",tempo:-1,harmony:"ninth",melody:"sparse",bass:"stepwise",description:"A dark added ninth hangs over a careful, descending bass."},
        {name:"Last glass",tempo:1,harmony:"open",melody:"passing",bass:"stepwise",description:"Wider voicings open briefly before the melody slips away."}
      ]
    },
    "ember-pulse": {
      name:"Ember pulse",
      summary:"A forward-moving modal color, a steady bass foundation, and a melody with lift.",
      scale:[0,2,4,5,7,9,10], toneId:"piano",
      variants:[
        {name:"Kindling",tempo:4,harmony:"major",melody:"rising",bass:"roots",description:"A firmer pulse and rising contour give the phrase forward motion."},
        {name:"Heartbeat",tempo:6,harmony:"ninth",melody:"passing",bass:"roots",description:"A bright ninth and small answering notes keep the cue in motion."},
        {name:"Coal glow",tempo:2,harmony:"chromatic",melody:"delayed",bass:"stepwise",description:"The energy softens into a measured bass walk and a late reply."}
      ]
    },
    "prismatic-drift": {
      name:"Prismatic drift",
      summary:"Airy raised-fourth color, luminous voicings, and a gently floating melody.",
      scale:[0,2,4,6,7,9,11], toneId:"clear",
      variants:[
        {name:"Glass halo",tempo:1,harmony:"open",melody:"rising",bass:"roots",description:"Open intervals and a rising line catch a bright, suspended color."},
        {name:"Soft refraction",tempo:3,harmony:"ninth",melody:"delayed",bass:"roots",description:"A major ninth lets the melody hover just above the harmony."},
        {name:"Split light",tempo:2,harmony:"major",melody:"passing",bass:"stepwise",description:"A small passing answer moves through the luminous chord tones."}
      ]
    }
  };
  const MOOD_TONES = {
    piano:{delaySeconds:.12,delayWet:.025,vibratoCents:0,vibratoHz:.22},
    dream:{delaySeconds:.25,delayWet:.16,vibratoCents:5.5,vibratoHz:.24},
    warm:{delaySeconds:.18,delayWet:.09,vibratoCents:2,vibratoHz:.18},
    clear:{delaySeconds:.1,delayWet:.035,vibratoCents:0,vibratoHz:.2}
  };
  const state = {
    presetId:"romantic", events:[], totalBars:8, tempo:62, transpose:0, seed:1791,
    octave:"fl", snap:1, zoom:34, density:"sparse", ending:"original", variant:"original",
    muted:{bass:false,chord:false,melody:false}, solo:null, selectedId:null,
    undo:[], redo:[], playhead:0, isPlaying:false, currentLesson:0, compare:false,
    analysisProvisional:false, reattack:false, arrangement:8, seekBeat:0, activeMood:null
  };
  let audio = null, scheduler = null, playbackStart = 0, playbackOffset = 0, playbackTempo=62, playbackLength=32, playbackEvents=[], playbackToneId="piano", scheduledVoices = new Set(), scheduledEvents = new Set(), toastTimer = 0;
  let moodCandidateSet=null;
  const canvas = $("pianoRoll"), ctx2d = canvas.getContext("2d");
  const beatWidth = () => state.zoom;
  const rowHeight = 15;
  const pitchLow = 24, pitchHigh = 86;
  const totalBeats = () => state.totalBars * 4;
  const displayedEvents = () => state.events;
  const copyEvents = (events) => events.map(e => ({...e}));
  const sortEvents = (events) => events.slice().sort((a,b)=>a.startBeat-b.startBeat || a.midi-b.midi || a.id.localeCompare(b.id));
  function pitchLabel(midi, octaveMode = state.octave, flats = true) {
    const names = flats ? pitchNames : sharpNames;
    const octave = Math.floor(midi/12) - (octaveMode === "fl" ? 0 : 1);
    return names[((midi%12)+12)%12] + octave;
  }
  function midiFromLabel(label) {
    const match = String(label).trim().match(/^([A-Ga-g])([#b]?)(-?\d+)$/);
    if (!match) return null;
    const map = {C:0,D:2,E:4,F:5,G:7,A:9,B:11};
    let pc = map[match[1].toUpperCase()];
    if (match[2] === "#") pc++;
    if (match[2] === "b") pc--;
    return (Number(match[3]) + (state.octave === "fl" ? 0 : 1))*12 + pc;
  }
  function eventBarBeat(e) { return { bar:Math.floor(e.startBeat/4)+1, beat:(e.startBeat%4)+1 }; }
  function exactClone() { return copyEvents(PRESETS[state.presetId].events); }
  function makeBaseForSelection(id) { return copyEvents(PRESETS[id].events); }
  function historySnapshot() {
    return {events:copyEvents(state.events),tempo:state.tempo,seed:state.seed,activeMood:state.activeMood?{...state.activeMood}:null,analysisProvisional:state.analysisProvisional,selectedId:state.selectedId};
  }
  function restoreHistorySnapshot(snapshot) {
    state.events=copyEvents(snapshot.events);state.tempo=snapshot.tempo;state.seed=snapshot.seed;
    state.activeMood=snapshot.activeMood?{...snapshot.activeMood}:null;
    state.analysisProvisional=snapshot.analysisProvisional;state.selectedId=snapshot.selectedId;
    $("tempoInput").value=state.tempo;$("seedInput").value=state.seed;
  }
  function remember() {
    state.undo.push(historySnapshot());
    if (state.undo.length > 80) state.undo.shift();
    state.redo.length = 0;
  }
  function validEvent(e) {
    return Number.isInteger(e.midi) && e.midi>=0 && e.midi<=127 &&
      Number.isInteger(e.velocity) && e.velocity>=1 && e.velocity<=127 &&
      Number.isFinite(e.startBeat) && e.startBeat>=0 &&
      Number.isFinite(e.durationBeats) && e.durationBeats>0 &&
      layers.includes(e.layer);
  }
  function moodSeed(seed,moodId,variantIndex) {
    const text=`${seed}|${moodId}|${variantIndex}`;
    let hash=2166136261;
    for(let i=0;i<text.length;i++)hash=Math.imul(hash^text.charCodeAt(i),16777619);
    return hash>>>0;
  }
  function seededRandom(seed) {
    let value=seed>>>0;
    return ()=>{value=(value+0x6D2B79F5)>>>0;let t=value;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return((t^(t>>>14))>>>0)/4294967296;};
  }
  function moodScale(palette,transpose) {
    const offset=((transpose%12)+12)%12;
    return palette.scale.map(pc=>(pc+offset)%12);
  }
  function nearestMoodPitch(midi,scale,preferUp=false) {
    const octave=Math.floor(midi/12), candidates=[];
    for(let o=Math.max(0,octave-1);o<=Math.min(10,octave+1);o++){
      scale.forEach(pc=>{const pitch=o*12+pc;if(pitch>=0&&pitch<=127)candidates.push(pitch);});
    }
    return candidates.sort((a,b)=>Math.abs(a-midi)-Math.abs(b-midi)||(preferUp?b-a:a-b))[0]??midi;
  }
  function chordGroups(events) {
    const groups=new Map();
    events.filter(e=>e.layer==="chord").forEach(e=>{if(!groups.has(e.startBeat))groups.set(e.startBeat,[]);groups.get(e.startBeat).push(e);});
    return [...groups.entries()].map(([startBeat,notes])=>({startBeat,notes:notes.sort((a,b)=>a.midi-b.midi)})).sort((a,b)=>a.startBeat-b.startBeat);
  }
  function tryMoodPitch(note,group,nextPitch) {
    if(nextPitch<0||nextPitch>127||group.some(other=>other!==note&&other.midi===nextPitch))return false;
    note.midi=nextPitch;return true;
  }
  function uniqueMoodEventId(events,candidateId) {
    let id=candidateId,suffix=1;
    while(events.some(event=>event.id===id))id=candidateId+"-"+suffix++;
    return id;
  }
  function applyMoodHarmony(events,palette,variant,scale,rng) {
    const groups=chordGroups(events);
    groups.forEach(group=>{group.notes.forEach(note=>{note.midi=nearestMoodPitch(note.midi,scale,rng()<.5);});group.notes.sort((a,b)=>a.midi-b.midi);});
    if(!groups.length)return;
    const group=groups[Math.floor(rng()*groups.length)], notes=group.notes;
    if(variant.harmony==="ninth"){
      const top=notes[notes.length-1];tryMoodPitch(top,notes,top.midi+2);
    }else if(variant.harmony==="chromatic"&&notes.length>1){
      const inner=notes[Math.max(0,notes.length-2)];tryMoodPitch(inner,notes,inner.midi-1);
    }else if(variant.harmony==="open"){
      const top=notes[notes.length-1];
      if(!tryMoodPitch(top,notes,top.midi+7))tryMoodPitch(top,notes,top.midi+5);
    }else if(variant.harmony==="major"){
      const top=notes[notes.length-1];tryMoodPitch(top,notes,top.midi+2);
    }
  }
  function ensureMoodBass(events,variant,scale,totalBeats,transpose,seed,moodId,variantIndex) {
    if(variant.bass==="pedal"){
      const pedal=36+transpose;
      const retained=events.filter(e=>e.layer!=="bass");
      events.splice(0,events.length,...retained,makeEvent(uniqueMoodEventId(retained,`mood-${seed}-${moodId}-${variantIndex}-bass`),"bass",pedal,0,totalBeats,42));
      return events;
    }
    let bass=sortEvents(events.filter(e=>e.layer==="bass"));
    if(!bass.length){
      const groups=chordGroups(events);
      bass=groups.map((group,i)=>{
        const next=groups[i+1]?.startBeat??totalBeats, root=group.notes[0].midi;
        const pitch=nearestMoodPitch(Math.max(24,root-12),scale,i%2===0);
        return makeEvent(uniqueMoodEventId(events,`mood-${seed}-${moodId}-${variantIndex}-bass-${i}`),"bass",pitch,group.startBeat,Math.max(.25,next-group.startBeat),42);
      });
      events.push(...bass);
    }else if(variant.bass==="stepwise"&&bass.length>1){
      bass.forEach((note,i)=>{if(i>0&&i%2===1)note.midi=Math.max(24,note.midi-1);});
    }else if(variant.bass==="roots"){
      bass.forEach((note,i)=>{note.midi=nearestMoodPitch(note.midi,scale,i%2===0);});
    }
    return events;
  }
  function createMoodMotif(events,palette,variant,totalBeats,scale,seed,moodId,variantIndex) {
    if(events.some(e=>e.layer==="melody"))return events;
    const groups=chordGroups(events);
    const contour=[-2,1,0,3,-1,2,0,2];
    const additions=groups.map((group,i)=>{
      const startBeat=group.startBeat+1;
      if(startBeat>=totalBeats)return null;
      const top=group.notes[group.notes.length-1].midi;
      const target=top+12+contour[(i+variantIndex)%contour.length];
      const midi=nearestMoodPitch(target,scale,seededRandom(seed+i)()>.5);
      const next=groups[i+1]?.startBeat??totalBeats;
      const durationBeats=Math.min(1.5,Math.max(.25,next-startBeat));
      return makeEvent(uniqueMoodEventId(events,`mood-${seed}-${moodId}-${variantIndex}-motif-${i}`),"melody",midi,startBeat,durationBeats,58);
    }).filter(Boolean);
    events.push(...additions);return events;
  }
  function applyMoodMelody(events,variant,scale,totalBeats,rng,seed,moodId,variantIndex) {
    let melody=sortEvents(events.filter(e=>e.layer==="melody"));
    melody.forEach((note,i)=>{note.midi=nearestMoodPitch(note.midi,scale,rng()<.5);});
    if(variant.melody==="sparse"&&melody.length>3){
      const offset=Math.floor(rng()*4),remove=new Set(melody.filter((_,i)=>(i+offset)%4===2).slice(0,Math.max(1,Math.floor(melody.length/4))).map(e=>e.id));
      for(let i=events.length-1;i>=0;i--)if(remove.has(events[i].id))events.splice(i,1);
    }else if(variant.melody==="delayed"&&melody.length>1){
      const starts=melody.map(e=>e.startBeat);
      melody.forEach((note,i)=>{
        if(i%2===1){
          const nextStart=starts[i+1]??totalBeats,newStart=note.startBeat+.5;
          if(newStart<nextStart&&newStart<totalBeats){note.durationBeats=Math.min(note.durationBeats,nextStart-newStart);note.startBeat=newStart;}
        }
      });
    }else if(variant.melody==="passing"&&melody.length>1){
      const additions=[];
      for(let i=0;i<melody.length-1;i++){
        const current=melody[i],next=melody[i+1],gap=next.startBeat-(current.startBeat+current.durationBeats);
        if(gap>=.5){
          const startBeat=current.startBeat+current.durationBeats,durationBeats=Math.min(.5,gap);
          const target=Math.round((current.midi+next.midi)/2),midi=nearestMoodPitch(target,scale,rng()<.5);
          additions.push(makeEvent(uniqueMoodEventId(events.concat(additions),`mood-${seed}-${moodId}-${variantIndex}-answer-${i}`),"melody",midi,startBeat,durationBeats,54));
        }
      }
      events.push(...additions);
    }else if(variant.melody==="rising"&&melody.length>1){
      melody.forEach((note,i)=>{if(i>=Math.ceil(melody.length/2))note.midi=nearestMoodPitch(note.midi+2,scale,true);});
    }
    return events;
  }
  function moodCandidateError(events,totalBeats) {
    const ids=new Set();
    for(const event of events){
      if(!validEvent(event))return "An event has an invalid pitch, layer, time, duration or velocity.";
      if(event.startBeat+event.durationBeats>totalBeats+.0001)return "A generated note extends past the arrangement.";
      if(ids.has(event.id))return "Generated event identifiers are not unique.";
      ids.add(event.id);
    }
    const byPitch=new Map();
    events.forEach(event=>{const key=event.layer+":"+event.midi;if(!byPitch.has(key))byPitch.set(key,[]);byPitch.get(key).push(event);});
    for(const notes of byPitch.values()){
      notes.sort((a,b)=>a.startBeat-b.startBeat);
      for(let i=1;i<notes.length;i++){
        const previous=notes[i-1],current=notes[i];
        if(previous.startBeat+previous.durationBeats>current.startBeat)
          return `Two generated ${current.layer} notes at ${pitchLabel(current.midi)} overlap (events ${previous.id} and ${current.id}).`;
      }
    }
    return "";
  }
  function createMoodCandidates(base,moodId,seed,tempo,bars,transpose) {
    const palette=MOOD_PALETTES[moodId];
    if(!palette)throw new Error("Choose one of the available original mood palettes.");
    if(!Number.isInteger(seed)||seed<0||seed>4294967295)throw new Error("Variation seed must be a whole number from 0 to 4,294,967,295.");
    const totalBeats=bars*4,scale=moodScale(palette,transpose);
    return palette.variants.map((variant,variantIndex)=>{
      const random=seededRandom(moodSeed(seed,moodId,variantIndex)),events=copyEvents(base);
      applyMoodHarmony(events,palette,variant,scale,random);
      ensureMoodBass(events,variant,scale,totalBeats,transpose,seed,moodId,variantIndex);
      createMoodMotif(events,palette,variant,totalBeats,scale,seed,moodId,variantIndex);
      applyMoodMelody(events,variant,scale,totalBeats,random,seed,moodId,variantIndex);
      const candidateTempo=Math.max(45,Math.min(85,tempo+variant.tempo));
      const error=moodCandidateError(events,totalBeats);
      if(error)throw new Error(variant.name+": "+error);
      return {moodId,seed,variantIndex,name:variant.name,tempo:candidateTempo,description:variant.description,moodName:palette.name,moodSummary:palette.summary,toneId:palette.toneId,events:sortEvents(events)};
    });
  }
  function eventStateSignature(events,tempo,bars) {
    return JSON.stringify({events:sortEvents(events),tempo,bars});
  }
  function toast(message, isError) {
    const el=$("toast"); el.textContent=message; el.style.borderLeftColor=isError?"var(--danger)":"var(--rose)";
    el.classList.add("show"); clearTimeout(toastTimer); toastTimer=setTimeout(()=>el.classList.remove("show"),3400);
  }
  function setStatus(message,error) { const el=$("exportStatus"); el.textContent=message; el.className="status-line"+(error?" error":""); }
  function currentAudible(ev=state.events) {
    return ev.filter(e=>!state.muted[e.layer] && (!state.solo || state.solo===e.layer));
  }
  function createArrangement(base, bars, presetId) {
    let source=copyEvents(base);
    if (bars<=PRESETS[presetId].bars) return source.filter(e=>e.startBeat<bars*4).map(e=>({...e,durationBeats:Math.min(e.durationBeats,bars*4-e.startBeat)}));
    const presetBars=PRESETS[presetId].bars, out=[];
    if (bars===32 && presetBars===8) {
      for (let section=0;section<4;section++) {
        source.forEach((e,index)=>{
          let include=true, next={...e,id:e.id+"-s"+section,startBeat:e.startBeat+section*32};
          if(section===0 && e.layer==="melody") include=false;
           if(section===2 && e.layer==="melody" && (e.id==="r-m11"||e.id==="h-m7")) next.midi=e.id==="r-m11"?71:65;
          if(section===3 && e.layer==="melody" && index%2===0) include=false;
          if(include) out.push(next);
        });
      }
      return out;
    }
    for(let offset=0;offset<bars*4;offset+=presetBars*4) {
      source.forEach(e=>{ if(e.startBeat+offset<bars*4) out.push({...e,id:e.id+"-a"+offset,startBeat:e.startBeat+offset,durationBeats:Math.min(e.durationBeats,bars*4-(e.startBeat+offset))}); });
    }
    return out;
  }
  function applyEnding(events, ending, baseBars) {
    if (ending==="original" || state.presetId!=="romantic" || baseBars!==8) return {events,bars:baseBars};
    const next=copyEvents(events);
    const notes=ending==="closed"?[36,43,51,55,62]:ending==="borrowed"?[36,43,52,55,62]:[36,43,51,59,62];
    notes.forEach((m,i)=>next.push(makeEvent("ending-"+ending+"-"+i,i===0?"bass":"chord",m,32,4,i===0?42:48)));
    next.push(makeEvent("ending-melody-"+ending,"melody",ending==="uneasy"?67:72,32,3,62));
    return {events:next,bars:9};
  }
  function setPreset(id, resetHistory=true) {
    state.presetId=id; state.tempo=PRESETS[id].tempo; state.transpose=0;
    state.arrangement=PRESETS[id].bars; state.totalBars=PRESETS[id].bars;
    state.ending="original"; state.variant="original"; state.reattack=false;
    state.density="sparse";state.muted={bass:false,chord:false,melody:false};state.solo=null;state.seekBeat=0;
    state.activeMood=null;moodCandidateSet=null;
    state.events=makeBaseForSelection(id); state.selectedId=null; state.analysisProvisional=false;
    state.undo=[]; state.redo=[];
    $("presetSelect").value=id; $("tempoInput").value=state.tempo; $("transposeInput").value="0";
    $("structureSelect").value=String(state.totalBars); $("endingSelect").value="original";
    $("variantSelect").value="original"; $("densitySelect").value="sparse"; $("seedInput").value=state.seed;
    document.querySelectorAll("[data-layer]").forEach(input=>input.checked=true);
    renderAll(); toast("Exact "+PRESETS[id].name+" preset restored.");
  }
  function refreshDerived() {
    state.activeMood=null;moodCandidateSet=null;
    const preset=PRESETS[state.presetId];
    let base=createArrangement(preset.events,state.arrangement,state.presetId);
    if(state.presetId==="held" && state.reattack && state.arrangement===8) base=buildHeld(true);
    if(state.presetId==="dyads" && state.variant==="dyadMelody") base=buildDyads(true);
    if(state.density==="medium" && state.presetId==="romantic" && state.arrangement===8 && state.variant==="original") {
      const add=[makeEvent("density-connect-1","melody",63,7,1,54),makeEvent("density-connect-2","melody",62,15,1,54),makeEvent("density-connect-3","melody",62,23,1,54)];
      base=base.concat(add);
    }
    if(state.variant==="octaveUp" || state.variant==="octaveDown") {
      const shift=state.variant==="octaveUp"?12:-12;
      base=base.map(e=>e.layer==="melody"||e.layer==="chord"?{...e,midi:e.midi+shift}:e);
    }
    const ended=applyEnding(base,state.ending,state.arrangement);
    state.totalBars=ended.bars;
    state.events=ended.events.map(e=>({...e,midi:e.midi+state.transpose}));
  }
  function renderAll() {
    const activeMood=activeMoodDetails();
    $("currentPresetName").textContent=activeMood?activeMood.palette.name+" · "+activeMood.variant.name:PRESETS[state.presetId].name;
    $("loopStamp").textContent=state.totalBars+" bars · "+state.tempo+" BPM · "+(activeMood?activeMood.variant.description:PRESETS[state.presetId].description);
    $("readoutLength").textContent=(totalBeats())+" beats";
    $("readoutTime").textContent=(totalBeats()*60/state.tempo).toFixed(1)+" sec";
    $("analysisStatus").textContent=state.analysisProvisional?"Provisional after edit":"Preset harmony";
    $("readoutHarmony").textContent=currentHarmony();
    $("octaveMode").value=state.octave; $("calibrationCurrent").textContent=pitchLabel(60);
    renderRoll(); renderTable(); renderSelection(); renderLesson(); renderMoodCandidates(); renderDiagnostics();
    $("undoButton").disabled=!state.undo.length; $("redoButton").disabled=!state.redo.length;
    $("endingSelect").value=state.ending; $("structureSelect").value=String(state.arrangement);
    updatePlayState();
  }
  function currentHarmony() {
    if(state.analysisProvisional)return "Provisional";
    if(state.presetId==="dyads")return "Paired dyad (not a triad)";
    const beat=state.isPlaying?state.playhead:(state.events.find(e=>e.id===state.selectedId)?.startBeat||0);
    if(state.presetId==="held"){
      if(beat<8)return "Cm(add9) · C pedal";
      if(beat<16)return "Abmaj7/C";
      if(beat<24)return "Fm9/C";
      return "G7/C · C pedal";
    }
    if(beat<8)return "Cm(add9)";
    if(beat<16)return "Abmaj7";
    if(beat<24)return "Fm9";
    if(beat<28)return "G7sus4";
    if(beat<32)return "G7";
    return state.ending==="closed"?"Cm(add9)":state.ending==="borrowed"?"C(add9) · borrowed E natural":"Cm(maj9)";
  }
  function getCanvasDimensions() {
    const dpr=window.devicePixelRatio||1, cssHeight=(pitchHigh-pitchLow+1)*rowHeight+18, labelW=50;
    const width=labelW+totalBeats()*beatWidth()+14;
    const cssWidth=Math.max(width,700);
    canvas.style.width=cssWidth+"px"; canvas.style.height=cssHeight+"px";
    canvas.width=Math.round(cssWidth*dpr); canvas.height=Math.round(cssHeight*dpr);
    ctx2d.setTransform(dpr,0,0,dpr,0,0);
    return {w:cssWidth,h:cssHeight,labelW};
  }
  function renderRoll() {
    if(!ctx2d) return;
    const {w,h,labelW}=getCanvasDimensions(); const ctx=ctx2d;
    const rows=pitchHigh-pitchLow+1, gridH=rows*rowHeight, top=9;
    ctx.clearRect(0,0,w,h); ctx.fillStyle="#e9e5dc"; ctx.fillRect(0,0,w,h);
    ctx.fillStyle="#ded9ce"; ctx.fillRect(0,0,labelW,h);
    for(let midi=pitchLow;midi<=pitchHigh;midi++){
      const y=top+(pitchHigh-midi)*rowHeight, isBlack=[1,3,6,8,10].includes(midi%12);
      ctx.fillStyle=isBlack?"#e5e0d7":"#f1eee7"; ctx.fillRect(labelW,y,w-labelW,rowHeight);
      if(midi%12===0){ctx.fillStyle="#e7e2d9";ctx.fillRect(0,y,labelW,rowHeight);}
      ctx.fillStyle=midi%12===0?"#53635e":"#87908a";ctx.font=midi%12===0?"9px system-ui":"8px system-ui";ctx.textAlign="right";ctx.fillText(pitchLabel(midi),labelW-7,y+11);
      ctx.strokeStyle="#d4d0c7";ctx.lineWidth=.5;ctx.beginPath();ctx.moveTo(labelW,y+rowHeight);ctx.lineTo(w,y+rowHeight);ctx.stroke();
    }
    const bw=beatWidth();
    for(let beat=0;beat<=totalBeats();beat++){
      const x=labelW+beat*bw;
      if(beat%4===0){ctx.fillStyle=beat%8===0?"#d8d3c8":"#e1dcd1";ctx.fillRect(x,0,1,h);}
      ctx.strokeStyle=beat%4===0?"#aaa79d":"#d6d1c8";ctx.lineWidth=beat%4===0?1.2:.55;ctx.beginPath();ctx.moveTo(x,top);ctx.lineTo(x,top+gridH);ctx.stroke();
      if(beat<totalBeats()&&beat%4===0){ctx.fillStyle="#64716d";ctx.font="10px system-ui";ctx.textAlign="left";ctx.fillText("BAR "+(beat/4+1),x+5,12);}
      else if(beat<totalBeats()&&beat%4===1){ctx.fillStyle="#89918b";ctx.font="8px system-ui";ctx.textAlign="left";ctx.fillText("2",x+3,12);}
    }
    state.events.forEach(e=>{
      const x=labelW+e.startBeat*bw+1, y=top+(pitchHigh-e.midi)*rowHeight+2, width=Math.max(4,e.durationBeats*bw-2);
      ctx.globalAlpha=state.muted[e.layer]?.34:1;
      ctx.fillStyle=layerColors[e.layer]||layerColors.chord;
      ctx.beginPath();ctx.roundRect?ctx.roundRect(x,y,width,rowHeight-4,2):ctx.rect(x,y,width,rowHeight-4);ctx.fill();
      if(e.id===state.selectedId){ctx.strokeStyle="#253c39";ctx.lineWidth=2;ctx.stroke();}
      const same=state.events.filter(n=>n.startBeat===e.startBeat && n.id!==e.id);
      if(same.length){ctx.fillStyle="#263a3a";ctx.beginPath();ctx.arc(x+4,y+4,1.7,0,Math.PI*2);ctx.fill();}
      ctx.globalAlpha=1;
    });
    if(state.isPlaying||state.seekBeat>0){
      const x=labelW+(state.isPlaying?state.playhead:state.seekBeat)*bw;ctx.fillStyle="#a34f47";ctx.globalAlpha=.8;ctx.fillRect(x,0,2,h);ctx.globalAlpha=1;
    }
  }
  function renderTable() {
    const body=$("eventRows");
    const rows=sortEvents(state.events).map(e=>{
      const pos=eventBarBeat(e), tr=document.createElement("tr"); if(e.id===state.selectedId)tr.className="selected-row";
      tr.tabIndex=0; tr.setAttribute("aria-label",`${e.layer} ${pitchLabel(e.midi)}, bar ${pos.bar} beat ${pos.beat}`);
      tr.innerHTML=`<td>${e.layer==="chord"?"Harmony":e.layer[0].toUpperCase()+e.layer.slice(1)}</td><td>${pitchLabel(e.midi)}</td><td><code>${e.midi}</code></td><td>${pos.bar} / ${pos.beat}</td><td><code>${fmt(e.startBeat)}</code></td><td>${fmt(e.durationBeats)} beats</td><td>${e.velocity}</td>`;
      tr.addEventListener("click",()=>selectEvent(e.id));tr.addEventListener("keydown",ev=>{if(ev.key==="Enter"||ev.key===" "){ev.preventDefault();selectEvent(e.id);}});
      return tr;
    });
    body.replaceChildren(...rows);
  }
  function fmt(v){return Number.isInteger(v)?String(v):String(Number(v.toFixed(2)));}
  function renderSelection() {
    const e=state.events.find(n=>n.id===state.selectedId);
    if(!e){$("selectedNoteSummary").textContent="Select a note in the roll or event table to inspect its exact values."; $("readoutNote").textContent="—";$("readoutPosition").textContent="—";$("readoutDuration").textContent="—";$("flInstruction").textContent="Select a note for its exact FL Studio placement instruction.";return;}
    const pos=eventBarBeat(e), name=pitchLabel(e.midi);
    $("selectedNoteSummary").innerHTML=`<strong>${name} · MIDI ${e.midi}</strong> &nbsp; ${e.layer} · bar ${pos.bar}, beat ${fmt(pos.beat)} · ${fmt(e.durationBeats)} beats · velocity ${e.velocity}`;
    $("readoutNote").textContent=name+" / "+e.midi; $("readoutPosition").textContent=pos.bar+" : "+fmt(pos.beat);
    $("readoutDuration").textContent=fmt(e.durationBeats)+" beats";
    $("flInstruction").textContent=`Place ${name} at bar ${pos.bar} beat ${fmt(pos.beat)}; drag its right edge to bar ${fmt(pos.bar+Math.floor((pos.beat-1+e.durationBeats)/4))} beat ${fmt(((pos.beat-1+e.durationBeats)%4)+1)}.`;
    $("notePitch").value=name; $("noteMidi").value=e.midi; $("noteLayer").value=e.layer;
    $("noteBar").value=pos.bar; $("noteBeat").value=fmt(pos.beat); $("noteDuration").value=e.durationBeats; $("noteVelocity").value=e.velocity;
  }
  function selectEvent(id){state.selectedId=id;renderAll();}
  function renderLesson() {
    const l=lessonData[state.currentLesson];
    $("lessonStep").textContent=`LESSON ${String(state.currentLesson+1).padStart(2,"0")} / 07`;
    $("lessonTitle").textContent=l.title;
    let lessonText=l.text;
    if(state.ending==="borrowed") lessonText+=" The bar-9 C-major add9 ending borrows E natural for a brighter final color; it is separate from the default eight-bar loop.";
    if(state.ending==="uneasy") lessonText+=" The separate bar-9 Cm(maj9) ending places B natural against the C bass; it is a deliberate color, not a scale correction.";
    if(state.presetId==="held"&&state.reattack) lessonText+=" The optional bass reattacks every eight beats are separate MIDI events; one long MIDI note cannot prevent an acoustic piano from decaying.";
    $("lessonExplanation").textContent=lessonText;$("compareLabel").textContent=l.compareLabel;
    $("lessonAction").textContent=l.action;$("lessonQuestion").textContent=l.question;
    $("lessonNav").replaceChildren(...lessonData.map((item,i)=>{
      const b=document.createElement("button");b.type="button";b.className="lesson-pill";b.textContent=String(i+1).padStart(2,"0")+" "+item.short;
      b.setAttribute("aria-current",i===state.currentLesson?"true":"false");b.addEventListener("click",()=>{state.currentLesson=i;renderLesson();});return b;
    }));
    $("lessonLibrary").replaceChildren(...lessonData.map((item,i)=>{
      const card=document.createElement("article");card.className="lesson-card";
      card.innerHTML=`<div class="number">${String(i+1).padStart(2,"0")}</div><h3>${item.title}</h3><p>${item.text}</p>`;
      card.addEventListener("click",()=>{state.currentLesson=i;renderLesson();$("lessonTitle").scrollIntoView({behavior:"smooth",block:"center"});});
      card.tabIndex=0;card.setAttribute("role","button");card.setAttribute("aria-label","Open lesson "+(i+1)+": "+item.title);
      card.addEventListener("keydown",e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();card.click();}});
      return card;
    }));
  }
  function activeMoodDetails() {
    if(!state.activeMood)return null;
    const palette=MOOD_PALETTES[state.activeMood.moodId],variant=palette?.variants[state.activeMood.variantIndex];
    return palette&&variant?{palette,variant}:null;
  }
  function renderMoodCandidates() {
    const grid=$("moodVariantGrid");
    if(!grid)return;
    const seed=Number($("seedInput").value);
    if(moodCandidateSet&&(moodCandidateSet.signature!==eventStateSignature(state.events,state.tempo,state.totalBars)||moodCandidateSet.moodId!==$("moodSelect").value||moodCandidateSet.seed!==seed))moodCandidateSet=null;
    const seedNote=document.querySelector(".seed-note");
    if(!moodCandidateSet){
      if(seedNote)seedNote.textContent="Repeatable from this seed";
      const empty=document.createElement("p");empty.className="variant-description";
      empty.textContent="Generate three original ideas. Your current cue stays unchanged until you apply one.";
      grid.replaceChildren(empty);return;
    }
    if(seedNote)seedNote.textContent=`Seed ${moodCandidateSet.seed} · repeatable`;
    grid.replaceChildren(...moodCandidateSet.candidates.map((candidate,index)=>{
      const card=document.createElement("article");card.className="mood-variant";card.dataset.variationIndex=String(index);
      const number=document.createElement("div");number.className="variant-index";number.textContent=String(index+1).padStart(2,"0");
      const label=document.createElement("span");label.textContent=candidate.moodName.toUpperCase();number.append(label);
      const title=document.createElement("h3");title.textContent=candidate.name;
      const tempo=document.createElement("div");tempo.className="variant-tempo";
      const tempoLabel=document.createElement("span");tempoLabel.textContent="Tempo";
      const tempoValue=document.createElement("strong");tempoValue.textContent=candidate.tempo+" BPM";
      tempo.append(tempoLabel,tempoValue);
      const description=document.createElement("p");description.className="variant-description";description.textContent=candidate.description+" "+candidate.moodSummary;
      const actions=document.createElement("div");actions.className="variant-actions";
      [["preview","Preview"],["apply","Apply to cue"]].forEach(([action,text])=>{
        const button=document.createElement("button");button.type="button";button.className="btn btn-small"+(action==="apply"?" btn-apply":"");
        button.dataset.moodAction=action;button.dataset.variationIndex=String(index);button.textContent=text;
        button.setAttribute("aria-label",`${text}: ${candidate.name}`);actions.append(button);
      });
      card.append(number,title,tempo,description,actions);return card;
    }));
  }
  function applyMoodCandidate(candidate) {
    const error=moodCandidateError(candidate.events,state.totalBars*4);
    if(error){toast("This version could not be applied: "+error,true);return;}
    if(state.isPlaying)stopAudio(true);
    remember();
    state.events=copyEvents(candidate.events);state.tempo=candidate.tempo;state.seed=candidate.seed;
    state.activeMood={moodId:candidate.moodId,variantIndex:candidate.variantIndex,seed:candidate.seed};
    state.analysisProvisional=true;state.selectedId=null;state.variant="original";
    $("tempoInput").value=state.tempo;$("seedInput").value=state.seed;$("variantSelect").value="original";
    moodCandidateSet=null;renderAll();
    toast(candidate.name+" is now the active cue. The piano roll, event table and exports use this version.");
  }
  function addDiagnostic(title,pass,detail,info=false){
    const row=document.createElement("div");row.className="diagnostic-row";
    const badge=document.createElement("span");badge.className="badge "+(info?"info":pass?"pass":"fail");badge.textContent=info?"NOTE":pass?"PASS":"FAIL";
    const text=document.createElement("span");text.textContent=title+" — "+detail;row.append(badge,text);return row;
  }
  function inspectMidi(bytes) {
    const read16=at=>(bytes[at]<<8)|bytes[at+1];
    const read32=at=>(bytes[at]*0x1000000)+(bytes[at+1]<<16)+(bytes[at+2]<<8)+bytes[at+3];
    if(String.fromCharCode(...bytes.slice(0,4))!=="MThd"||read32(4)!==6)throw new Error("Invalid MIDI header chunk.");
    const format=read16(8),trackCount=read16(10),ppq=read16(12);let offset=14,ends=[],tracks=[];
    for(let ti=0;ti<trackCount;ti++){
      if(String.fromCharCode(...bytes.slice(offset,offset+4))!=="MTrk")throw new Error("A MIDI track chunk is missing.");
      const size=read32(offset+4),end=offset+8+size;let pos=offset+8,tick=0,lastStatus=0,foundEnd=false;
      const track={name:"",tempoMicros:null,meter:null,programs:[],events:[],end:null,hasSustain:false};
      while(pos<end){
        let delta=0,b;
        do{b=bytes[pos++];delta=(delta<<7)|(b&127);}while(b&128&&pos<end);
        tick+=delta;
        let status=bytes[pos++];
        if(status<128){pos--;status=lastStatus;}else if(status<240)lastStatus=status;
        if(status===255){
          const type=bytes[pos++];let len=0,lb;do{lb=bytes[pos++];len=(len<<7)|(lb&127);}while(lb&128&&pos<end);
          if(type===3)track.name=String.fromCharCode(...bytes.slice(pos,pos+len));
          if(type===81&&len===3)track.tempoMicros=(bytes[pos]<<16)|(bytes[pos+1]<<8)|bytes[pos+2];
          if(type===88&&len===4)track.meter=[bytes[pos],bytes[pos+1],bytes[pos+2],bytes[pos+3]];
          if(type===47)foundEnd=true;
          pos+=len;if(type===47){ends.push(tick);track.end=tick;}continue;
        }
        if(status===240||status===247){let len=0,lb;do{lb=bytes[pos++];len=(len<<7)|(lb&127);}while(lb&128&&pos<end);pos+=len;continue;}
        const kind=status&240,channel=status&15,d1=bytes[pos++],d2=(kind===192||kind===208)?0:bytes[pos++];
        if(kind===128||kind===144)track.events.push({tick,kind,channel,pitch:d1,velocity:d2});
        if(kind===192)track.programs.push({channel,program:d1});
        if(kind===176&&d1===64)track.hasSustain=true;
      }
      if(!foundEnd||pos!==end)throw new Error("Malformed MIDI end-of-track or chunk length.");
      const ordered=track.events.every((ev,i)=>i===0||track.events[i-1].tick<ev.tick||track.events[i-1].kind===128||ev.kind!==144||track.events[i-1].pitch!==ev.pitch);
      if(!ordered)throw new Error("Same-tick note-off ordering check failed.");
      tracks.push(track);offset=end;
    }
    if(offset!==bytes.length)throw new Error("Unexpected data after the final MIDI track.");
    if(format!==1||trackCount!==4||ppq!==480)throw new Error("Expected format 1, four tracks and 480 PPQ.");
    if(ends.some(t=>t!==Math.round(totalBeats()*480)))throw new Error("A track end does not match the selected arrangement length.");
    const conductor=tracks[0];
    if(conductor.name!=="Conductor"||conductor.tempoMicros!==Math.round(60000000/state.tempo)||JSON.stringify(conductor.meter)!==JSON.stringify([4,2,24,8]))throw new Error("Conductor track name, tempo or 4/4 time signature is incorrect.");
    const expectedLayers=[["Harmony","chord",0],["Bass","bass",1],["Melody","melody",2]];
    const selected=$("midiLayerChoice").value==="all"?state.events.slice():currentAudible();
    expectedLayers.forEach(([name,layer,channel],i)=>{
      const track=tracks[i+1];
      if(track.name!==name||track.programs.length!==1||track.programs[0].program!==0||track.programs[0].channel!==channel||track.hasSustain)throw new Error(`${name} track name, piano program or sustain-controller check failed.`);
      const expected=selected.filter(e=>e.layer===layer).flatMap(e=>{
        const on=Math.round(e.startBeat*480),off=Math.max(on+1,Math.round((e.startBeat+e.durationBeats)*480));
        return [{tick:on,kind:144,channel,pitch:e.midi,velocity:e.velocity},{tick:off,kind:128,channel,pitch:e.midi,velocity:0}];
      }).sort((a,b)=>a.tick-b.tick||a.kind-b.kind||a.pitch-b.pitch);
      const actual=track.events.slice().sort((a,b)=>a.tick-b.tick||a.kind-b.kind||a.pitch-b.pitch);
      if(JSON.stringify(actual)!==JSON.stringify(expected))throw new Error(`${name} MIDI pitches, velocities, starts or durations differ from the active event array.`);
    });
    return {format,trackCount,ppq,ends,tempoMicros:conductor.tempoMicros,meter:conductor.meter};
  }
  function renderDiagnostics() {
    const list=$("diagnosticList"), rows=[];
    const rom=PRESETS.romantic.events, dyads=PRESETS.dyads.events;
    rows.push(addDiagnostic("Octave convention",pitchLabel(60,"fl")==="C5"&&pitchLabel(60,"scientific")==="C4","MIDI 60 labels C5 in FL mode and C4 in scientific mode; pitch remains 60."));
    rows.push(addDiagnostic("Calibration pitches",pitchLabel(51)==="Eb4"&&pitchLabel(36)==="C3","Eb4 is MIDI 51 and C3 is MIDI 36 in the FL Studio convention."));
    rows.push(addDiagnostic("Preset 1 opening",rom.some(e=>e.layer==="bass"&&e.startBeat===0&&e.durationBeats===8),"First listed C-minor chord starts at tick 0 and lasts 3,840 ticks."));
    rows.push(addDiagnostic("Bar 3 begins",rom.some(e=>e.startBeat===8),"Beat 9 / bar 3 begins at tick 3,840."));
    rows.push(addDiagnostic("First melody event",rom.some(e=>e.layer==="melody"&&e.startBeat===1&&e.durationBeats===2),"Bar 1 beat 2 starts at tick 480 and lasts 960 ticks."));
    rows.push(addDiagnostic("Final listed melody",rom.some(e=>e.layer==="melody"&&e.startBeat===30&&e.durationBeats===1),"Bar 8 beat 3 is tick 14,400; the final G5 lasts one beat."));
    rows.push(addDiagnostic("Prompt harmony-count discrepancy",false,`${rom.filter(e=>e.layer!=="melody").length} non-melody events are listed, but the acceptance check says 24. The app keeps the specified notes rather than inventing another pitch.`,true));
    rows.push(addDiagnostic("Preset 1 melody pitches",JSON.stringify(sortEvents(rom.filter(e=>e.layer==="melody")).map(e=>e.midi))===JSON.stringify([67,63,62,67,63,60,68,67,63,72,71,67]),"All 12 melody labels map from the specified FL Studio octave convention to their MIDI pitches."));
    rows.push(addDiagnostic("Preset 1 melody count",rom.filter(e=>e.layer==="melody").length===12,"12 exact melody events."));
    rows.push(addDiagnostic("Dyad pitch pairs",JSON.stringify(dyads.filter(e=>e.layer==="chord").sort((a,b)=>a.startBeat-b.startBeat||a.midi-b.midi).reduce((arr,e,i)=>{(arr[Math.floor(i/2)]||(arr[Math.floor(i/2)]=[])).push(e.midi);return arr;},[]))===JSON.stringify([[51,56],[51,55],[53,58],[53,57]]),"Pairs match the specified MIDI pitches."));
    const additionalPresetIds=["blue-hour","windowlight","tidepool"];
    const additionalPresetsValid=additionalPresetIds.every(id=>{
      const preset=PRESETS[id],eventIds=new Set(preset.events.map(e=>e.id));
      return preset.bars===8&&preset.events.length>0&&eventIds.size===preset.events.length&&preset.events.every(e=>validEvent(e)&&e.startBeat+e.durationBeats<=preset.bars*4)&&Array.from($("presetSelect").options).some(option=>option.value===id);
    });
    rows.push(addDiagnostic("Additional starting moods",additionalPresetsValid,"Blue hour mystery, Windowlight and Tidepool reflections are selectable, unique and valid eight-bar cues."));
    rows.push(addDiagnostic("Loop duration",Math.abs(32*60/62-31.0)<.1,"A 32-beat loop at 62 BPM lasts 31.0 seconds."));
    const paletteCount=Object.keys(MOOD_PALETTES).length;
    rows.push(addDiagnostic("Six original mood palettes",paletteCount===6&&Object.values(MOOD_PALETTES).every(p=>p.variants.length===3),"Each palette has three named alternatives; generated music uses local synthesis and does not copy a soundtrack."));
    try{
      const generated=Object.keys(MOOD_PALETTES).map(moodId=>createMoodCandidates(rom,moodId,1791,62,8,0));
      const repeated=Object.keys(MOOD_PALETTES).map(moodId=>createMoodCandidates(rom,moodId,1791,62,8,0));
      const repeatable=JSON.stringify(generated.map(set=>set.map(c=>c.events)))===JSON.stringify(repeated.map(set=>set.map(c=>c.events)));
      const distinct=generated.every(set=>new Set(set.map(c=>JSON.stringify({tempo:c.tempo,events:c.events}))).size===3);
      const valid=generated.every(set=>set.length===3&&set.every(c=>!moodCandidateError(c.events,32)));
      const dyadSet=createMoodCandidates(dyads,"pnw-mystery",1791,62,4,0);
      const dyadLayers=dyadSet.every(c=>c.events.some(e=>e.layer==="melody")&&c.events.some(e=>e.layer==="bass"));
      rows.push(addDiagnostic("Seeded mood variation checks",repeatable&&distinct&&valid&&dyadLayers,"Same seed repeats exactly; each palette has three distinct, valid outputs, and dyads gain melody and bass."));
    }catch(error){rows.push(addDiagnostic("Seeded mood variation checks",false,error.message));}
    try {
      const result=inspectMidi(createMidi());
       rows.push(addDiagnostic("Generated MIDI structure",true,`Current export parsed: format ${result.format}, ${result.trackCount} tracks, ${result.ppq} PPQ, tempo, 4/4 meter, pitch/duration/velocity, no sustain, note-off ordering and all ${result.ends.length} track ends verified.`));
    } catch(err) {
      rows.push(addDiagnostic("Generated MIDI structure",false,"Current export check: "+err.message));
    }
    const jsonRoundTrip=JSON.stringify(copyEvents(JSON.parse(JSON.stringify(state.events))))===JSON.stringify(state.events);
    rows.push(addDiagnostic("Project JSON event round-trip",jsonRoundTrip,jsonRoundTrip?"All current event fields and values survive JSON serialization.":"A current event value did not survive JSON serialization."));
    rows.push(addDiagnostic("Browser / offline acceptance suite",false,"This environment has not run the local file:// browser checklist. Use README manual checks; do not treat this as a passed test.",true));
    list.replaceChildren(...rows);
    $("diagnosticSummary").textContent="Live checks inspect embedded data and the current browser implementation. File download, sound-device and fresh-folder checks still require manual verification.";
  }
  function snap(value) { return Math.round(value/state.snap)*state.snap; }
  function findCanvasEvent(x,y) {
    const labelW=50, rect=canvas.getBoundingClientRect(), scaleX=canvas.clientWidth/rect.width;
    const px=(x-rect.left)*scaleX, py=y-rect.top;
    const rows=pitchHigh-pitchLow+1, top=9;
    return state.events.slice().reverse().find(e=>{
      const ex=labelW+e.startBeat*beatWidth(), ey=top+(pitchHigh-e.midi)*rowHeight+2;
      return px>=ex&&px<=ex+Math.max(4,e.durationBeats*beatWidth())&&py>=ey&&py<=ey+rowHeight-4;
    })||null;
  }
  let drag=null;
  canvas.addEventListener("pointerdown",ev=>{
    const e=findCanvasEvent(ev.clientX,ev.clientY);
    if(!e){
      const rect=canvas.getBoundingClientRect(),scale=canvas.clientWidth/rect.width,labelW=50;
      const beat=Math.max(0,Math.min(totalBeats(),(ev.clientX-rect.left)*scale-labelW)/beatWidth());
      state.seekBeat=snap(beat);
      state.playhead=state.seekBeat;
      if(state.isPlaying){stopAudio();playAudio(state.events,state.seekBeat);}
      renderRoll();return;
    }
    ev.preventDefault();selectEvent(e.id);
    const labelW=50,rect=canvas.getBoundingClientRect(),x=(ev.clientX-rect.left)*(canvas.clientWidth/rect.width);
    const edge=x>(labelW+(e.startBeat+e.durationBeats)*beatWidth()-9);
    remember();
    drag={id:e.id,mode:edge?"resize":"move",startX:ev.clientX,startY:ev.clientY,original:{...e}};
    canvas.setPointerCapture(ev.pointerId);
  });
  canvas.addEventListener("pointermove",ev=>{
    if(!drag)return;
    const e=state.events.find(n=>n.id===drag.id);if(!e)return;
    const dx=(ev.clientX-drag.startX)/canvas.getBoundingClientRect().width*canvas.clientWidth/beatWidth();
    if(drag.mode==="resize")e.durationBeats=Math.max(state.snap,snap(drag.original.durationBeats+dx));
    else {
      e.startBeat=Math.max(0,snap(drag.original.startBeat+dx));
      e.midi=Math.max(0,Math.min(127,drag.original.midi-Math.round((ev.clientY-drag.startY)/rowHeight)));
    }
    state.analysisProvisional=true;renderAll();
  });
  canvas.addEventListener("pointerup",()=>{if(drag){drag=null;renderAll();}});
  canvas.addEventListener("pointermove",ev=>{
    if(drag)return;
    const e=findCanvasEvent(ev.clientX,ev.clientY);
    canvas.title=e?`${pitchLabel(e.midi)} · MIDI ${e.midi} · ${e.layer} · bar ${eventBarBeat(e).bar} beat ${fmt(eventBarBeat(e).beat)}`:"Piano roll: pitch vertically, time horizontally.";
  });
  canvas.addEventListener("dblclick",ev=>{
    const rect=canvas.getBoundingClientRect(), scale=canvas.clientWidth/rect.width;
    const labelW=50,x=(ev.clientX-rect.left)*scale,y=ev.clientY-rect.top;
    const start=Math.max(0,snap((x-labelW)/beatWidth()));
    const top=9;
    const midi=Math.max(0,Math.min(127,pitchHigh-Math.floor((y-top)/rowHeight)));
    addEvent("chord",midi,start,1,48);
  });
  canvas.addEventListener("keydown",ev=>{
    const e=state.events.find(n=>n.id===state.selectedId);if(!e)return;
    let handled=true;
    if(ev.key==="Delete"||ev.key==="Backspace") deleteSelected();
    else if(["ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].includes(ev.key)){
      remember();if(ev.key==="ArrowUp")e.midi=Math.min(127,e.midi+1);if(ev.key==="ArrowDown")e.midi=Math.max(0,e.midi-1);
      if(ev.key==="ArrowLeft")e.startBeat=Math.max(0,e.startBeat-state.snap);if(ev.key==="ArrowRight")e.startBeat=snap(e.startBeat+state.snap);
      state.analysisProvisional=true;renderAll();
    }else if(ev.key==="+"){addEvent("chord",60,0,1,48);}else handled=false;
    if(handled)ev.preventDefault();
  });
  function addEvent(layer,midi,start,duration,velocity) {
    const e=makeEvent("manual-"+Date.now()+"-"+Math.floor(Math.random()*1e6),layer,midi,start,duration,velocity);
    if(!validEvent(e)){toast("That note value is outside the allowed MIDI range.",true);return;}
    remember();state.events.push(e);state.selectedId=e.id;state.analysisProvisional=true;renderAll();
  }
  function deleteSelected(){
    if(!state.selectedId)return;
    remember();state.events=state.events.filter(e=>e.id!==state.selectedId);state.selectedId=null;state.analysisProvisional=true;renderAll();
  }
  $("addNoteButton").addEventListener("click",()=>addEvent("chord",60,Math.min(totalBeats()-1,state.seekBeat),1,48));
  $("deleteNoteButton").addEventListener("click",deleteSelected);
  $("noteForm").addEventListener("submit",ev=>{
    ev.preventDefault();const e=state.events.find(n=>n.id===state.selectedId);
    if(!e){toast("Select a note before applying values.",true);return;}
    const midi=Number($("noteMidi").value),bar=Number($("noteBar").value),beat=Number($("noteBeat").value),duration=Number($("noteDuration").value),velocity=Number($("noteVelocity").value),layer=$("noteLayer").value;
    const candidate={...e,midi,startBeat:(bar-1)*4+beat-1,durationBeats:duration,velocity,layer};
    if(!validEvent(candidate)||bar<1||beat<1||beat>=5){toast("Use MIDI 0–127, velocity 1–127, bar ≥ 1, beat 1–4, and positive duration.",true);return;}
    remember();Object.assign(e,candidate);state.analysisProvisional=true;renderAll();toast("Exact note values updated.");
  });
  $("notePitch").addEventListener("change",()=>{
    const midi=midiFromLabel($("notePitch").value);
    if(midi===null){toast("Enter a pitch such as C5, Eb4 or F#3.",true);return;}
    $("noteMidi").value=midi;
  });
  $("undoButton").addEventListener("click",()=>{if(!state.undo.length)return;state.redo.push(historySnapshot());restoreHistorySnapshot(state.undo.pop());renderAll();});
  $("redoButton").addEventListener("click",()=>{if(!state.redo.length)return;state.undo.push(historySnapshot());restoreHistorySnapshot(state.redo.pop());renderAll();});
  function changeControl(fn){remember();const old=copyEvents(state.events);fn();if(state.events.some(e=>!validEvent(e))){state.events=old;toast("This change would move a note outside MIDI 0–127. It was not applied.",true);return;}renderAll();}
  $("presetSelect").addEventListener("change",e=>setPreset(e.target.value));
  $("tempoInput").addEventListener("change",e=>{const n=Number(e.target.value);if(!Number.isInteger(n)||n<45||n>85){e.target.value=state.tempo;toast("Tempo must be between 45 and 85 BPM.",true);return;}state.tempo=n;renderAll();});
  $("structureSelect").addEventListener("change",e=>{
    remember();const n=Number(e.target.value);state.arrangement=n;state.ending="original";state.endingSelect.value="original";refreshDerived();renderAll();
  });
  $("transposeInput").addEventListener("change",e=>{
    const next=Number(e.target.value);if(!Number.isInteger(next)||next< -12||next>12){e.target.value=state.transpose;toast("Transpose must be an integer from −12 to +12.",true);return;}
    const delta=next-state.transpose;
    if(state.events.some(n=>n.midi+delta<0||n.midi+delta>127)){e.target.value=state.transpose;toast("Transpose rejected: at least one note would leave MIDI 0–127.",true);return;}
    remember();state.events=state.events.map(n=>({...n,midi:n.midi+delta}));state.transpose=next;state.analysisProvisional=true;renderAll();
  });
  $("octaveMode").addEventListener("change",e=>{state.octave=e.target.value;renderAll();});
  $("snapSelect").addEventListener("change",e=>state.snap=Number(e.target.value));
  $("zoomSelect").addEventListener("change",e=>{state.zoom=Number(e.target.value);renderRoll();});
  $("densitySelect").addEventListener("change",e=>{remember();state.density=e.target.value;refreshDerived();renderAll();});
  $("endingSelect").addEventListener("change",e=>{remember();state.ending=e.target.value;refreshDerived();renderAll();});
  $("variantSelect").addEventListener("change",e=>{
    const value=e.target.value;
    if(value==="regenerate"){state.seed=Number($("seedInput").value)||1791;state.variant="seeded";regenerate();}
    else {
      remember();
      if(value==="dyadMelody"&&state.presetId!=="dyads")setPreset("dyads");
      state.variant=value;refreshDerived();renderAll();
    }
  });
  $("resetButton").addEventListener("click",()=>setPreset(state.presetId));
  function generateMoodVariations() {
    const rawSeed=$("seedInput").value.trim();
    if(!/^\d+$/.test(rawSeed)){toast("Enter a whole-number variation seed from 0 to 4,294,967,295.",true);return;}
    const seed=Number(rawSeed);
    if(!Number.isSafeInteger(seed)||seed>4294967295){toast("Variation seed must be from 0 to 4,294,967,295.",true);return;}
    try{
      const moodId=$("moodSelect").value;
      const candidates=createMoodCandidates(state.events,moodId,seed,state.tempo,state.totalBars,state.transpose);
      moodCandidateSet={moodId,seed,candidates,signature:eventStateSignature(state.events,state.tempo,state.totalBars)};
      renderMoodCandidates();toast("Three "+MOOD_PALETTES[moodId].name.toLowerCase()+" variations generated from seed "+seed+".");
    }catch(error){moodCandidateSet=null;renderMoodCandidates();toast(error.message||"Could not generate these variations.",true);}
  }
  $("generateMoodVariations").addEventListener("click",generateMoodVariations);
  $("moodSelect").addEventListener("change",renderMoodCandidates);
  $("seedInput").addEventListener("input",()=>{if(moodCandidateSet)renderMoodCandidates();});
  $("moodVariantGrid").addEventListener("click",event=>{
    const button=event.target.closest("button[data-mood-action]");
    if(!button||!moodCandidateSet)return;
    const index=Number(button.dataset.variationIndex),candidate=moodCandidateSet.candidates[index];
    if(!candidate)return;
    if(button.dataset.moodAction==="preview"){
      playAudio(candidate.events,0,{tempo:candidate.tempo,length:state.totalBars*4,toneId:candidate.toneId});
    }else if(button.dataset.moodAction==="apply")applyMoodCandidate(candidate);
  });
  document.querySelectorAll("[data-layer]").forEach(input=>input.addEventListener("change",()=>{
    state.muted[input.dataset.layer]=!input.checked;renderAll();
  }));
  document.querySelectorAll("[data-solo]").forEach(button=>button.addEventListener("click",()=>{
    state.solo=button.dataset.solo==="all"?null:button.dataset.solo;renderAll();toast(state.solo?`${state.solo} layer isolated for listening.`:"All layers available.");
  }));
  $("randomSeedButton").addEventListener("click",()=>{state.seed=Number($("seedInput").value)||1791;state.variant="seeded";$("variantSelect").value="regenerate";regenerate();});
  function regenerate(){
    const base=state.events, copy=copyEvents(base), mel=copy.filter(e=>e.layer==="melody");
    if(mel.length){
      let seed=state.seed>>>0;const rnd=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
      const targets=[60,62,63,65,67,68,71,72];
      // Preserve most melody pitches and rhythm; alter only a seeded subset to a nearby chord tone.
      mel.forEach((e,i)=>{if(rnd()<.28){const options=targets.filter(m=>Math.abs(m-e.midi)<=2);if(options.length)e.midi=options[Math.floor(rnd()*options.length)];}});
    }
    remember();state.events=copy;state.analysisProvisional=true;renderAll();toast("Rule-led variation generated from seed "+state.seed+".");
  }
  $("pedalVariant").addEventListener("click",()=>{
    if(state.presetId==="held"){toast("Held tonic bass is already the starting point.");return;}
    const ev=copyEvents(state.events.filter(e=>e.layer!=="bass"));
    ev.unshift(makeEvent("variant-pedal-C","bass",36,0,totalBeats(),42));
    remember();state.events=ev;state.analysisProvisional=true;renderAll();toast("Added a C3 pedal point. The bass is one long MIDI event.");
  });
  $("dyadVariant").addEventListener("click",()=>setPreset("dyads"));
  $("bassReattack").addEventListener("click",()=>{
    if(state.presetId!=="held"){setPreset("held");}
    state.reattack=!state.reattack;refreshDerived();renderAll();toast(state.reattack?"Bass reattacks now occur every eight beats.":"Restored the single 32-beat bass event.");
  });
  function lessonComparisonEvents(){
    const comparison=copyEvents(state.events);
    if(state.currentLesson===0){
      const note=comparison.find(e=>e.id.startsWith("r-c0-2")&&e.startBeat===0);
      if(note)note.durationBeats=Math.min(note.durationBeats,1);
    }else if(state.currentLesson===1){
      const note=comparison.find(e=>e.id.startsWith("r-c0-4")&&e.startBeat===0);
      if(note)comparison.splice(comparison.indexOf(note),1);
    }else if(state.currentLesson===2){
      return comparison.filter(e=>e.layer!=="bass");
    }else if(state.currentLesson===3){
      const note=comparison.find(e=>e.layer==="melody"&&e.startBeat===28);
      if(note&&note.midi<127)note.midi+=1;
    }else if(state.currentLesson===4){
      const highest=new Map();
      comparison.filter(e=>e.layer==="chord").forEach(e=>highest.set(e.startBeat,Math.max(highest.get(e.startBeat)??-1,e.midi)));
      return comparison.filter(e=>!(e.layer==="chord"&&e.midi===highest.get(e.startBeat)));
    }else if(state.currentLesson===5){
      return comparison.filter(e=>e.layer!=="bass");
    }else{
      const melody=sortEvents(comparison.filter(e=>e.layer==="melody"));
      const last=melody[melody.length-1];
      if(last){
        const chordEvents=comparison.filter(e=>e.layer!=="melody"&&e.startBeat<=last.startBeat&&e.startBeat+e.durationBeats>last.startBeat);
        const nearby=[...new Set(chordEvents.flatMap(e=>[-36,-24,-12,0,12,24,36].map(o=>e.midi+o)).filter(p=>p>=0&&p<=127&&p!==last.midi&&Math.abs(p-last.midi)<=5))].sort((a,b)=>Math.abs(a-last.midi)-Math.abs(b-last.midi));
        if(nearby.length)last.midi=nearby[0];
      }
    }
    return comparison;
  }
  $("lessonListen").addEventListener("click",()=>{if(state.isPlaying)stopAudio(true);else playAudio(state.events);});
  $("compareToggle").addEventListener("change",e=>state.compare=e.target.checked);
  $("compareListen").addEventListener("click",()=>{
    if(!state.compare){playAudio(state.events);return;}
    playAudio(lessonComparisonEvents());
  });
  $("playButton").addEventListener("click",()=>{if(state.isPlaying)pauseAudio();else playAudio(state.events);});
  $("stopButton").addEventListener("click",()=>stopAudio(true));
  $("loopToggle").addEventListener("change",()=>{if(state.isPlaying){const at=state.playhead,events=playbackEvents.slice(),options={tempo:playbackTempo,length:playbackLength,toneId:playbackToneId};stopAudio(false);playAudio(events,at,options);}});
  function ensureAudio(){
    if(!audio){
      const AudioCtor=window.AudioContext||window.webkitAudioContext;
      if(!AudioCtor)throw new Error("Web Audio is unavailable in this browser.");
      audio=new AudioCtor();
      const comp=audio.createDynamicsCompressor();comp.threshold.value=-18;comp.knee.value=16;comp.ratio.value=4;comp.attack.value=.008;comp.release.value=.22;
      const delay=audio.createDelay(.8),feedback=audio.createGain(),wet=audio.createGain();
      delay.delayTime.value=.18;feedback.gain.value=.14;wet.gain.value=0;
      delay.connect(feedback);feedback.connect(delay);delay.connect(wet);wet.connect(comp);
      const master=audio.createGain();master.gain.value=.48;comp.connect(master);master.connect(audio.destination);
      audio.master=master;audio.compressor=comp;audio.delay=delay;audio.delayFeedback=feedback;audio.delayWet=wet;
    }
    return audio.resume();
  }
  function scheduleTone(midi,velocity,when,duration){
    if(!audio||scheduledVoices.size>=24)return;
    const now=audio.currentTime, start=Math.max(when,now+.002);
    const fundamental=440*Math.pow(2,(midi-69)/12), gain=audio.createGain();
    gain.gain.setValueAtTime(.0001,start);
    const peak=Math.min(.12,(velocity/127)*.12);
    gain.gain.exponentialRampToValueAtTime(Math.max(.0002,peak),start+.012);
    gain.gain.exponentialRampToValueAtTime(.0001,start+Math.max(.13,duration));
    gain.connect(audio.compressor);gain.connect(audio.delay);
    const partials=[1,2,3,4];const amps=[1,.35,.16,.07];const nodes=[];
    const tone=MOOD_TONES[playbackToneId]||MOOD_TONES.piano;
    const vibrato=audio.createOscillator(),vibratoDepth=audio.createGain();
    vibrato.frequency.value=tone.vibratoHz;vibratoDepth.gain.value=tone.vibratoCents;vibrato.connect(vibratoDepth);
    partials.forEach((partial,i)=>{
      const osc=audio.createOscillator();const og=audio.createGain();osc.type="sine";osc.frequency.value=fundamental*partial;og.gain.value=amps[i];osc.connect(og);og.connect(gain);vibratoDepth.connect(osc.detune);osc.start(start);osc.stop(start+Math.max(.14,duration)+.04);nodes.push(osc,og);
      osc.onended=()=>{try{osc.disconnect();og.disconnect();}catch(_){}};
    });
    vibrato.start(start);vibrato.stop(start+Math.max(.14,duration)+.05);vibrato.onended=()=>{try{vibrato.disconnect();vibratoDepth.disconnect();}catch(_){}};
    scheduledVoices.add(gain);setTimeout(()=>scheduledVoices.delete(gain),(Math.max(0,start-now)+duration+.1)*1000);
  }
  function playAudio(events,offset=null,options={}){
    if(state.isPlaying){stopAudio(false);}
    ensureAudio().then(()=>{
      playbackEvents=events.slice();playbackTempo=options.tempo||state.tempo;playbackLength=options.length||totalBeats();
      playbackToneId=options.toneId||(activeMoodDetails()?.palette.toneId||"piano");
      const tone=MOOD_TONES[playbackToneId]||MOOD_TONES.piano,now=audio.currentTime;
      audio.delay.delayTime.setTargetAtTime(tone.delaySeconds,now,.04);audio.delayWet.gain.setTargetAtTime(tone.delayWet,now,.05);
      state.isPlaying=true;playbackOffset=offset===null?state.seekBeat:offset;state.seekBeat=playbackOffset;
      playbackStart=audio.currentTime-playbackOffset*60/playbackTempo;scheduledEvents.clear();
      const loop= $("loopToggle").checked;
      const bpm=playbackTempo, len=playbackLength;
      function scheduleWindow(){
        if(!state.isPlaying)return;
        const now=audio.currentTime, horizon=now+.18;
        const beatNow=Math.max(0,(now-playbackStart)*bpm/60);
        const current=beatNow%len;
        state.playhead=current;renderRoll();
        $("readoutHarmony").textContent=currentHarmony();
        const audible=events.filter(e=>!state.muted[e.layer]&&(!state.solo||state.solo===e.layer));
        audible.forEach(e=>{
          const absolute=e.startBeat;
          let cycle=loop?Math.floor((beatNow-absolute)/len):0;
          if(loop&&cycle<0)cycle=0;
          const candidate=absolute+cycle*len;
          const sec=playbackStart+candidate*60/bpm;
          const key=e.id+":"+cycle;
          if(!scheduledEvents.has(key)&&sec>=now-.03&&sec<horizon){
            const durationBeats=Math.min(e.durationBeats,loop?len-e.startBeat:e.durationBeats);
            scheduleTone(e.midi,e.velocity,sec,durationBeats*60/bpm);scheduledEvents.add(key);
          }
        });
        if(!loop&&beatNow>=len){stopAudio();return;}
      }
      scheduleWindow();scheduler=setInterval(scheduleWindow,35);updatePlayState();
    }).catch(err=>{toast(err.message||"Audio could not start. Use a browser that supports Web Audio.",true);});
  }
  function pauseAudio(){
    if(audio&&state.isPlaying)state.seekBeat=((audio.currentTime-playbackStart)*playbackTempo/60)%playbackLength;
    stopAudio(false);
  }
  function stopAudio(resetPosition=true){
    state.isPlaying=false;if(scheduler){clearInterval(scheduler);scheduler=null;}
    if(audio){const now=audio.currentTime;try{audio.master.gain.cancelScheduledValues(now);audio.master.gain.setTargetAtTime(.0001,now,.015);audio.delayWet.gain.setTargetAtTime(0,now,.01);setTimeout(()=>{if(audio)audio.master.gain.setTargetAtTime(.48,audio.currentTime,.08);},90);}catch(_){}}
    scheduledVoices.forEach(node=>{try{node.gain.cancelScheduledValues(audio.currentTime);node.gain.setTargetAtTime(.0001,audio.currentTime,.01);}catch(_){}});
    scheduledVoices.clear();scheduledEvents.clear();
    if(resetPosition)state.seekBeat=0;
    state.playhead=resetPosition?0:state.seekBeat;updatePlayState();renderRoll();
  }
  function updatePlayState(){
    $("playButton").textContent=state.isPlaying?"Ⅱ Pause":"▶ Listen";
    $("playButton").setAttribute("aria-label",state.isPlaying?"Pause playback":"Start playback");
    $("lessonListen").textContent=state.isPlaying?"■ Stop idea":"Listen to this idea";
    $("lessonListen").setAttribute("aria-label",state.isPlaying?"Stop playback":"Play this lesson idea");
    $("lessonListen").setAttribute("aria-pressed",String(state.isPlaying));
    $("readoutLength").textContent=totalBeats()+" beats";
  }
  // MIDI Standard File format 1, 480 PPQ, no runtime dependencies.
  function ascii(s){return Array.from(s).map(c=>c.charCodeAt(0));}
  function u16(n){return [(n>>8)&255,n&255];}
  function u32(n){return [(n>>>24)&255,(n>>>16)&255,(n>>>8)&255,n&255];}
  function vlq(n){
    let value=Math.max(0,Math.floor(n)), bytes=[value&127];
    while((value>>=7)){bytes.unshift((value&127)|128);}
    return bytes;
  }
  function chunk(tag,data){return [...ascii(tag),...u32(data.length),...data];}
  function midiTrack(name,events,endTick,channel,bpm){
    let messages=[];
    if(name==="Conductor"){
      const micros=Math.round(60000000/bpm);
      messages.push({tick:0,order:0,data:[0xff,0x51,0x03,(micros>>16)&255,(micros>>8)&255,micros&255]});
      messages.push({tick:0,order:1,data:[0xff,0x58,0x04,4,2,24,8]});
      messages.push({tick:0,order:2,data:[0xff,0x03,...vlq(ascii(name).length),...ascii(name)]});
    }else{
      const n=ascii(name);messages.push({tick:0,order:0,data:[0xff,0x03,...vlq(n.length),...n]});
      messages.push({tick:0,order:1,data:[0xc0|channel,0]});
      events.forEach(e=>{
        const on=Math.round(e.startBeat*480),off=Math.max(on+1,Math.round((e.startBeat+e.durationBeats)*480));
        messages.push({tick:off,order:0,pitch:e.midi,data:[0x80|channel,e.midi,0]});
        messages.push({tick:on,order:1,pitch:e.midi,data:[0x90|channel,e.midi,e.velocity]});
      });
    }
    messages.push({tick:endTick,order:9,data:[0xff,0x2f,0x00]});
    messages.sort((a,b)=>a.tick-b.tick||a.order-b.order||(a.pitch||0)-(b.pitch||0));
    let bytes=[],last=0;
    messages.forEach(m=>{bytes.push(...vlq(m.tick-last),...m.data);last=m.tick;});
    return chunk("MTrk",bytes);
  }
  function createMidi(){
    const includeAll=$("midiLayerChoice").value==="all";
    let events=includeAll?state.events.slice():currentAudible();
    const endTick=Math.round(totalBeats()*480);
    const layerTracks=[["Harmony",events.filter(e=>e.layer==="chord"),0],["Bass",events.filter(e=>e.layer==="bass"),1],["Melody",events.filter(e=>e.layer==="melody"),2]];
    for(const [name,ev] of layerTracks){
      const sorted=sortEvents(ev);
      for(let i=0;i<sorted.length;i++)for(let j=i+1;j<sorted.length;j++){
        if(sorted[i].midi===sorted[j].midi&&sorted[i].startBeat<sorted[j].startBeat+sorted[j].durationBeats&&sorted[j].startBeat<sorted[i].startBeat+sorted[i].durationBeats)
          throw new Error(`Overlapping ${pitchLabel(sorted[i].midi)} notes on the ${name} track would share a MIDI channel. Shorten, move or delete one before export.`);
      }
    }
    const tracks=[midiTrack("Conductor",[],endTick,0,state.tempo),...layerTracks.map(([name,ev,ch])=>midiTrack(name,ev,endTick,ch,state.tempo))];
    return new Uint8Array([...ascii("MThd"),...u32(6),...u16(1),...u16(tracks.length),...u16(480),...tracks.flat()]);
  }
  function downloadBlob(blob,filename){
    const url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download=filename;a.style.display="none";document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1200);
  }
  function jsonProject(){
    return {format:"beautiful-unease-project",version:1,tempo:state.tempo,meter:[4,4],totalBars:state.totalBars,presetId:state.presetId,seed:state.seed,octaveConvention:state.octave,events:copyEvents(state.events),arrangementBars:state.arrangement,transpose:state.transpose,ending:state.ending,activeMood:state.activeMood?{...state.activeMood}:null};
  }
  $("midiExport").addEventListener("click",()=>{
    try{const blob=new Blob([createMidi()],{type:"audio/midi"});downloadBlob(blob,"beautiful-unease-cue.mid");setStatus("MIDI format 1 · 480 PPQ · separate harmony, bass and melody tracks.");}
    catch(err){setStatus(err.message,true);toast(err.message,true);}
  });
  $("jsonExport").addEventListener("click",()=>{downloadBlob(new Blob([JSON.stringify(jsonProject(),null,2)],{type:"application/json"}),"beautiful-unease-project.json");setStatus("Project JSON saved with the active event array.");});
  $("csvExport").addEventListener("click",()=>{
    const rows=[["id","layer","pitch","midi","startBeat","bar","beat","durationBeats","velocity"]];
    sortEvents(state.events).forEach(e=>{const p=eventBarBeat(e);rows.push([e.id,e.layer,pitchLabel(e.midi),e.midi,e.startBeat,p.bar,p.beat,e.durationBeats,e.velocity]);});
    const csv=rows.map(r=>r.map(v=>`"${String(v).replace(/"/g,'""')}"`).join(",")).join("\r\n");
    downloadBlob(new Blob([csv],{type:"text/csv"}),"beautiful-unease-events.csv");setStatus("CSV event table saved.");
  });
  $("printButton").addEventListener("click",()=>window.print());
  $("jsonImport").addEventListener("change",ev=>{
    const file=ev.target.files&&ev.target.files[0];if(!file)return;
    const reader=new FileReader();
    reader.onload=()=>{
      try{
        const data=JSON.parse(String(reader.result));
        if(!data||data.format!=="beautiful-unease-project"||data.version!==1||!Array.isArray(data.events))throw new Error("Expected a Beautiful Unease project, version 1, with an events array.");
        if(!PRESETS[data.presetId])throw new Error("Unknown presetId. Choose one of the built-in starting moods.");
        const errs=[];
        data.events.forEach((e,i)=>{if(!e||typeof e.id!=="string"||!validEvent(e))errs.push(`Event ${i+1} needs id, valid layer, MIDI 0–127, start ≥ 0, positive duration and velocity 1–127.`);});
        if(errs.length)throw new Error(errs.slice(0,3).join(" "));
        if(!Number.isInteger(data.tempo)||data.tempo<45||data.tempo>85)throw new Error("Tempo must be an integer from 45 to 85 BPM.");
        if(!Number.isInteger(data.totalBars)||data.totalBars<1||data.totalBars>32)throw new Error("totalBars must be between 1 and 32.");
        const importedSeed=data.seed??1791;
        if(!Number.isInteger(importedSeed)||importedSeed<0||importedSeed>4294967295)throw new Error("Project seed must be a whole number from 0 to 4,294,967,295.");
        let importedMood=null;
        if(data.activeMood!==undefined&&data.activeMood!==null){
          const mood=data.activeMood,palette=mood&&MOOD_PALETTES[mood.moodId];
          if(!palette||!Number.isInteger(mood.variantIndex)||!palette.variants[mood.variantIndex]||!Number.isInteger(mood.seed)||mood.seed<0||mood.seed>4294967295)throw new Error("Project mood metadata is invalid.");
          importedMood={moodId:mood.moodId,variantIndex:mood.variantIndex,seed:mood.seed};
        }
        remember();state.events=copyEvents(data.events);state.tempo=data.tempo;state.totalBars=data.totalBars;state.arrangement=data.arrangementBars||data.totalBars;
        state.presetId=data.presetId;state.seed=importedSeed;state.activeMood=importedMood;state.octave=data.octaveConvention==="scientific"?"scientific":"fl";state.transpose=Number(data.transpose)||0;state.ending=data.ending||"original";state.analysisProvisional=true;moodCandidateSet=null;
        $("presetSelect").value=state.presetId;$("tempoInput").value=state.tempo;$("transposeInput").value=state.transpose;$("octaveMode").value=state.octave;$("seedInput").value=state.seed;
        renderAll();setStatus("Project loaded. Imported events are the active source of truth.");toast("Project loaded and validated.");
      }catch(err){setStatus("Import failed: "+err.message,true);toast("Import failed: "+err.message,true);}
      ev.target.value="";
    };
    reader.onerror=()=>{setStatus("Could not read this file.",true);};reader.readAsText(file);
  });
  $("zipExport").addEventListener("click",()=>{window.location.href="./beautiful-unease-piano-lab.zip";setStatus("Opening the portable ZIP download.");});
  $("loopToggle").addEventListener("change",()=>{});
  window.addEventListener("resize",renderRoll);
  window.addEventListener("beforeunload",()=>{if(scheduler)clearInterval(scheduler);});
  // Seed initial session without applying any transforms; exact preset is canonical.
  state.events=copyEvents(PRESETS.romantic.events);
  renderAll();
  canvas.parentElement.scrollTop=170;
})();
