/* Factual, event-derived theory. No note generation or playback side effects. */
(function (root) {
  "use strict";
  const pc = n => ((n % 12) + 12) % 12;
  const names = ["C","C#","D","Eb","E","F","F#","G","Ab","A","Bb","B"];
  const degrees = ["1","♭2","2","♭3","3","4","♯4 / ♭5","5","♭6","6","♭7","7"];
  const roles = ["root","minor second / ninth color","major second / ninth color","minor third","major third","perfect fourth / suspension color","tritone color","perfect fifth","minor sixth / flat-thirteenth color","major sixth / thirteenth color","minor seventh","major seventh"];
  const simpleNames = ["unison","minor second","major second","minor third","major third","perfect fourth","tritone","perfect fifth","minor sixth","major sixth","minor seventh","major seventh"];
  const templates = [
    ["", [0,4,7]], ["m",[0,3,7]], ["dim",[0,3,6]], ["aug",[0,4,8]],
    ["sus2",[0,2,7]], ["sus4",[0,5,7]], ["7",[0,4,7,10]],
    ["maj7",[0,4,7,11]], ["m7",[0,3,7,10]], ["m(maj7)",[0,3,7,11]],
    ["m7♭5",[0,3,6,10]], ["7sus4",[0,5,7,10]], ["add9",[0,2,4,7]],
    ["m(add9)",[0,2,3,7]], ["9",[0,2,4,7,10]], ["maj9",[0,2,4,7,11]],
    ["m9",[0,2,3,7,10]], ["m(maj9)",[0,2,3,7,11]]
  ];
  const uniq = array => [...new Set(array)];
  const pcs = notes => uniq(notes.map(n=>pc(n.midi))).sort((a,b)=>a-b);
  const signature = notes => pcs(notes).join(",");
  function interval(a,b) {
    const signed = b-a, semitones = Math.abs(signed), remainder = semitones%12, octaves = Math.floor(semitones/12);
    let name = simpleNames[remainder];
    if (octaves && !remainder) name = octaves===1 ? "octave" : `${octaves} octaves`;
    else if (octaves) {
      const quality = ["","minor","major","minor","major","perfect","","perfect","minor","major","minor","major"][remainder];
      const number = [1,2,2,3,3,4,0,5,6,6,7,7][remainder]+octaves*7;
      name = remainder===6 ? `tritone + ${octaves} octave${octaves===1?"":"s"}` :
        `${quality} ${number}${number%10===1 && number%100!==11?"st":number%10===2 && number%100!==12?"nd":number%10===3 && number%100!==13?"rd":"th"}`;
      if (number===9) name = `${quality} ninth`;
      if (number===10) name = `${quality} tenth`;
    }
    return {name,semitones,signed,direction:signed>0?"up":signed<0?"down":"same pitch",simple:simpleNames[remainder],compound:semitones>12};
  }
  function candidates(notes) {
    const collection=pcs(notes), matches=[];
    if(collection.length<3)return matches;
    for(let tonic=0;tonic<12;tonic++) for(const [suffix,shape] of templates) {
      if(shape.length===collection.length && shape.every(offset=>collection.includes(pc(tonic+offset))))
        matches.push({root:tonic,name:names[tonic]+suffix});
    }
    return matches;
  }
  function chord(notes,pedalIds=new Set()) {
    const upper=notes.filter(n=>n.layer==="chord"), full=candidates(notes);
    const nonPedal=notes.filter(n=>!pedalIds.has(n.id));
    const withoutPedal=candidates(nonPedal);
    let matches=full, separateBass=false;
    // A pedal can be a non-chord tone; it must not silently become the root.
    if(withoutPedal.length===1 && notes.some(n=>pedalIds.has(n.id)) && !full.length) {
      matches=withoutPedal;separateBass=true;
    } else if(!full.length && candidates(upper).length===1) {
      matches=candidates(upper);separateBass=notes.some(n=>n.layer==="bass");
    }
    const match=matches.length===1?matches[0]:null;
    return {root:match?.root??null,name:match?.name??(notes.length===2?"Two-note shape":"Pitch collection"),
      alternatives:matches.length>1?matches.map(m=>m.name):[],separateBass};
  }
  function heldPedals(events) {
    const result=[], bass=events.filter(e=>e.layer==="bass").slice().sort((a,b)=>a.startBeat-b.startBeat);
    const runs=[];
    for(const note of bass) {
      const previous=runs.find(run=>run.midi===note.midi && Math.abs(run.end-note.startBeat)<.0001);
      if(previous){previous.notes.push(note);previous.end=note.startBeat+note.durationBeats;}
      else runs.push({midi:note.midi,start:note.startBeat,end:note.startBeat+note.durationBeats,notes:[note]});
    }
    for(const run of runs) {
      if(run.end-run.start<8)continue;
      const groups=new Map();
      events.filter(e=>e.layer==="chord" && e.startBeat>=run.start && e.startBeat<run.end)
        .forEach(e=>{if(!groups.has(e.startBeat))groups.set(e.startBeat,[]);groups.get(e.startBeat).push(e);});
      if(new Set([...groups.values()].map(signature)).size>1)
        result.push({...run,reattacked:run.notes.length>1});
    }
    return result;
  }
  function analyze(events,options={}) {
    const label=options.pitchLabel || (m=>names[pc(m)]+(Math.floor(m/12)-1));
    const tonic=Number.isInteger(options.tonic)?pc(options.tonic):null;
    const harmony=events.filter(e=>e.layer!=="melody");
    const total=options.totalBeats??Math.max(0,...events.map(e=>e.startBeat+e.durationBeats));
    const boundaries=uniq([0,total,...harmony.flatMap(e=>[e.startBeat,e.startBeat+e.durationBeats])])
      .filter(n=>n>=0 && n<=total).sort((a,b)=>a-b);
    const pedals=heldPedals(events), pedalIds=new Set(pedals.flatMap(p=>p.notes.map(n=>n.id)));
    const regions=[], facts=[];
    for(let i=0;i<boundaries.length-1;i++) {
      const start=boundaries[i],end=boundaries[i+1];
      const notes=harmony.filter(e=>e.startBeat<=start+.00001 && e.startBeat+e.durationBeats>start+.00001).sort((a,b)=>a.midi-b.midi);
      const previous=regions[regions.length-1], key=notes.map(n=>n.id).sort().join("|");
      if(previous && previous.key===key){previous.end=end;continue;}
      const found=chord(notes,pedalIds);
      regions.push({id:`region-${regions.length}`,key,start,end,notes,...found,collection:pcs(notes).map(n=>names[n]),facts:[]});
    }
    const add=(region,fact)=>{
      fact.id=`${region.id}-${fact.category}-${region.facts.length}`;
      fact.regionId=region.id;region.facts.push(fact);facts.push(fact);return fact;
    };
    function pair(region,a,b,kind="Together") {
      const relation=interval(a.midi,b.midi);
      return add(region,{category:"intervals",kind,semitones:relation.semitones,simple:relation.simple,
        title:`${label(a.midi)} → ${label(b.midi)} · ${relation.name}`,
        short:relation.name,notes:[a.id,b.id],start:Math.min(a.startBeat,b.startBeat),
        text:`${kind==="Together"?"These notes sound together":"These melody notes enter in sequence"}. From ${label(a.midi)} (MIDI ${a.midi}) to ${label(b.midi)} (MIDI ${b.midi}): ${relation.direction}, ${relation.semitones} semitone${relation.semitones===1?"":"s"} (half steps). `+
          (relation.compound?`The actual interval is a ${relation.name}; its octave-reduced pitch-class distance is a ${relation.simple}. Do not confuse those two distances. `:"")+
          (relation.simple==="minor third"?"A minor-third pitch-class relationship spans three half steps; a major third spans four. ":
            relation.simple==="major third"?"A major-third pitch-class relationship spans four half steps; a minor third spans three. ":"")+
          "Interval names here describe equal-tempered pitch distance; enharmonic spelling can change a formal interval name."});
    }
    for(const region of regions) {
      const notes=region.notes;
      if(notes.length)add(region,{category:"harmony",kind:"Chord collection",title:`${region.name} · ${region.collection.join("–")}`,
        short:region.name,notes:notes.map(n=>n.id),start:region.start,
        text:region.root===null
          ?`These played harmony and bass notes form ${region.collection.join("–")}. ${region.alternatives.length?"Several template matches are possible: "+region.alternatives.join(", ")+". ":""}No single root is assumed. A pitch collection is a factual list of sounding pitch classes.`
          :`The played pitch classes ${region.collection.join("–")} match ${region.name}. Chord root ${names[region.root]} is supported by this voicing, not inferred just from the lowest note. ${region.separateBass?"The bass is separate from this upper chord. ":""}Other musical contexts may suggest a different interpretation.`});
      // Adjacent voices plus lowest-to-upper voices cover spacing and chord color.
      const pairs=new Set();
      for(let i=1;i<notes.length;i++) for(const j of uniq([0,i-1])) {
        const a=notes[j],b=notes[i],key=`${a.midi}:${b.midi}`;
        if(a.midi!==b.midi && !pairs.has(key)){pairs.add(key);pair(region,a,b);}
      }
      for(const pedal of pedals.filter(p=>p.start<region.end && p.end>region.start)) {
        add(region,{category:"motion",kind:"Pedal point",title:`${label(pedal.midi)} · ${pedal.reattacked?"rearticulated":"held"} pedal point`,
          short:"Pedal point",notes:pedal.notes.map(n=>n.id).concat(notes.filter(n=>n.layer==="chord").map(n=>n.id)),start:region.start,
          text:`This bass pitch remains ${pedal.reattacked?"through repeated attacks":"in one sustained note"} for ${pedal.end-pedal.start} beats while upper pitch collections change. This is a pedal point, not a sustain-pedal instruction. It need not be the root of the chord above it.`});
      }
      const melodic=events.filter(e=>e.layer==="melody").slice().sort((a,b)=>a.startBeat-b.startBeat || a.midi-b.midi);
      const phrase=melodic.filter(n=>n.startBeat>=region.start && n.startBeat<region.end);
      if(phrase.length)add(region,{category:"motion",kind:"Melody phrase",title:`Melody · ${phrase.length} note${phrase.length===1?"":"s"} entering in this region`,
        short:"Melody phrase",notes:phrase.map(n=>n.id),start:phrase[0].startBeat,
        text:`These are the actual melody entrances in this harmonic region: ${phrase.map(n=>label(n.midi)).join(", ")}. Each block's horizontal length is its duration in beats. Empty stretches in this layer are rests; extra sound from an audio echo is not an extra written note.`});
      for(let i=0;i<melodic.length-1;i++) if(melodic[i].startBeat>=region.start && melodic[i].startBeat<region.end)pair(region,melodic[i],melodic[i+1],"Melodic motion");
    }
    for(let i=1;i<regions.length;i++) {
      const before=regions[i-1],after=regions[i];
      const previous=before.notes.filter(n=>n.layer==="chord"),next=after.notes.filter(n=>n.layer==="chord");
      for(const a of previous.filter(n=>n.startBeat+n.durationBeats<=after.start+.0001)) {
        const b=next.find(n=>n.startBeat>=after.start-.0001 && n.midi===a.midi-1);
        if(!b)continue;
        const anchor=before.notes.find(n=>n.midi===a.midi-5 && after.notes.some(m=>m.midi===n.midi)) ||
          before.notes.find(n=>n.midi<a.midi && after.notes.some(m=>m.midi===n.midi));
        const suspended=before.root!==null && before.root===after.root && pc(a.midi-before.root)===5 &&
          pc(b.midi-after.root)===4 && !before.notes.some(n=>[3,4].includes(pc(n.midi-before.root)));
        const dyad=anchor && a.midi-anchor.midi===5 && b.midi-anchor.midi===4;
        add(after,{category:"motion",kind:suspended?"Suspension":dyad?"Fourth to third":"Half-step motion",
          title:suspended?"Suspended fourth → major third":dyad?"Perfect fourth → major third":`${label(a.midi)} → ${label(b.midi)} · down a half step`,
          short:suspended?"4 → 3":dyad?"4th → 3rd":"↓ 1 half step",notes:[a.id,b.id,...(anchor?[anchor.id]:[])],start:after.start,
          text:`${label(a.midi)} moves down to ${label(b.midi)} at bar ${Math.floor(after.start/4)+1}, beat ${after.start%4+1}: one semitone (half step). `+
            (suspended?`Relative to chord root ${names[after.root]}, the suspended fourth gives way to the major third. This is an actual change in the current notes, not just a possible recipe.`:
             dyad?`The lower ${label(anchor.midi)} stays in place. Its five-semitone perfect fourth becomes a four-semitone major third; this two-note shape does not establish a complete triad.`:
             "A half-step movement is a factual observation; it does not by itself prove a harmonic resolution.")});
      }
    }
    const model={regions,facts,events,tonic,reference:options.reference||"No established tonic",label,pedals};
    model.regionAt=beat=>regions.find(r=>beat>=r.start && beat<r.end) || regions[regions.length-1];
    return model;
  }
  function noteInfo(event,region,model) {
    const root=region?.root, role=root===null || root===undefined?"Root not established":roles[pc(event.midi-root)];
    const degree=model.tonic===null?null:degrees[pc(event.midi-model.tonic)];
    return {role,degree,reference:model.reference,root,rootName:root===null || root===undefined?null:names[root]};
  }
  function findExample(model,request) {
    const candidates=model.facts.filter(f=>{
      if(request.kind==="interval")return f.category==="intervals" && f.simple===request.interval && f.kind==="Together";
      if(request.kind==="motion")return f.category==="motion" && (!request.motion || f.kind===request.motion);
      if(request.kind==="layer")return f.notes.some(id=>model.events.some(e=>e.id===id && e.layer===request.layer));
      return false;
    });
    const match=candidates.find(f=>request.fromPC===undefined || model.events.some(e=>e.id===f.notes[0] && pc(e.midi)===pc(request.fromPC))) || null;
    return match || null;
  }
  root.CueTheory=Object.freeze({pc,names,interval,chord,analyze,noteInfo,findExample});
})(globalThis);
