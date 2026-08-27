export default async ({page}) => {
  const WS='W4QBF1XTURESO01', CH='C4QBGENERAL0001';
  const out={};
  await page.goto(`https://airion-cargo.store/w/${WS}/c/${CH}`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4000);
  out.headerButtons = await page.evaluate(()=>{
    const vis = el => { const r=el.getBoundingClientRect(); return r.width>0&&r.height>0; };
    const m=document.querySelector('main')||document.body;
    return [...m.querySelectorAll('button')].filter(vis).map(b=>(b.getAttribute('aria-label')||b.innerText||'').replace(/\s+/g,' ').trim()).filter(Boolean).slice(0,25);
  });
  out.clicked = await page.evaluate(()=>{
    const m=document.querySelector('main')||document.body;
    const b=[...m.querySelectorAll('button')].find(x=>/^(Start call|Call|Start a call|Huddle)$/i.test((x.getAttribute('aria-label')||x.innerText||'').trim()));
    if(b){ b.click(); return (b.getAttribute('aria-label')||b.innerText||'').trim(); } return null;
  });
  await page.waitForTimeout(3000);
  out.dialog = await page.evaluate(()=>{
    const d=[...document.querySelectorAll('[role=dialog]')].filter(x=>x.getBoundingClientRect().width>0).pop();
    if(!d) return null;
    return {t:d.innerText.replace(/\s+/g,' ').slice(0,500), b:[...d.querySelectorAll('button')].map(y=>(y.innerText||'').trim()).filter(Boolean).slice(0,12)};
  });
  out.url = page.url();
  return out;
};
