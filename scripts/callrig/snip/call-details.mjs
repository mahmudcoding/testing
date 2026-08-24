export default async ({page}) => {
  const netlog=[];
  page.on('response', async r=>{const u=r.url(); if(u.includes('/api/v1/')&&/record|meeting/.test(u)){let b='';try{b=(await r.text()).slice(0,260);}catch(e){} netlog.push(`${r.request().method()} ${r.status()} ${u.replace('https://airion-cargo.store','')} :: ${b}`);}});
  await page.goto('https://airion-cargo.store/w/W4QAF1XTURESO01/calls',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4000);
  // find the QA-MEDIA-1 row (the recorded one)
  const all = await page.$$('main button');
  const lab = await Promise.all(all.map(async b=>((await b.getAttribute('aria-label'))||(await b.innerText())||'').trim()));
  const i = lab.findIndex(t=>/QA-MEDIA-1/.test(t));
  if (i<0) return {err:'no QA-MEDIA-1 row', sample: lab.filter(Boolean).slice(0,20)};
  await all[i].click();
  await page.waitForTimeout(5000);
  const d = await page.evaluate(()=>{
    const dlg=[...document.querySelectorAll('[role="dialog"]')].pop();
    return dlg? {text:dlg.innerText.replace(/\n+/g,' | ').slice(0,700),
      btns:[...dlg.querySelectorAll('button')].map(b=>`${(b.getAttribute('aria-label')||b.textContent||'').trim().slice(0,28)}#${b.getAttribute('data-testid')||'-'}`),
      media:[...dlg.querySelectorAll('video,audio')].map(v=>({tag:v.tagName, src:(v.currentSrc||v.src||'').slice(0,90)}))}:'no dialog';
  });
  return {details:d, net: netlog.slice(-6)};
};
