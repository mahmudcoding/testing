export default async ({page}) => {
  const WS='W4QBF1XTURESO01';
  const out={};
  await page.goto(`https://airion-cargo.store/w/${WS}/chat/saved`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(2500);
  out.opened = await page.evaluate(()=>{ const b=[...document.querySelectorAll('a,button')].filter(x=>x.getBoundingClientRect().width>0).find(x=>/QA Bob/.test(x.innerText||'')); if(b){b.click(); return true;} return false; });
  await page.waitForTimeout(4500);
  out.dm = await page.evaluate(()=>{
    const vis = el => el.getBoundingClientRect().width>0 && el.getBoundingClientRect().height>0;
    const m=document.querySelector('main')||document.body;
    return { url:location.href,
      callButtons:[...m.querySelectorAll('button')].filter(vis).map(b=>(b.getAttribute('aria-label')||b.innerText||'').replace(/\s+/g,' ').trim()).filter(x=>/call/i.test(x)),
      composer: !!document.querySelector('div[contenteditable="true"]') };
  });
  return out;
};
