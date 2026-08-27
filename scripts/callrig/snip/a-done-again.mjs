export default async ({page}) => {
  const net=[];
  page.on('response', async r=>{const u=r.url(); const m=r.request().method(); if(/\/api\/v1\/(meeting|meetings)/.test(u) && m!=='GET'){let b='';try{b=(await r.text()).slice(0,180);}catch(e){} net.push(`${m} ${r.status()} ${u.replace('https://airion-cargo.store','')} :: req=${(r.request().postData()||'').slice(0,90)} :: ${b}`);}});
  const snap = () => {
    const s = document.querySelector('[data-testid="ended-rate-section"]');
    return {url: location.href,
      summary: !!document.querySelector('[data-testid="call-ended-summary"]'),
      rate: s ? {text:s.innerText.replace(/\n+/g,' | ').slice(0,140), filled:[...s.querySelectorAll('button')].map(x=>(x.querySelector('svg')?.getAttribute('fill')||'?')).join(',')} : null,
      btns: [...document.querySelectorAll('button')].map(b=>((b.getAttribute('aria-label')||b.textContent||'').trim()+'#'+(b.getAttribute('data-testid')||'-')).slice(0,50)).filter(x=>!/^#/.test(x)).slice(0,26),
      body: document.body.innerText.replace(/\n+/g,' | ').slice(-260)};
  };
  const out = {};
  const e = page.locator('[data-testid="call-controls-end-for-everyone"]');
  if (await e.count()) { await e.click(); await page.waitForTimeout(1200);
    const cf = page.locator('[data-testid="call-end-confirm-submit"]'); if (await cf.count()) await cf.click(); }
  await page.waitForTimeout(8000);
  out.ended = await page.evaluate(snap);
  // click Done WITHOUT rating
  const done = page.locator('button:has-text("Done")').last();
  out.doneFound = await done.count();
  if (out.doneFound) { await done.click(); await page.waitForTimeout(3000); }
  out.afterDone = await page.evaluate(snap);
  out.net = net;
  return out;
};
