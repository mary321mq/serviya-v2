(function () {
  function renderMermaid() {
    if (!window.mermaid) return;
    window.mermaid.initialize({ startOnLoad: false, theme: "default" });
    window.mermaid.run({ querySelector: ".mermaid" });
  }

  if (typeof document$ !== "undefined") {
    document$.subscribe(renderMermaid);
  } else {
    document.addEventListener("DOMContentLoaded", renderMermaid);
  }
})();
