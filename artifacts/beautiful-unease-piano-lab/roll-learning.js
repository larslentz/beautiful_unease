/* DOM explanations and canvas annotations share one event-derived model. */
(function () {
  "use strict";
  const $=id=>document.getElementById(id), T=window.CueTheory;
  const make=(tag,text,className)=>{
    const node=document.createElement(tag);if(text!==undefined)node.textContent=text;
    if(className)node.className=className;return node;
  };
  const factKey=f=>JSON.stringify([f.category,f.kind,f.notes]);
  window.createRollLearning=function({read,redraw,selectNote}) {
    const mode=$("learningMode"),regionSelect=$("learningRegion"),timeline=$("theoryTimeline");
    const details=$("theoryDetails"),examples=$("theoryExamples"),status=$("theoryStatus");
    let model=null,modelKey="",uiKey="",pinnedBeat=null,chosenKey=null,notice="",geometry=null;
    const enabled=category=>mode.value!=="off" && Boolean(document.querySelector(`[data-learning-category="${category}"]`)?.checked);
    function currentModel() {
      const source=read(),key=JSON.stringify([source.events,source.totalBeats,source.tonic,source.reference,source.octave]);
      if(key!==modelKey) {
        model=T.analyze(source.events,source);modelKey=key;uiKey="";
        if(chosenKey && !model.facts.some(f=>factKey(f)===chosenKey))chosenKey=null;
      }
      return model;
    }
    function region() {
      const source=read();
      return model.regionAt(pinnedBeat??(source.isPlaying?source.playhead:source.seekBeat));
    }
    function visibleFact(f) {
      return enabled(f.category==="intervals" && f.kind==="Melodic motion"?"motion":f.category);
    }
    function selectedFact(r) {
      if(chosenKey)return model.facts.find(f=>factKey(f)===chosenKey && visibleFact(f))||null;
      const selected=model.events.find(n=>n.id===read().selectedId);
      if(selected && selected.startBeat<r.end && selected.startBeat+selected.durationBeats>r.start)return null;
      return r?.facts.find(f=>f.simple==="minor third" && visibleFact(f)) || r?.facts.find(visibleFact) || null;
    }
    function selectedNote(id) {
      const note=model?.events.find(e=>e.id===id);
      if(note){pinnedBeat=note.startBeat;chosenKey=null;notice="";uiKey="";}
    }
    function focusNotes(ids) {
      if(!geometry)return;
      const notes=model.events.filter(n=>ids.includes(n.id));
      if(!notes.length)return;
      const viewport=$("pianoRoll").closest(".roll-viewport");
      const xs=notes.map(n=>50+n.startBeat*geometry.bw),ys=notes.map(n=>9+(geometry.pitchHigh-n.midi)*geometry.rowHeight);
      const timelineH=timeline.hidden?0:timeline.offsetHeight;
      viewport.scrollLeft=Math.max(0,Math.min(...xs)-70);
      // Keep the first endpoint visible even when the interval spans the viewport.
      viewport.scrollTop=Math.max(0,timelineH+Math.min(...ys)-timelineH-45);
    }
    function activateFact(f,focus=false) {
      chosenKey=factKey(f);pinnedBeat=model.regions.find(r=>r.id===f.regionId)?.start??f.start;notice="";uiKey="";
      redraw();if(focus)focusNotes(f.notes);
    }
    function buildTimeline() {
      const {w,bw}=geometry,lanes=[];
      timeline.style.width=w+"px";timeline.style.minWidth=w+"px";
      const buttons=model.regions.map(r=>{
        const x=50+r.start*bw, width=Math.max(70,Math.min(220,(r.end-r.start)*bw-5));
        let lane=lanes.findIndex(end=>end+4<=x);if(lane<0)lane=lanes.length;lanes[lane]=x+width;
        const b=make("button",undefined,"theory-region");
        b.type="button";b.dataset.region=r.id;b.dataset.category="harmony";b.dataset.theoryKey=r.id;
        b.style.left=x+"px";b.style.width=width+"px";b.style.top=(4+lane*34)+"px";
        b.append(make("strong",`Bar ${Math.floor(r.start/4)+1} · ${r.name}`),make("span",r.collection.join("–")||"Harmony rest"));
        b.setAttribute("aria-label",`Bar ${Math.floor(r.start/4)+1} beat ${r.start%4+1}: ${r.name}; ${r.collection.join(", ")||"no harmony notes"}`);
        b.addEventListener("click",()=>{pinnedBeat=r.start;chosenKey=null;notice="";uiKey="";redraw();focusNotes(r.notes.map(n=>n.id));});
        return b;
      });
      timeline.style.minHeight=(8+Math.max(1,lanes.length)*34)+"px";
      timeline.replaceChildren(...buttons);
      regionSelect.replaceChildren(new Option("Follow playback / cue position",""),
        ...model.regions.map(r=>new Option(`Bar ${Math.floor(r.start/4)+1}:${r.start%4+1} · ${r.name}`,String(r.start))));
    }
    function drawDetails(r,f) {
      const source=read(),note=model.events.find(e=>e.id===source.selectedId && e.startBeat<r.end && e.startBeat+e.durationBeats>r.start);
      const fragments=[make("div",model.reference,"eyebrow")];
      const rootText=r.root===null
        ? (r.alternatives.length?`Ambiguous: ${r.alternatives.join(" or ")}. No single chord root is assigned.`:"No confident chord root: these notes are shown as a pitch collection.")
        : `The sounding pitch collection matches ${r.name}, with chord root ${T.names[r.root]}. ${r.separateBass?"The bass is shown separately, not assumed to be the root. ":""}This is a voicing match, not automatic key detection.`;
      fragments.push(make("h3",f?f.title:note?`${model.label(note.midi)} · selected note`:`Bar ${Math.floor(r.start/4)+1} · ${r.name}`));
      if(f)fragments.push(make("p",f.text));
      else if(note) {
        const info=T.noteInfo(note,r,model);
        fragments.push(make("p",`${model.label(note.midi)} is MIDI ${note.midi}, in the ${note.layer==="chord"?"harmony":note.layer} layer. `+
          (info.rootName?`Relative to chord root ${info.rootName}: ${info.role}. `:"No verified chord role is assigned. ")+
          (info.degree?`Relative to reference ${T.names[model.tonic]}: degree ${info.degree}. These are pitch-class relationships, not the actual octave spacing. `:"No tonic is established for a scale-degree label. ")+
          `It begins at bar ${Math.floor(note.startBeat/4)+1}, beat ${note.startBeat%4+1}, and lasts ${note.durationBeats} beats.`));
      }
      fragments.push(make("p",rootText+" "+`Sounding harmony: ${r.collection.join("–")||"none"}. Select an interval below to see its actual half-step count.`));
      const list=make("div",undefined,"theory-note-list");list.setAttribute("aria-label","Notes sounding in the selected region");
      const notes=model.events.filter(n=>n.startBeat<r.end && n.startBeat+n.durationBeats>r.start);
      if(enabled("notes")||enabled("harmony"))for(const e of notes) {
        const info=T.noteInfo(e,r,model),b=make("button",undefined,"theory-note");
        b.type="button";b.dataset.category=e.layer==="chord"?"harmony":"notes";b.dataset.theoryKey="note:"+e.id;
        const degree=enabled("notes") && info.degree?`Degree ${info.degree} relative to ${T.names[model.tonic]}`:"";
        const role=enabled("harmony") && info.rootName?`${info.role} of ${info.rootName}`:"";
        b.append(make("strong",`${model.label(e.midi)} · ${e.layer==="chord"?"harmony":e.layer}`),
          make("span",[role,degree,`MIDI ${e.midi}`].filter(Boolean).join(" · ")));
        b.setAttribute("aria-pressed",String(source.selectedId===e.id));
        b.addEventListener("click",()=>{selectNote(e.id);focusNotes([e.id]);});
        list.append(b);
      }
      fragments.push(list);details.replaceChildren(...fragments);
      const factNodes=[make("h4","Select a relationship")];
      for(const fact of r.facts.filter(visibleFact)) {
        const b=make("button",undefined,"theory-example");b.type="button";
        b.dataset.category=fact.category;b.dataset.theoryKey=factKey(fact);
        b.setAttribute("aria-pressed",String(fact===f));
        const summary=fact.category==="intervals"?`${fact.kind} · ${fact.semitones} half steps`:`${fact.kind} · current played notes`;
        b.append(make("strong",fact.title),make("small",summary));b.addEventListener("click",()=>activateFact(fact,true));
        factNodes.push(b);
      }
      if(factNodes.length===1)factNodes.push(make("p","No relationships in the enabled categories are present in this region.","hint"));
      examples.replaceChildren(...factNodes);
    }
    function updateUI(r,f) {
      const source=read(),categoryKey=[...document.querySelectorAll("[data-learning-category]")].map(n=>n.checked);
      const key=JSON.stringify([modelKey,mode.value,categoryKey,r?.id,source.selectedId,f?.id,geometry.w,geometry.bw,notice]);
      if(key!==uiKey) {
        const active=document.activeElement,focusKey=active?.dataset?.theoryKey;
        buildTimeline();
        timeline.hidden=!enabled("harmony");
        details.hidden=examples.hidden=status.hidden=mode.value==="off";
        details.parentElement.hidden=mode.value==="off";
        regionSelect.disabled=mode.value==="off";
        document.querySelectorAll("[data-learning-category]").forEach(n=>n.disabled=mode.value==="off");
        regionSelect.value=pinnedBeat===null?"":String(r?.start??"");
        if(r)drawDetails(r,f);
        status.textContent=notice || (mode.value==="essentials"
          ?"Essentials: compact labels. Select a note or relationship for full, visible detail."
          :"Detailed: note labels, chord roles, scale degrees and exact interval examples. Brackets mark the selected relationship; short notes have full labels below.");
        timeline.querySelectorAll("[data-region]").forEach(b=>b.setAttribute("aria-current",String(b.dataset.region===r?.id)));
        if(focusKey)[...document.querySelectorAll("[data-theory-key]")].find(n=>n.dataset.theoryKey===focusKey)?.focus({preventScroll:true});
        uiKey=key;
      }
      const playing=model.regionAt(source.playhead);
      timeline.querySelectorAll("[data-region]").forEach(b=>b.classList.toggle("is-playing",source.isPlaying && b.dataset.region===playing?.id));
    }
    function draw(ctx,g) {
      geometry=g;currentModel();const r=region(),f=selectedFact(r);updateUI(r,f);
      if(mode.value==="off")return;
      const selectedIds=new Set(f?.notes || (read().selectedId?[read().selectedId]:[]));
      const boxes=[];
      ctx.save();ctx.font='9px "Space Mono", monospace';ctx.textAlign="left";ctx.textBaseline="middle";
      for(const e of model.events) {
        const x=50+e.startBeat*g.bw+1,y=9+(g.pitchHigh-e.midi)*g.rowHeight+2,width=Math.max(4,e.durationBeats*g.bw-2);
        boxes.push({x,y,w:width,h:g.rowHeight-4});
        if(selectedIds.has(e.id)){ctx.strokeStyle=g.colors.selection;ctx.lineWidth=2;ctx.strokeRect(x-1,y-1,width+2,g.rowHeight-2);}
        if(!enabled("notes") && !enabled("harmony"))continue;
        const info=T.noteInfo(e,model.regionAt(e.startBeat),model),text=[
          enabled("notes")?model.label(e.midi):"",
          mode.value==="detailed" && enabled("harmony") && info.rootName?`${T.names[info.root]}:${info.role}`:"",
          mode.value==="detailed" && enabled("notes") && info.degree?`${T.names[model.tonic]}:${info.degree}`:""
        ].filter(Boolean).join(" · ");
        const compact=enabled("notes")?model.label(e.midi):info.rootName?info.role:"";
        const content=ctx.measureText(text).width<width-12?text:compact;
        if(ctx.measureText(content).width<width-10) {
          ctx.save();ctx.beginPath();ctx.rect(x,y,width,g.rowHeight-4);ctx.clip();ctx.fillStyle=g.colors.mark;
          ctx.fillText(content,x+7,y+(g.rowHeight-4)/2);ctx.restore();
        }
      }
      if(f && f.category!=="harmony" && f.notes.length>=2) {
        const notes=f.notes.map(id=>model.events.find(e=>e.id===id)).filter(Boolean);
        const first=notes[0],last=notes[1];
        if(first && last) {
          const y1=9+(g.pitchHigh-first.midi)*g.rowHeight+g.rowHeight/2,y2=9+(g.pitchHigh-last.midi)*g.rowHeight+g.rowHeight/2;
          const x1=50+first.startBeat*g.bw+3,x2=50+last.startBeat*g.bw+3;
          ctx.strokeStyle=g.colors.selection;ctx.lineWidth=1.5;ctx.setLineDash([3,3]);ctx.beginPath();
          if(first.startBeat===last.startBeat){ctx.moveTo(x1+7,y1);ctx.lineTo(x1+2,y1);ctx.lineTo(x1+2,y2);ctx.lineTo(x1+7,y2);}
          else{ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);}
          ctx.stroke();ctx.setLineDash([]);
          const caption=f.category==="intervals"?`${f.short} · ${f.semitones} half steps`:f.short;
          const width=ctx.measureText(caption).width+12;
          const x=Math.min(g.w-width-2,Math.max(52,(x1+x2)/2+12));
          const candidates=[(y1+y2)/2,Math.min(y1,y2)-12,Math.max(y1,y2)+12];
          const y=candidates.find(y=>y>20 && !boxes.some(b=>x<b.x+b.w && x+width>b.x && y-7<b.y+b.h && y+7>b.y));
          // Never obscure editable note blocks; the complete caption also lives below.
          if(y!==undefined){ctx.fillStyle=g.colors.labels;ctx.fillRect(x,y-8,width,16);ctx.fillStyle=g.colors.text;ctx.fillText(caption,x+6,y);}
        }
      }
      ctx.restore();
    }
    function inferRequest(text) {
      if(/pedal point|held bass|held C|low C/i.test(text))return {kind:"motion",motion:"Pedal point"};
      if(/suspen|fourth to third|fourth.*major third/i.test(text))return {kind:"motion",motion:/dyad|five.semitone|fourth to third/i.test(text)?"Fourth to third":"Suspension"};
      for(const [pattern,name] of [[/minor third/i,"minor third"],[/major third/i,"major third"],[/major seventh/i,"major seventh"],[/ninth|add9/i,"major second"],[/perfect fourth/i,"perfect fourth"],[/tritone/i,"tritone"]])
        if(pattern.test(text))return {kind:"interval",interval:name};
      if(/half.step|semitone|chromatic/i.test(text))return {kind:"motion"};
      if(/melody|melodic|rhythm|rest|phrase/i.test(text))return {kind:"layer",layer:"melody"};
      if(/chord|harmon|voic|spacing/i.test(text))return {kind:"layer",layer:"chord"};
      return null;
    }
    function lessonRequests(text) {
      const requests=[];
      for(const [pattern,name] of [[/minor third/i,"minor third"],[/major third/i,"major third"],[/major seventh/i,"major seventh"],
        [/ninth|add9/i,"major second"],[/perfect fourth/i,"perfect fourth"],[/tritone/i,"tritone"]])
        if(pattern.test(text))requests.push({kind:"interval",interval:name,label:name==="major second"?"ninth / second":name});
      if(/pedal point|held bass|held C|low C/i.test(text))requests.push({kind:"motion",motion:"Pedal point",label:"pedal point"});
      if(/suspen/i.test(text))requests.push({kind:"motion",motion:"Suspension",label:"suspension"});
      if(/dyad|fourth to third|five.semitone/i.test(text))requests.push({kind:"motion",motion:"Fourth to third",label:"fourth → third"});
      if(!requests.length){const fallback=inferRequest(text);if(fallback)requests.push(fallback);}
      return requests;
    }
    function show(request={}) {
      currentModel();mode.value="detailed";
      const category=request.kind==="motion"?"motion":"intervals";
      const checkbox=document.querySelector(`[data-learning-category="${category}"]`);if(checkbox)checkbox.checked=true;
      const matching=model.facts.filter(f=>request.preferBeat===undefined || model.regions.find(r=>r.id===f.regionId)?.start>=request.preferBeat);
      const scoped={...model,facts:matching},fact=request.guard?null:T.findExample(scoped,request);
      if(fact)activateFact(fact,true);
      else {
        chosenKey=null;notice=request.guard || "Not currently played: no matching example is present in the actual cue. This lesson describes a possible or original relationship; no notes have been added or changed.";
        uiKey="";redraw();
      }
      $("rollTitle").scrollIntoView({behavior:"auto",block:"start"});details.focus({preventScroll:true});
    }
    function bindLessons() {
      document.querySelectorAll(".teaching-body section").forEach(section=>{
        if(section.querySelector("[data-show-on-roll]"))return;
        for(const request of lessonRequests(section.textContent)) {
        const button=make("button",request.label?`Show ${request.label} on piano roll`:"Show on piano roll","btn btn-small theory-lesson-link");button.type="button";button.dataset.showOnRoll="";
        button.addEventListener("click",()=>{
          const current=read(),card=section.closest(".mood-variant"),fromPalette=section.closest("#moodTeaching");
          const starting=section.closest("#startingMoodTeaching"),ending=section.closest("#endingColorTeaching");
          const fromPC=fromPalette || ending ?T.pc(current.transpose):starting?current.tonic:undefined;
          show({...request,...(request.kind==="interval" && fromPC!==null && fromPC!==undefined?{fromPC}:{}),
            ...(ending && current.ending!=="original"?{preferBeat:32}:{}),
            guard:card && !card.classList.contains("is-applied")?"Apply this variation to the cue first. This preview's recipe is not the active piano roll; no notes have been changed.":undefined});
        });section.append(button);
        }
      });
      if(!$("lessonShowOnRoll")){
        const button=make("button","Show on piano roll","btn btn-small theory-lesson-link");button.id="lessonShowOnRoll";button.type="button";
        button.addEventListener("click",()=>show(inferRequest($("lessonExplanation").textContent)||{kind:"layer",layer:"chord"}));
        $("lessonExplanation").after(button);
      }
    }
    mode.addEventListener("change",()=>{uiKey="";redraw();});
    document.querySelectorAll("[data-learning-category]").forEach(n=>n.addEventListener("change",()=>{uiKey="";redraw();}));
    regionSelect.addEventListener("change",()=>{pinnedBeat=regionSelect.value===""?null:Number(regionSelect.value);chosenKey=null;notice="";uiKey="";redraw();if(pinnedBeat!==null)focusNotes(region()?.notes.map(n=>n.id)||[]);});
    return {draw,selectedNote,bindLessons,show};
  };
})();
