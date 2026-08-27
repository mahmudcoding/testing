export default async ({page}) => {
  const WS='W4QCF1XTURESO01'; const TITLE=process.env.QA_TITLE||'QA-C-SCHED-1';
  await page.goto(`https://airion-cargo.store/w/${WS}/calls`,{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(5000);
  const a = await page.evaluate((title)=>{
    const m=document.querySelector('main')||document.body; const txt=(m.innerText||'');
    const i=txt.indexOf(title);
    const card=[...m.querySelectorAll('*')].find(e=>e.children.length && (e.innerText||'').includes(title) && (e.innerText||'').length<400);
    return {seg: i<0?null:txt.slice(i,i+170).replace(/\n+/g,' | '),
      btns: card? [...card.querySelectorAll('button')].filter(b=>b.getClientRects().length).map(b=>(b.getAttribute('aria-label')||b.textContent||'').replace(/\s+/g,' ').trim()).slice(0,6):[],
      utc:new Date().toISOString().slice(11,19)};
  }, TITLE);
  await page.waitForTimeout(20000);
  const b = await page.evaluate((title)=>{
    const m=document.querySelector('main')||document.body; const txt=(m.innerText||'');
    const i=txt.indexOf(title);
    return {seg: i<0?null:txt.slice(i,i+170).replace(/\n+/g,' | '), utc:new Date().toISOString().slice(11,19)};
  }, TITLE);
  return {afterReload:a, plus20s:b};
};
