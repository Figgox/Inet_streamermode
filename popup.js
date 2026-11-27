const toggle = document.getElementById("toggle");
const opsec = document.getElementById("opsec");
const opsecRow = document.getElementById("opsec-row");
const status = document.getElementById("status");

function render(s) {
  toggle.checked = s.enabled;
  opsec.checked = s.opsec;
  opsec.disabled = !s.enabled;
  opsecRow.classList.toggle("disabled", !s.enabled);
  status.textContent = !s.enabled
    ? "Av: allt visas."
    : s.opsec
      ? "På: kunduppgifter är dolda bakom svarta block."
      : "På: kunduppgifter är suddade.";
}

function state() {
  return { enabled: toggle.checked, opsec: opsec.checked };
}

chrome.storage.local.get({ enabled: true, opsec: false }, (r) =>
  render({ enabled: r.enabled !== false, opsec: r.opsec === true })
);
toggle.addEventListener("change", () => {
  chrome.storage.local.set({ enabled: toggle.checked });
  render(state());
});
opsec.addEventListener("change", () => {
  chrome.storage.local.set({ opsec: opsec.checked });
  render(state());
});
