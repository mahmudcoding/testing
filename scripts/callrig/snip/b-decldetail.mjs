export default async ({page}) => {
  const WS='W4QBF1XTURESO01';
  const out={};
  await page.goto(`https://airion-cargo.store/w/${WS}/calls`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4500);
  // open the Declined row
  out.opened = await page.evaluate(()=>{
    const cands=[...document.querySelectorAll('a,button,[role=button]')].filter(e=>e.getBoundingClientRect().width>0 && /Declined/.test(e.innerText||'') && (e.innerText||'').length<160);
    if(!cands.length) return 'no-row';
    cands[cands.length-1].click(); return 'clicked';
  });
  await page.waitForTimeout(5000);
  out.page = await page.evaluate(()=>{
    const vis = el => el.getBoundingClientRect().width>0;
    return { url:location.href,
      text: document.body.innerText.replace(/\n{2,}/g,'\n').slice(0,600),
      tabs: [...document.querySelectorAll('[role=tab]')].filter(vis).map(t=>t.innerText.replace(/\s+/g,' ').trim()),
      buttons: [...document.querySelectorAll('button')].filter(vis).map(b=>(b.getAttribute('aria-label')||b.innerText||'').replace(/\s+/g,' ').trim()).filter(Boolean).slice(-10) };
  });
  return out;
};
