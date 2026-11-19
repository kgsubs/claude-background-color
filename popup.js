// The picker saves one color; every open claude.ai tab picks it up straight away.
const pick = document.getElementById("pick");
const state = document.getElementById("state");

function show(color) {
  state.textContent = color ? "Using " + color : "Using Claude's own color";
  if (color) pick.value = color;
}

chrome.storage.sync.get("bg", ({ bg }) => show(bg));

pick.addEventListener("input", () => {
  chrome.storage.sync.set({ bg: pick.value });
  show(pick.value);
});

document.getElementById("reset").addEventListener("click", () => {
  chrome.storage.sync.remove("bg");
  show(null);
});
