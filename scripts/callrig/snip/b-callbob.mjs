export default async ({page}) => {
  const WS='W4QBF1XTURESO01';
  const out={};
  await page.goto(`https://airion-cargo.store/w/${WS}/directories?tab=people`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4000);
  out.clicked = await page.evaluate(()=>{
    // find the row/card that mentions QA Bob and click its Call button
    const cands=[...document.querySelectorAll('*')].filter(el=>{
      if (el.children.length===0) return false;
      const t=(el.innerText||'');
      return t.includes('QA Bob') && t.length<200 && [...el.querySelectorAll('button')].some(b=>(b.innerText||'').trim()==='Call');
    });
    const row = cands[cands.length-1];
    if(!row) return 'no-row';
    const b=[...row.querySelectorAll('button')].find(x=>(x.innerText||'').trim()==='Call');
    if(!b) return 'no-btn';
    b.click(); return 'clicked';
  });
  await page.waitForTimeout(5000);
  out.after = await page.evaluate(()=>({
    url: location.href,
    txt: document.body.innerText.replace(/\s+/g,' ').slice(0,400),
    dialogs: [...document.querySelectorAll('[role=dialog]')].filter(d=>d.getBoundingClientRect().width>0).map(d=>d.innerText.replace(/\s+/g,' ').slice(0,250))
  }));
  return out;
};
