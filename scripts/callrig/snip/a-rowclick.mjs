export default async ({page}) => {
  const net=[];
  page.on('response', async r=>{const u=r.url(); if(/\/api\/v1\//.test(u) && r.status()>=400){let b='';try{b=(await r.text()).slice(0,160);}catch(e){} net.push(`${r.request().method()} ${r.status()} ${u.replace('https://airion-cargo.store','')} :: ${b}`);}});
  await page.goto('https://airion-cargo.store/w/W4QAF1XTURESO01/calls', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4000);
  const t = await page.$('[role="tab"]:has-text("1-to-1")');
  if (t) { await t.click(); await page.waitForTimeout(1500); }
  const snap = () => {
    const m = document.querySelector('main')||document.body;
    return {url: location.href, text: m.innerText.replace(/\n+/g,' | ').slice(0,420),
      btns: [...m.querySelectorAll('button,a')].map(b=>((b.getAttribute('aria-label')||b.textContent||'').trim()).slice(0,32)).filter(Boolean).slice(0,16)};
  };
  const out = {before: await snap ? await page.evaluate(snap) : null};
  // click the "No answer" row
  const row = page.locator('main li,[role="listitem"]').filter({hasText:'No answer'}).first();
  out.rowFound = await row.count();
  if (out.rowFound) { await row.click(); await page.waitForTimeout(4500); }
  out.after = await page.evaluate(snap);
  out.net = net;
  return out;
};
