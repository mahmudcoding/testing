export default async ({page}) => {
  const WS='W4QEF1XTURESO01';
  const res={};
  const grab = () => page.evaluate(() => {
    const vis = e => { const r=e.getBoundingClientRect(); return r.width>0&&r.height>0; };
    const main=document.querySelector('main')||document.body;
    return {
      txt: main.innerText.replace(/\n{2,}/g,' | ').slice(0,900),
      btns: [...main.querySelectorAll('button,[role=tab]')].filter(vis).map(b=>(b.getAttribute('aria-label')||b.innerText||'').trim()).filter(Boolean).slice(0,35),
      inputs: [...main.querySelectorAll('input,select')].filter(vis).map(i=>i.placeholder||i.getAttribute('aria-label')||i.type).slice(0,12)
    };
  });
  for (const [k,path] of [['files','files'],['calendar','calendar']]) {
    await page.goto(`https://airion-cargo.store/w/${WS}/${path}`, {waitUntil:'domcontentloaded'});
    await page.waitForTimeout(3200);
    res[k]=await grab();
  }
  return res;
};
