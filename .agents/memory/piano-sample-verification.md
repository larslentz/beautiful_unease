---
name: Piano sample verification
description: Avoid a development-server startup race when preparing the piano samples.
---

Finish the sample-preparing build before restarting the app's Vite server; do not run them concurrently.

**Why:** Sample preparation temporarily replaces the public sample directory. Vite starting during that window can retain an incomplete public-file list and return the SPA HTML fallback with HTTP 200 for MP3 requests, causing misleading audio decoding errors.

**How to apply:** Sequence the build before the workflow restart. If an audio decoding error appears after a build/start overlap, verify the sample response is `audio/mpeg`, not HTML, before investigating codecs or changing the audio engine.
