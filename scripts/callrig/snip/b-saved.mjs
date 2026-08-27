export default async ({page}) => {
  const mid=process.env.QA_MID;
  await page.goto('https://airion-cargo.store/w/W4QBF1XTURESO01/c/C4QBGENERAL0001',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(5000);
  const art = await page.$(`[data-message-id="${mid}"]`);
  if(!art) return {err:'msg not found'};
  await art.hover(); await page.waitForTimeout(1800);
  const saved = await page.evaluate((mid)=>{
    const a=document.querySelector(`[data-message-id="${mid}"]`);
    const b=[...a.querySelectorAll('button')].find(x=>/^save$/i.test((x.getAttribute('aria-label')||'').trim()));
    if(!b) return null; b.click(); return b.getAttribute('aria-label');
  }, mid);
  await page.waitForTimeout(3000);
  await page.goto('https://airion-cargo.store/w/W4QBF1XTURESO01/chat/saved',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(6000);
  const view = await page.evaluate(()=>{
    const main=(document.querySelector('main')?.innerText||document.body.innerText||'').replace(/\s+/g,' ').slice(0,300);
    const leaves=[...document.querySelectorAll('span,p')].filter(e=>{
      const r=e.getBoundingClientRect(); if(r.width<20||r.height<8) return false;
      const t=(e.innerText||''); return /bold|QA-B|QA\\-B/.test(t) && t.length<120 && e.children.length<=2;
    }).map(e=>({tag:e.tagName, text:(e.innerText||'').replace(/\s+/g,' ').slice(0,110), hasBackslash:/\\/.test(e.innerText||'')}));
    return {main, leaves:leaves.slice(-3)};
  });
  return {savedClicked:saved, view};
};
