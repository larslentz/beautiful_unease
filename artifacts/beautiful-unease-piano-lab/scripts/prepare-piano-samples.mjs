import { copyFile, mkdir, readdir, rm } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const velocityLayers = [1, 8, 16];
const pitchClasses = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
const sampleNames = ["C", "Cs", "D", "Ds", "E", "F", "Fs", "G", "Gs", "A", "As", "B"];
const publicSampleDirectory = path.join(projectRoot, "public", "piano-samples");

await rm(publicSampleDirectory, { recursive: true, force: true });
await mkdir(publicSampleDirectory, { recursive: true });

let sampleCount = 0;
for (const velocity of velocityLayers) {
  const sampleDirectory = path.join(
    projectRoot,
    "node_modules",
    "@audio-samples",
    `piano-mp3-velocity${velocity}`,
    "audio",
  );
  const sampleFiles = (await readdir(sampleDirectory))
    .filter((file) => new RegExp(`^[A-G]#?[0-8]v${velocity}\\.mp3$`).test(file))
    .map((file) => {
      const match = file.match(/^([A-G])(#?)([0-8])v\d+\.mp3$/);
      if (!match) throw new Error(`Unexpected Salamander sample filename: ${file}`);
      const pitch = pitchClasses[match[1]];
      const midi = (Number(match[3]) + 1) * 12 + pitch + (match[2] ? 1 : 0);
      return { file, midi };
    })
    .sort((a, b) => a.midi - b.midi);

  if (sampleFiles.length !== 30) {
    throw new Error(
      `Expected 30 Salamander velocity-${velocity} samples; found ${sampleFiles.length}.`,
    );
  }

  for (const { file, midi } of sampleFiles) {
    const publicFile = `${sampleNames[midi % 12]}${Math.floor(midi / 12) - 1}v${velocity}.mp3`;
    await copyFile(path.join(sampleDirectory, file), path.join(publicSampleDirectory, publicFile));
    sampleCount += 1;
  }
}

console.log(
  `Prepared ${sampleCount} piano sample files across ${velocityLayers.length} velocity layers.`,
);
