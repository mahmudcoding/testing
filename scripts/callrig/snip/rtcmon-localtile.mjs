export default async ({page}) => await page.evaluate(() => {
  const t = document.querySelector('[data-testid="participant-tile"][data-local="true"]');
  if (!t) return { found:false };
  const nameEl = t.querySelector('[data-testid="participant-name"]');
  return {
    found: true,
    tileText: (t.textContent||'').replace(/\s+/g,' ').trim(),
    hasNameTestid: !!nameEl,
    nameText: nameEl ? nameEl.textContent.trim() : null,
    // every descendant that carries a name-ish attribute or is a leaf with text
    leaves: [...t.querySelectorAll('*')].filter(e=>!e.children.length && e.textContent.trim())
              .map(e=>({tag:e.tagName, id:e.getAttribute('data-testid'), aria:e.getAttribute('aria-label'), text:e.textContent.trim().slice(0,40)})),
    localTileCount: document.querySelectorAll('[data-testid="participant-tile"][data-local="true"]').length
  };
});
