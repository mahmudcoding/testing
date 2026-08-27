export default async ({page}) => {
  await page.goto('https://airion-cargo.store/w/W4QBF1XTURESO01/chat/mentions',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(6500);
  const rows = await page.evaluate(()=>{
    const spans=[...document.querySelectorAll('span,p,div')].filter(e=>{
      const r=e.getBoundingClientRect(); if(r.width<20||r.height<8) return false;
      const t=(e.innerText||'');
      return /(second|mention)/i.test(t) && t.length<120 && e.children.length<=2;
    });
    const seen=new Set(); const out=[];
    for(const e of spans){ const t=(e.innerText||'').replace(/\s+/g,' ').trim();
      if(!seen.has(t)){ seen.add(t); out.push({tag:e.tagName, text:t.slice(0,110), hasBackslash:/\\/.test(t)}); } }
    return out.slice(-4);
  });
  const summary = await page.evaluate(()=>(document.querySelector('main')?.innerText||'').replace(/\s+/g,' ').slice(0,220));
  return {rows, summary};
};
