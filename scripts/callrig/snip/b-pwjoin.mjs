export default async ({page}) => {
  const WS='W4QBF1XTURESO01', CH='C4QBGENERAL0001';
  const out={};
  await page.goto(`https://airion-cargo.store/w/${WS}/c/${CH}`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4500);
  out.clicked = await page.evaluate(()=>{
    const m=document.querySelector('main')||document.body;
    const b=[...m.querySelectorAll('button')].find(x=>/^Join call$/i.test((x.getAttribute('aria-label')||x.innerText||'').trim()));
    if(b){ b.click(); return true; } return false;
  });
  await page.waitForTimeout(5000);
  out.gate = await page.evaluate(()=>{
    const vis = el => { const r=el.getBoundingClientRect(); return r.width>0&&r.height>0; };
    return {
      url: location.href,
      text: (document.querySelector('main')||document.body).innerText.replace(/\s+/g,' ').slice(0,400),
      inputs: [...document.querySelectorAll('input')].filter(vis).map(i=>({t:i.type, ph:i.placeholder, lab:i.getAttribute('aria-label')})).slice(0,8),
      buttons: [...document.querySelectorAll('button')].filter(vis).map(b=>(b.getAttribute('aria-label')||b.innerText||'').replace(/\s+/g,' ').trim()).filter(Boolean).slice(0,20)
    };
  });
  return out;
};
