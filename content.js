// Döljer textblock (t.ex. "Levereras till"-adressen, som ligger i en <strong>, inte <p>) som inte har stabila id:n.
(function () {
  const HEADINGS = /^(levereras till|leveransadress|faktureringsadress)$/i;

  function scan() {
    document.querySelectorAll("h4, h3, h2").forEach((h) => {
      if (!HEADINGS.test(h.textContent.trim())) return;
      const box = h.nextElementSibling;
      if (!box) return;
      box.classList.add("ism-hidden");
    });
  }

  new MutationObserver(scan).observe(document.documentElement, {
    childList: true,
    subtree: true,
  });
  scan();
})();
