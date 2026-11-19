// Recolors the page background on claude.ai (chat, Cowork, Code) with the color saved by the popup.
// It does not rely on Claude's class names, which change often. Instead it finds the page's own
// background color (the bottom layer under a few points of the screen), then tags every element
// painted in that color and repaints the tagged elements. Cards, message boxes and inputs in other
// colors are left alone. New elements (streaming replies, page changes) are tagged as they appear,
// and a light/dark theme switch re-reads the page's colors.
(() => {
  const ATTR = "data-kbg";
  let color = null;
  let originals = new Set();
  let styleEl = null;
  let queue = new Set();
  let timer = null;

  const clear = (c) => !c || c === "transparent" || c === "rgba(0, 0, 0, 0)";

  function setStyle(on) {
    if (!styleEl) {
      styleEl = document.createElement("style");
      (document.head || document.documentElement).appendChild(styleEl);
    }
    styleEl.textContent = on && color
      ? `html, body, [${ATTR}] { background-color: ${color} !important; }`
      : "";
  }

  // The page's own background: html, body, main, and the bottom-most painted layer at a few points.
  function detect() {
    originals = new Set();
    const add = (el) => {
      if (!el) return;
      const c = getComputedStyle(el).backgroundColor;
      if (!clear(c)) originals.add(c);
    };
    add(document.documentElement);
    add(document.body);
    add(document.querySelector("main"));
    const w = innerWidth, h = innerHeight;
    for (const [x, y] of [[w * 0.5, h * 0.5], [w * 0.5, h * 0.2], [w * 0.8, h * 0.6], [w * 0.3, h * 0.8]]) {
      const stack = document.elementsFromPoint(x, y);
      for (let i = stack.length - 1; i >= 0; i--) {
        const c = getComputedStyle(stack[i]).backgroundColor;
        if (!clear(c)) { originals.add(c); break; }
      }
    }
  }

  function tag(root) {
    if (!(root instanceof Element)) return;
    const els = [root, ...root.querySelectorAll("*")];
    for (const el of els) {
      if (el.hasAttribute(ATTR)) continue;
      if (originals.has(getComputedStyle(el).backgroundColor)) el.setAttribute(ATTR, "");
    }
  }

  function untagAll() {
    document.querySelectorAll(`[${ATTR}]`).forEach((el) => el.removeAttribute(ATTR));
  }

  // Full pass: switch our paint off, read the page's colors, tag, switch it back on.
  function apply() {
    setStyle(false);
    untagAll();
    if (!color) return;
    detect();
    tag(document.body);
    setStyle(true);
  }

  // New elements are tagged in batches, at most every 300 ms.
  function flush() {
    timer = null;
    if (!color) { queue.clear(); return; }
    setStyle(false);
    for (const el of queue) if (el.isConnected) tag(el);
    queue.clear();
    setStyle(true);
  }

  new MutationObserver((muts) => {
    if (!color) return;
    for (const m of muts) {
      if (m.type === "attributes") {
        if (m.target === document.documentElement) { apply(); return; } // theme switch on <html>
        continue;
      }
      for (const n of m.addedNodes) if (n instanceof Element) queue.add(n);
    }
    if (queue.size && !timer) timer = setTimeout(flush, 300);
  }).observe(document.documentElement, {
    childList: true, subtree: true,
    attributes: true, attributeFilter: ["class", "data-theme", "data-mode"],
  });

  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === "sync" && changes.bg) { color = changes.bg.newValue || null; apply(); }
  });

  chrome.storage.sync.get("bg", ({ bg }) => {
    color = bg || null;
    apply();
    setTimeout(apply, 1500); // once more after the app finishes drawing
  });
})();
