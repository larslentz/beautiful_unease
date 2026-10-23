/* Beginner explanations of the rules in app.js; no music is generated here. */
(function () {
  "use strict";

  const startingMoods = {
    romantic: [
      ["The starting idea", "C minor is the home key. Cm(add9) → Abmaj7 → Fm9 → G7sus4 → G7 uses a minor home chord, richer neighboring chords, and a dominant chord that invites a return home. A chord is several notes sounding together; a progression is their order."],
      ["Listen for", "Near the end, C falls to B over G7. That one-key move is a semitone (half step): the distance to the next piano key, black or white. B then wants to rise back to C when the loop restarts."],
      ["Try it", "Solo the chord layer, then bring back the melody. D above a C-minor chord is an added ninth: a second above C, placed an octave higher. Compare the harmony with and without that D."]
    ],
    dyads: [
      ["The starting idea", "A dyad is a two-note shape, not a complete three-note chord. Eb–Ab becomes Eb–G; F–Bb becomes F–A. The lower note stays still while the upper note falls one semitone."],
      ["Listen for", "A perfect fourth spans five semitones. A major third spans four. The change from fourth to third can feel like tension relaxing, even though only one note moves."],
      ["Try it", "Listen to the upper note alone, then both notes. This preset has no bass or melody at first; generating a mood variation adds those layers, so compare the texture as well as the pitches."]
    ],
    held: [
      ["The starting idea", "One low C lasts for all eight bars while the chords above it change. This is a pedal point: a held note that remains through different harmonies. It does not mean the sustain pedal."],
      ["Listen for", "The same C fits some upper chords more comfortably than others. Over the final G7 color it keeps the music from sounding like a simple root-position dominant chord."],
      ["Try it", "Mute the bass, listen, then restore it. Notice how the upper harmony has not changed, but its relationship to the low note has."]
    ],
    "blue-hour": [
      ["The starting idea", "D minor is home. Dm(add9), Bbmaj7 and Gm9 lead to A7sus4 and then A7. Extensions such as a seventh or ninth are extra chord colors beyond a basic three-note chord."],
      ["Listen for", "D in the suspended A chord moves to C# in A7. A suspension delays a chord's third; here the D-to-C# half step creates a clearer pull toward D minor. The cue ends on A7 rather than writing out a final D-minor chord."],
      ["Try it", "Listen through the loop boundary. The first chord of the next loop supplies the return to D minor that the ending leaves open."]
    ],
    windowlight: [
      ["The starting idea", "F major is home. Fmaj7 → Dm7 → Bbmaj7 → Csus4 → Fmaj7 combines major-key chords with sevenths. A major seventh is eleven semitones above a root; it adds color without turning a major chord into a minor one."],
      ["Listen for", "The final melody lands on F, the tonic or home note. The bass also returns to F, making the ending more settled than a cue that stops on its dominant."],
      ["Try it", "Compare the last F in the melody with the same note over the earlier C bass. A note's role depends on what sounds beneath it, not just its name."]
    ],
    tidepool: [
      ["The starting idea", "A minor is home. The bass moves while sustained chord groups sit above it. An inversion places a chord note other than its root at the bottom; changing the bass can also create a new chord color."],
      ["Listen for", "Toward the end, A over E changes to G# over E, producing an E7 color that pulls back toward A minor. G# is the raised seventh of A minor and sits a half step below A."],
      ["Try it", "Solo the bass to follow its path, then add the held chord layer. These are sustained chord groups, not an automatically generated arpeggio (chord notes played one after another)."]
    ]
  };

  const palettes = {
    "pnw-mystery": ["C harmonic minor", "A minor third (C–Eb) establishes a minor color; B is the raised seventh, a half step below C. Slow pacing, held bass and gaps in the melody can leave space for uncertainty. These are broad compositional techniques, not a reproduction of a soundtrack."],
    "wistful-romance": ["C natural minor", "Eb, Ab and Bb give the note collection its minor character. There is no B-natural leading tone built into this collection. Sparse phrases and small bass alterations can make the cue less direct, but no scale guarantees a particular emotion."],
    "gentle-resolution": ["C major", "E rather than Eb gives the collection its major third. The rules bring existing notes toward this major collection, then change spacing and melodic timing. The name suggests a direction; the code does not guarantee a resolving cadence (a chord pattern that sounds like an ending)."],
    "velvet-noir": ["a custom C-centered collection", "C, D, Eb, F, Gb, Ab, A and Bb combine a minor third with both a flattened fifth (Gb) and two sixth-degree colors (Ab and A). Gb is six semitones from C, a tritone. The algorithm uses the collection as a pitch guide, not a requirement to play every color."],
    "ember-pulse": ["C Mixolydian", "This resembles C major with Bb instead of B. The major third keeps a brighter color while the lowered seventh softens the usual leading-tone pull to C. Faster tempo and melodic additions create movement; no drum pattern is added."],
    "prismatic-drift": ["C Lydian", "This resembles C major with F# instead of F. F# is the raised fourth, the distinctive Lydian color. It can sound less settled against C, but it will only be heard if the generated notes actually use it."]
  };

  const harmony = {
    ninth: "First, chord notes move to the nearest pitch in the palette. In one seed-chosen chord group, the highest note is then raised two semitones (a whole step). This aims for an extension-like color. It is not a root-aware ninth builder: a true ninth is fourteen semitones above a chord root, and this rule does not guarantee that interval.",
    chromatic: "First, chord notes move into the palette. In one seed-chosen chord group, an inner note (the second-highest) is lowered one semitone. Chromatic means movement by half steps, possibly outside the palette. This can add friction, but the code does not automatically resolve that note afterward.",
    open: "First, chord notes move into the palette. In one seed-chosen chord group, the highest note rises seven semitones (a perfect fifth), or five (a perfect fourth) if the first move is unavailable. This spreads the voicing—the vertical spacing of notes. It does not guarantee an open-fifth chord above the root.",
    major: "Chord notes first move toward the palette's note collection. The highest note of one seed-chosen chord group then rises two semitones. A major third is four semitones above a root, but this rule does not identify roots or rebuild every chord as a major triad. Here, “major” names a color treatment, not a guaranteed chord quality."
  };
  const bass = {
    pedal: "Replace the bass layer with one low C, shifted by the Transpose control, held for the full cue. This is a pedal point: the low note stays still while the chords change. Its changing relationship to the harmony is the lesson.",
    stepwise: "If several bass notes already exist, lower every second one by one semitone, with a low-register limit. This adds small chromatic alterations; it does not turn every bass interval into a step. If there is no bass, build one from each chord group's lowest note, roughly an octave lower and adjusted to the palette.",
    roots: "Keep the existing bass rhythm and move its pitches to the nearest palette notes. “Roots” is the recipe label, not chord-root detection: an existing bass note need not be the root of its chord. If bass is missing, derive it from the lowest chord notes, roughly an octave below."
  };
  const melody = {
    sparse: "Adjust melody pitches to the palette, then, if there are more than three melody notes, remove roughly one in four. A rest is an intentional silence. Listen for space around the notes that remain.",
    delayed: "Adjust melody pitches to the palette, then move every second melody entrance half a beat later when there is room before the next entrance. Shorten its duration if needed. This changes timing, not just pitch: listen for an answer that arrives later.",
    passing: "Adjust melody pitches to the palette. Where a gap of at least half a beat exists between consecutive melody notes, add a short note near the midpoint of their pitches, adjusted to the palette. A textbook passing tone connects notes by step; these midpoint answers are not guaranteed to do that.",
    rising: "Adjust melody pitches to the palette, then raise the second half of the melody by about a whole step and adjust again to the palette. This lifts the later register (pitch range); it does not guarantee that every successive note rises."
  };
  const listen = {
    sparse: "Preview this version, then another with more melody. Can you hum the phrase more easily when some notes are missing?",
    delayed: "Count “1-and-2-and-3-and-4-and.” Listen for selected notes arriving half a beat later, on a different part of that count.",
    passing: "Listen for short answers in spaces that were silent. Do they connect the longer melody notes smoothly, or create a new leap?",
    rising: "Compare the first and second halves. Does the later phrase sit higher, even when individual notes still move downward?"
  };
  const recipeWords = {
    harmony: {
      ninth: "raise one top chord note by a whole step",
      chromatic: "lower one inner chord note by a half step",
      open: "spread one chord's top note upward",
      major: "fit chord notes to the palette, then lift one top note"
    },
    bass: {
      pedal: "hold one low C (transposed) throughout",
      stepwise: "alter alternate existing bass notes by a half step, or add bass if missing",
      roots: "fit existing bass pitches to the palette, or add bass if missing"
    },
    melody: {
      sparse: "remove some melody notes to leave rests",
      delayed: "delay alternate melody entrances by half a beat where space allows",
      passing: "add short answering notes in suitable gaps",
      rising: "lift the pitch range of the melody's second half"
    }
  };

  const endings = {
    borrowed: {
      notes: [36,43,52,55,62], melody: 72,
      theory: "The added chord is C(add9): C–E–G with an extra D. E natural replaces the Eb of C minor. The third—the note three or four semitones (half steps) above the root, the note a chord is named after—decides whether this basic chord is minor or major. E is four semitones above C, so the final tonic (home chord) becomes major. This is a parallel-major ending: C stays home, unlike changing to the relative major, Eb.",
      listen: "Listen for Eb giving way to E natural as the minor passage reaches its new C-major ending. That one-semitone change can feel brighter. D is the added ninth: a second above C, placed in a higher octave. It keeps some openness rather than closing on a plain C-major triad.",
      compare: "Compare this with Closed. Both add a C-based final bar with the same bass, timing and high C melody; only the chord's Eb changes to E natural. Solo Harmony to hear that one-note difference."
    },
    closed: {
      notes: [36,43,51,55,62], melody: 72,
      theory: "The added chord is Cm(add9): C–Eb–G with an extra D. The preceding G7 is the dominant—a chord that strongly points home. Moving from G7 to C minor is a dominant-to-tonic cadence, a chord change that can sound like an arrival. The melody also lands on C, the home note.",
      listen: "Listen for B in G7 wanting to rise a semitone to C at the new ending. The bass moves from G to C. The ending is more settled, but not completely plain: D is still an added ninth, fourteen semitones above C, which adds a gentle extra color.",
      compare: "Compare Original with Closed. Original leaves the return to C minor for the next loop; Closed writes that return into a new ninth bar. Then compare Borrowed-major: the ending's minor third, Eb, becomes E natural there."
    },
    uneasy: {
      notes: [36,43,51,59,62], melody: 67,
      theory: "The added chord is Cm(maj9): C–Eb–G–B–D. Eb keeps the minor third, while B is the major seventh, eleven semitones above C. The name combines a minor chord with a major seventh; it does not mean both a major and minor third are played. D supplies the ninth.",
      listen: "B sits one semitone below a C in the next octave. Keeping B over the low C preserves a pull toward C instead of fully releasing it. These notes are spread across registers, not necessarily adjacent piano keys. The melody ends on G, the fifth of C, rather than the high C used by Closed and Borrowed-major.",
      compare: "Compare Closed with Uneasy. The upper chord's G is replaced by B (a lower G remains), and the melody's high C changes to G. Solo Harmony first, then Melody: both layers change, so the difference is not just a darker sound effect."
    }
  };

  function endingEntries(ending, {applicable, transpose, pitchLabel}) {
    const recipe = endings[ending];
    const entries = [
      ["About this lesson", "Ending Color changes written notes, not the piano instrument or an audio effect. This explains the preset recipe; manual edits and applied Mood Palette variations can change the actual notes. The piano roll and event table always show the current cue."]
    ];
    if (!recipe) {
      entries.push(
        ["How it works", "Original ending adds no extra bar. It uses the ending supplied by the Starting Mood and chosen Length, with any selected voicing and melody settings. Original does not necessarily mean resolved: an ending can point toward the start of the next loop."],
        ["Listen for", applicable
          ? "In the eight-bar Romantic melancholy preset, the cue stops on G7. Its B is one semitone below C, inviting a return to C minor when the loop restarts. Closed writes that return into an extra bar; Borrowed-major changes its final chord to major; Uneasy holds on to a major-seventh tension."
          : "Follow the last bass and melody notes, then listen across the loop boundary. Do they arrive on the home note, or does the next loop supply the arrival? Different Starting Moods and lengths can end at different points."],
        ["Try it", "To compare the three added endings, choose Romantic melancholy and Length 8, then select an Ending Color. Turn Loop off if you want to hear the final bar stop rather than run straight into another pass."]
      );
    } else {
      entries.push(
        ["When this applies", applicable
          ? "This recipe works with Romantic melancholy at Length 8. It appends bar 9 after the original eight bars; it does not replace bar 8. Length remains the eight-bar source arrangement, while the cue/readout becomes nine bars (36 beats)."
          : "This option currently adds no ending: the extra-ending recipes only work with Romantic melancholy at Length 8. Select that Starting Mood and length, then choose the Ending Color again. Other Starting Moods and lengths keep their existing ending."],
        ["The music theory", recipe.theory],
        ["The written recipe", "The added bass and chord notes, from low to high using your current Transpose and Octave Labels settings, are "+recipe.notes.map(midi=>pitchLabel(midi+transpose)).join(", ")+", with "+pitchLabel(recipe.melody+transpose)+" in the melody. Repeated note names are the same pitch class in different octaves. The bass and chord last four beats; the melody lasts three, leaving the last beat to the held harmony. These are the recipe's pitches, not an analysis of later edits."],
        ["Listen for", recipe.listen],
        ["Try it", recipe.compare+" Turn Loop off to hear the cue stop at its ending."]
      );
    }
    if (transpose) entries.push(["About transposition", "The theory above uses the original C-centered note names. Your Transpose setting shifts the whole written cue by "+transpose+" semitones (half steps); the chord relationships stay the same. Octave Labels only changes the names displayed, not the pitches."]);
    entries.push(["Changing this control", "Selecting an Ending Color rebuilds the cue from the current Starting Mood and arrangement settings. It is not an extra treatment layered onto a generated or manually edited cue."]);
    return entries;
  }

  function details(summaryText, entries, open = false) {
    const element = document.createElement("details");
    element.className = "teaching-guide";
    element.open = open;
    const summary = document.createElement("summary");
    summary.textContent = summaryText;
    const body = document.createElement("div");
    body.className = "teaching-body";
    entries.forEach(([heading, text]) => {
      const section = document.createElement("section");
      const title = document.createElement("h4");
      title.textContent = heading;
      const paragraph = document.createElement("p");
      paragraph.textContent = text;
      section.append(title, paragraph);
      body.append(section);
    });
    element.append(summary, body);
    return element;
  }

  function paletteEntries(id, palette, noteNames, transpose) {
    const [collection, explanation] = palettes[id];
    return [
      ["The musical idea", explanation],
      ["A few useful words", "Harmony is the way notes sound together. A melody is a line of notes you might hum; the bass is the low foundation. A beat is the steady count; this app groups four beats into a bar. A semitone (half step) moves to the next piano key, black or white. Two semitones make a whole step; twelve make an octave. Transposing shifts pitches by the same distance."],
      ["The note collection", `Before transposition, this palette uses ${collection}. With your current Transpose setting (${transpose > 0 ? "+" : ""}${transpose} semitones), its guide notes are ${noteNames.join(", ")}. A scale is a selected set of pitches. This palette starts from C, not from an automatically detected key in your Starting Mood. Choosing a D-minor or F-major Starting Mood does not change that rule.`],
      ["How the recipe works", "The generator copies your current cue, adjusts chord and melody pitches toward the palette, then changes one chord group, the bass treatment and the melodic phrasing. Most chord start times and lengths stay in place. Special chord and bass moves happen after pitch adjustment and may use notes outside the collection. If melody is missing, a short motif (a small musical idea) is added above the chord groups."],
      ...palette.variants.map(variant => [variant.name, `This recipe will ${recipeWords.harmony[variant.harmony]}; ${recipeWords.bass[variant.bass]}; and ${recipeWords.melody[variant.melody]}. Tempo: ${variant.tempo > 0 ? "+" : ""}${variant.tempo} BPM from the source cue, limited to 45–85 BPM. Generate the variations and open “How this variation works” on each card for the exact rules and a listening exercise.`]),
      ["What the seed does", "A seed is a number that makes the random choices repeatable—for example, which chord group changes. The same source notes, tempo, length, transpose, palette and seed produce the same results. A new seed changes choices within each recipe, not the recipe itself. Generating again after applying a variation uses the newly applied cue as the source."],
      ["Notes versus sound", `The ${palette.toneId} sound profile changes a quiet echo (audio delay) during preview. It does not add wobble, change the MIDI pitches or become part of the MIDI export. A delayed melody entrance changes note timing; an audio delay repeats sound. Those are different things. Mood names are listening suggestions, not universal emotional meanings.`]
    ];
  }

  function variationEntries(variant, candidate, baseEvents, baseTempo, noteName) {
    const originals = new Map(baseEvents.map(note => [note.id, note]));
    const generated = new Map(candidate.events.map(note => [note.id, note]));
    const pitchChanges = candidate.events.filter(note => originals.has(note.id) && originals.get(note.id).midi !== note.midi);
    const timeChanges = candidate.events.filter(note => originals.has(note.id) && originals.get(note.id).startBeat !== note.startBeat);
    const added = candidate.events.filter(note => !originals.has(note.id)).length;
    const removed = baseEvents.filter(note => !generated.has(note.id)).length;
    const example = pitchChanges.find(note => note.layer === "chord") || pitchChanges[0];
    const exampleText = example ? ` For example, a ${example.layer} note at bar ${Math.floor(example.startBeat / 4) + 1} changes from ${noteName(originals.get(example.id).midi)} to ${noteName(example.midi)} (MIDI ${originals.get(example.id).midi} → ${example.midi}).` : " No retained notes change pitch in this result.";
    return [
      ["1 · Harmony: notes sounding together", harmony[variant.harmony] + " Moves that would duplicate a chord pitch or leave the MIDI range are skipped."],
      ["2 · Bass: the low foundation", bass[variant.bass]],
      ["3 · Melody: the line you might hum", melody[variant.melody]],
      ["4 · Pace", `BPM means beats per minute. This recipe requests ${variant.tempo > 0 ? "+" : ""}${variant.tempo} BPM: ${baseTempo} becomes ${candidate.tempo} BPM after the 45–85 BPM limit. The bar count stays the same; slower beats simply take longer.`],
      ["In this generated result", `Compared with the source cue: ${pitchChanges.length} retained notes change pitch, ${timeChanges.length} change entrance time, ${added} notes are added and ${removed} are removed. These counts compare event identities, so replacing a bass note can count as both a removal and an addition.${exampleText}`],
      ["Listen and learn", listen[variant.melody] + " Use Preview to audition, then Apply to cue to inspect the exact notes in the piano roll and event table. Use the layer controls to hear bass, chords or melody separately."]
    ];
  }

  window.CueTeaching = { details, startingMoods, endingEntries, paletteEntries, variationEntries };
})();
