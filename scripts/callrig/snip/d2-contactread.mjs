export default async ({ page }) => {
  const hits = [];
  page.on('response', async r => {
    const u = r.url(); if (!u.includes('/api/v1/')) return;
    let b = ''; try { b = await r.text(); } catch {}
    if (/998 90 123|qa-probe|example\.org|"contacts"/.test(b))
      hits.push({ u: u.replace(/^https?:\/\/[^/]+/, ''), s: r.status, snippet: (b.match(/.{0,40}"contacts".{0,180}/) || [b.slice(0,160)])[0] });
  });
  await page.goto('https://airion-cargo.store/w/W4QDF1XTURESO01/settings/account', { waitUntil: 'networkidle' });
  await page.waitForTimeout(3500);
  const storage = await page.evaluate(() => {
    const found = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i); const v = localStorage.getItem(k) || '';
      if (/998 90 123|qa-probe|example\.org|contacts/i.test(v) || /contact/i.test(k))
        found.push({ where: 'localStorage', k, v: v.slice(0, 220) });
    }
    for (let i = 0; i < sessionStorage.length; i++) {
      const k = sessionStorage.key(i); const v = sessionStorage.getItem(k) || '';
      if (/998 90 123|qa-probe|example\.org/.test(v)) found.push({ where: 'sessionStorage', k, v: v.slice(0, 220) });
    }
    return found;
  });
  const shown = await page.evaluate(() => {
    const g = p => { const e = document.querySelector(`input[placeholder="${p}"]`); return e ? e.value : '(missing)'; };
    return { phone: g('+1 555 0100'), github: g('https://github.com/username') };
  });
  return { fieldsOnScreen: shown, responsesCarryingContacts: hits, storageHits: storage };
};
