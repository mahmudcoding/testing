export default async ({page}) => {
  const WS='W4QDF1XTURESO01';
  await page.goto(`https://airion-cargo.store/w/${WS}/settings/workspace`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4000);
  return await page.evaluate(() => {
    const main=document.querySelector('main')||document.body;
    const txt=(main.innerText||'').replace(/\s+/g,' ').trim();
    const inputs=[]; main.querySelectorAll('input,textarea').forEach(b=>{const r=b.getBoundingClientRect(); if(r.width>0&&r.height>0) inputs.push({lab:(b.getAttribute('aria-label')||b.getAttribute('name')||b.getAttribute('placeholder')||'?').slice(0,30), val:(b.value||'').slice(0,40), dis:b.disabled, ro:b.readOnly});});
    const btns=[]; main.querySelectorAll('button').forEach(b=>{const r=b.getBoundingClientRect(); if(r.width>0&&r.height>0) btns.push({l:((b.innerText||'').trim()||b.getAttribute('aria-label')||'?').slice(0,30), dis:b.disabled});});
    return {txt:txt.slice(200,1100), inputs, btns:btns.slice(0,25)};
  });
};
