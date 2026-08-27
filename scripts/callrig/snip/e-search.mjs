export default async ({page}) => {
  const WS='W4QEF1XTURESO01';
  await page.goto(`https://airion-cargo.store/w/${WS}/c/C4QEGENERAL0001`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(3500);
  const out={};
  out.searchBtn = await page.evaluate(()=>{
    const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0;};
    return [...document.querySelectorAll('button,input')].filter(vis).map(b=>(b.getAttribute('aria-label')||b.placeholder||'').trim()).filter(t=>/search/i.test(t)).slice(0,6);
  });
  // open global search
  await page.locator('button[aria-label^="Search "]').first().click().catch(async()=>{ await page.keyboard.press('Control+k'); });
  await page.waitForTimeout(2500);
  out.opened = await page.evaluate(()=>{
    const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0;};
    const d=document.querySelector('[role=dialog]');
    return d? {txt:d.innerText.replace(/\n{2,}/g,' | ').slice(0,600),
      inputs:[...d.querySelectorAll('input')].filter(vis).map(i=>i.placeholder||i.getAttribute('aria-label')),
      btns:[...d.querySelectorAll('button,[role=tab]')].filter(vis).map(b=>(b.getAttribute('aria-label')||b.innerText).trim()).filter(Boolean).slice(0,20)}
      : {none:true, main:document.body.innerText.slice(0,200)};
  });
  return out;
};
