export default async ({page}) => {
  const emoji = process.env.QA_EMOJI || '👏';
  // install a recorder that runs independently of the click
  await page.evaluate(() => {
    window.__rx = [];
    if (window.__rxTimer) clearInterval(window.__rxTimer);
    const snap = () => [...document.querySelectorAll('[data-testid*="reaction"]')]
      .map(e=>({sel:e.getAttribute('data-testid'), txt:(e.innerText||'').replace(/\n+/g,'/').slice(0,40)}));
    window.__rxLast = JSON.stringify(snap());
    window.__rxT0 = Date.now();
    window.__rxTimer = setInterval(() => {
      const cur = snap(), s = JSON.stringify(cur);
      if (s !== window.__rxLast) { window.__rx.push({at: Date.now()-window.__rxT0, items: cur}); window.__rxLast = s; }
    }, 200);
  });
  const trig = page.locator('[data-testid="call-controls-live-reaction"]');
  if (await trig.getAttribute('aria-expanded') !== 'true') { await trig.click(); await page.waitForTimeout(1200); }
  const btns = await page.$$('[role="dialog"] button');
  let clicked=null;
  for (const b of btns) { const t=(await b.innerText()).trim(); if (t===emoji) { await b.click(); clicked=t; break; } }
  await page.waitForTimeout(12000);
  const res = await page.evaluate(() => { clearInterval(window.__rxTimer); return window.__rx; });
  // also: is the picker still open after sending?
  const stillOpen = await trig.getAttribute('aria-expanded');
  return {clicked, selfChanges: res, pickerExpandedAfter: stillOpen};
};
