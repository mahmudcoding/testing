export default async ({page}) => {
  const t0 = Date.now(), out = [];
  while (Date.now() - t0 < Number(process.env.QA_MAX || 30000)) {
    const s = await page.evaluate(() => {
      const hit = [...document.querySelectorAll('div,section')].find(e =>
        /Incoming call/i.test(e.innerText || '') && e.querySelector('button'));
      if (!hit) return null;
      return {text: hit.innerText.replace(/\n+/g, ' | ').slice(0, 160),
        buttons: [...hit.querySelectorAll('button')]
          .map(b => ({l:(b.getAttribute('aria-label')||b.textContent||'').trim().slice(0,24), t:b.getAttribute('data-testid')}))};
    });
    if (s) { out.push({at: ((Date.now()-t0)/1000).toFixed(1)+'s', ...s}); break; }
    await page.waitForTimeout(500);
  }
  return out.length ? out[0] : {none:true, waited:'timeout'};
};
