// Döljer textblock som saknar stabila id:n: leveransadress, valt ombud,
// adresser som speditörer meddelar samt Swish-numret.
(function () {
  // Rubriker vars innehåll (syskonelement) ska döljas.
  const HIDE_HEADINGS =
    /^(levereras till|leveransadress|faktureringsadress|ombud|ditt ombud|valt ombud|utlämningsställe|telefonnummer för swishbetalning)$/i;
  // Rubriker i fraktpanelerna som är ofarliga att visa.
  const SAFE_HEADINGS = /^(förväntad leveransdag|information)$/i;
  // Postnummer (5 siffror) i en löptext = troligen en adress.
  const ZIP = /\b\d{3}\s?\d{2}\b/;

  function hide(el) {
    el.classList.add("ism-hidden");
  }

  function hideAfter(h) {
    for (let n = h.nextElementSibling; n; n = n.nextElementSibling) hide(n);
  }

  function scan() {
    document.querySelectorAll("h4, h3, h2").forEach((h) => {
      if (HIDE_HEADINGS.test(h.textContent.trim())) hideAfter(h);
    });

    // Fraktpaneler (Postnord/DHL/Budbee/Instabox m.fl.): allt utom
    // leveransdag/information som innehåller en adress eller ett ombud.
    document
      .querySelectorAll('input[name="delivery-method"][aria-controls]')
      .forEach((input) => {
        const panel = document.getElementById(input.getAttribute("aria-controls"));
        if (!panel) return;
        panel.querySelectorAll("h4").forEach((h) => {
          if (!SAFE_HEADINGS.test(h.textContent.trim())) hideAfter(h);
        });
        panel.querySelectorAll("strong, span, p, div, li, address, label, option").forEach((el) => {
          if (el.closest(".ism-hidden")) return;
          const ownText = Array.from(el.childNodes)
            .filter((c) => c.nodeType === 3 || (c.nodeType === 1 && c.tagName === "BR"))
            .map((c) => c.textContent)
            .join(" ");
          if (ZIP.test(ownText)) hide(el);
        });
      });
  }

  new MutationObserver(scan).observe(document.documentElement, {
    childList: true,
    subtree: true,
  });
  scan();
})();
