// Only the isolated review copy reads this parameter; the live app is unchanged.
(function () {
  const design = new URLSearchParams(location.search).get("design") || "current";
  if (!["atmosphere", "header", "framed"].includes(design)) return;
  document.body.dataset.design = design;
  const stylesheet = document.createElement("link");
  stylesheet.rel = "stylesheet";
  stylesheet.href = design + ".css";
  document.head.append(stylesheet);
  const script = document.createElement("script");
  script.src = design + ".js";
  document.body.append(script);
})();
