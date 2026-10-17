BEAUTIFUL UNEASE
Piano Harmony & Melody Lab
--------------------------

The hosted app loads piano samples from its own site when you press Listen; no
third-party audio service or account is used. The downloaded ZIP includes
embedded sample data and works offline when you open index.html directly.
Browser audio requires Web Audio and MP3 decoding support.

WHAT IS HERE
------------
Six embedded starting moods: Romantic melancholy (62 BPM), Paired dyads
(62 BPM), Held bass (58 BPM), Blue hour mystery (66 BPM), Windowlight (72 BPM),
and Tidepool reflections (64 BPM). Each starts with an original cue. The roll,
event table, sound preview, project JSON and MIDI all read the active event
array. FL Studio labels use MIDI 60 =
C5; Scientific labels use MIDI 60 = C4. Changing label convention never
changes a note's MIDI number.

The mood studio offers six original palettes: Pacific Northwest dream mystery,
wistful romance, gentle resolution, Velvet noir, Ember pulse and Prismatic
drift. Each seed creates three
repeatable variations that change more than pitch transposition: harmony,
melody shape or timing, bass movement and tempo can differ. Preview a variation
without changing the current cue, or apply it; the piano roll, event table,
project JSON and MIDI then use the applied event array. Apply supports undo and
redo. The palettes use original musical traits and do not reproduce any show's
theme or soundtrack.

Edit with the mouse, keyboard, event table or numeric editor. Drag a note to
change pitch/start, drag its right edge to change duration, double-click empty
roll space to add a note, and use Delete or the selected-note editor to remove
one. Arrow keys move the selected note by a semitone or current snap amount.
Undo and redo are available. A click on empty roll space sets the playhead
position. The roll can scroll vertically and horizontally.

The preview uses Salamander Grand Piano V3 samples by Alexander Holm
(CC BY 3.0). Soft (v1), medium (v8) and strong (v16) notes use different
recorded sample layers selected by MIDI velocity, in addition to
velocity-sensitive volume, pitch-matched samples and natural piano decay.
Hosted playback loads samples from this site's own static files; opening the
downloaded ZIP's index.html directly uses embedded sample data and needs no
network. Mood previews use local delay; these effects are generated in the
browser and are not included in MIDI. Playback timing uses Web Audio
scheduling. MIDI has
format 1, 480 PPQ, a conductor track and separate harmony, bass and melody
tracks; program 0 is General MIDI Acoustic Grand Piano. Default export contains
no sustain controller data. Choose whether MIDI includes every layer or only
currently audible layers. A same-pitch overlap on the same track is rejected
with an explanation rather than exported as a potentially stuck note.

Files available from the app:
  - Standard MIDI (.mid)
  - Project JSON (validated on open)
  - Human-readable event CSV
  - beautiful-unease-piano-lab.zip (offline copy with embedded samples and
    bundled fonts and licenses)

SUGGESTED MANUAL ACCEPTANCE CHECKLIST
-------------------------------------
1. Open the hosted app in a current desktop browser. Then extract the offline
   ZIP and open its index.html with networking disabled.
2. Check the octave labels: MIDI 60 is C5 in FL Studio mode and C4 in
   Scientific mode. Check that the MIDI number and sound do not change.
3. Compare MIDI 51 = Eb4, MIDI 36 = C3; set transpose +2 and inspect event
   numbers and unchanged positions. Try an out-of-range transpose and confirm
   it is rejected, not clamped.
4. Confirm the Romantic preset's first chord begins at tick 0 and lasts 3,840
   ticks, bar 3 begins at 3,840, first melody begins at tick 480 for 960 ticks,
   bar 8 beat 3 begins at tick 14,400, and the 8-bar arrangement ends at
   tick 15,360.
5. Compare all event table values with the prompt. The listed harmony notes
   total 23 events (5 + 5 + 5 + 4 + 4). The acceptance section separately
   requests 24. This application keeps the exact listed notes and exposes the
   discrepancy in Diagnostics rather than inventing an extra pitch.
6. Select Paired dyads and check MIDI pairs [51,56], [51,55], [53,58],
   [53,57]. The optional melody is a separate variant.
7. Select Held bass; verify the C3 event spans 32 beats. Try reattacking the
   bass and confirm events and exports change.
8. Listen, pause, resume, stop, loop and seek. Try mute and solo, and test a
   browser without Web Audio to confirm the clear unsupported-browser message.
9. Generate all three mood palettes with the same seed twice; confirm each set
   repeats. Preview without applying, apply one, verify tempo/notes/export
   update, then undo and redo. Change the seed and compare the new variants.
10. Drag and resize roll notes, use double-click, Delete, numeric edit, undo
   and redo. Check keyboard-only operation and zoom/scroll at narrow widths.
11. Save JSON, reload it in a fresh session, export CSV and MIDI, then inspect
    the MIDI header (MThd), format 1, four tracks, 480 PPQ, tempo, note event
    ordering and end-of-track positions.
12. Reset after edits and confirm the exact selected preset is restored.
13. Inspect the browser console and network panel for errors or requests.

LIMITATIONS / HONEST STATUS
---------------------------
Hosted playback loads samples from the app's own site. The downloaded ZIP uses
embedded samples and works without a network connection. Browser audio support
and download behavior vary by browser and must be checked in the target browser. The original Romantic
specification has an arithmetic inconsistency: exact harmony note entries sum
to 23 although one acceptance count says 24.

The color variations and lessons are educational prompts, not claims that
chords have universal emotions or that these cues reproduce any named artist.
