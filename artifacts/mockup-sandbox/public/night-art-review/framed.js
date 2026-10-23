// Add the supplied painting as a framed, presentational companion to the intro.
(function () {
  const intro = document.querySelector(".intro");
  if (!intro || intro.querySelector(".intro-artwork")) return;

  const artwork = document.createElement("figure");
  artwork.className = "intro-artwork";
  const image = document.createElement("img");
  image.src = "/__mockup/images/night-landscape.webp";
  image.alt = "Night landscape with stars above dark trees, a gold-lit shore, and a quiet lake";
  image.decoding = "async";
  artwork.append(image);

  const sessionStamp = intro.querySelector(".session-stamp");
  if (sessionStamp) intro.insertBefore(artwork, sessionStamp);
  else intro.append(artwork);
})();
