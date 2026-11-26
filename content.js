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

  const EMAIL = /[\w.+-]+@[\w-]+(?:\.[\w-]+)+/g;
  const STYLE =
    ".ism-hidden{filter:blur(8px)!important;user-select:none!important;pointer-events:none!important}";

  function hide(el) {
    el.classList.add("ism-hidden");
  }

  // E-postadresser i löptext (t.ex. chattfönstret): linda in och sudda.
  function hideEmails(root) {
    const doc = root.ownerDocument || root;
    const walker = doc.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const hits = [];
    for (let n = walker.nextNode(); n; n = walker.nextNode()) {
      const p = n.parentElement;
      if (!p || p.closest(".ism-hidden, script, style, textarea")) continue;
      if (/[\w.+-]+@[\w-]+(?:\.[\w-]+)+/.test(n.nodeValue)) hits.push(n);
    }
    hits.forEach((n) => {
      const frag = doc.createDocumentFragment();
      let last = 0;
      n.nodeValue.replace(EMAIL, (m, i) => {
        if (/@inet\.se$/i.test(m)) return m; // företagets egen adress
        frag.append(n.nodeValue.slice(last, i));
        const span = doc.createElement("span");
        span.className = "ism-hidden";
        span.textContent = m;
        frag.append(span);
        last = i + m.length;
        return m;
      });
      if (!last) return;
      frag.append(n.nodeValue.slice(last));
      n.replaceWith(frag);
    });
    root
      .querySelectorAll('input[type="email"], input[autocomplete~="email"], input[name*="mail" i]')
      .forEach(hide);
  }

  function hideAfter(h) {
    for (let n = h.nextElementSibling; n; n = n.nextElementSibling) hide(n);
  }

  // Chattrutan är en iframe som skapas via JS. Är den samma origin når vi
  // in i den härifrån (annars körs skriptet i själva ramen via all_frames).
  function scanFrames() {
    document.querySelectorAll("iframe").forEach((f) => {
      try {
        const d = f.contentDocument;
        if (!d || !d.body) return;
        if (!d.getElementById("ism-style")) {
          const st = d.createElement("style");
          st.id = "ism-style";
          st.textContent = STYLE;
          (d.head || d.documentElement).append(st);
          new MutationObserver(() => hideEmails(d.body)).observe(d.documentElement, {
            childList: true,
            subtree: true,
            characterData: true,
          });
        }
        hideEmails(d.body);
      } catch (e) {
        /* cross-origin: hanteras av all_frames */
      }
    });
  }

  function scan() {
    // Postort (skrivskyddat fält utan id) ligger bredvid postnumret.
    document
      .querySelectorAll('input[autocomplete~="postal-code"], #zipCode')
      .forEach((z) => {
        const row = z.closest(".row");
        if (row) row.querySelectorAll("input[readonly]").forEach(hide);
      });
    if (document.body) hideEmails(document.body);
    scanFrames();
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
    characterData: true,
  });
  setInterval(scanFrames, 1000); // iframe-innehåll laddas efter att ramen skapats
  scan();
})();
