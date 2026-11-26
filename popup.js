const toggle = document.getElementById("toggle");
const status = document.getElementById("status");

function render(on) {
  toggle.checked = on;
  status.textContent = on ? "På: kunduppgifter är suddade." : "Av: allt visas.";
}

chrome.storage.local.get({ enabled: true }, (r) => render(r.enabled !== false));
toggle.addEventListener("change", () => {
  chrome.storage.local.set({ enabled: toggle.checked });
  render(toggle.checked);
});
