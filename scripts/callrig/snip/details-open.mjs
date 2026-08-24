export default async ({page}) => {
  const name = process.env.QA_CALLNAME;
  const net=[];
  page.on('response', async r=>{const u=r.url(); if(/record|\.mp4|meeting/i.test(u)){net.push(`${r.request().method()} ${r.status()} ${u.replace('https://airion-cargo.store','').slice(0,110)}`);}});
  const close = page.locator('[data-testid="call-ended-close"]');
  if (await close.count()) { await close.click(); await page.waitForTimeout(2500); }
  await page.goto('https://airion-cargo.store/w/W4QAF1XTURESO01/calls',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4000);
  const all = await page.$$('main button');
  const lab = await Promise.all(all.map(async b=>((await b.getAttribute('aria-label'))||(await b.innerText())||'').trim()));
  const i = lab.findIndex(t=>t.includes(name));
  if (i<0) return {err:'row not found', sample: lab.filter(Boolean).slice(0,15)};
  await all[i].click();
  await page.waitForTimeout(5000);
  const d = await page.evaluate(()=>{
    const dlg=[...document.querySelectorAll('[role="dialog"]')].pop();
    return dlg? {text:dlg.innerText.replace(/\n+/g,' | ').slice(0,800),
      btns:[...dlg.querySelectorAll('button')].map(b=>`${(b.getAttribute('aria-label')||b.textContent||'').trim().slice(0,34)}#${b.getAttribute('data-testid')||'-'}`),
      media:[...dlg.querySelectorAll('video,audio')].map(v=>({tag:v.tagName, src:(v.currentSrc||v.src||'').slice(0,90)}))}:'no dialog';
  });
  return {details:d, net: [...new Set(net)].slice(-8)};
};
