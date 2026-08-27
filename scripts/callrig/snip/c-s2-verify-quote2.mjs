export default async ({page}) => {
  const ws='W4QCF1XTURESO01', ch='C4OX0TTLIMVOUBH';
  const REPLY='M4OX4YYZAUMRNI0';
  const out={};
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}?thread=M4OX4YYYQ0MHDC3`);
  await page.waitForTimeout(6000);
  // find the reply wherever it is; if the thread param was wrong, open the thread via the parent
  let found=await page.locator(`[data-message-id="${REPLY}"]`).count();
  if(!found){
    await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`);
    await page.waitForTimeout(9000);
    const parent=await page.evaluate(()=>{
      const e=[...document.querySelectorAll('main [data-message-id]')].reverse()
        .find(x=>/QA-V2-QT parent/.test(x.innerText||''));
      return e? e.getAttribute('data-message-id'):null;});
    out.parent=parent;
    if(parent){
      const p=page.locator(`main [data-message-id="${parent}"]`);
      await p.scrollIntoViewIfNeeded(); await p.hover(); await page.waitForTimeout(900);
      await p.locator('button[aria-label="Reply"]').first().click();
      await page.waitForTimeout(4500);
    }
    found=await page.locator(`[data-message-id="${REPLY}"]`).count();
  }
  out.replyPresent=found;
  if(!found) return out;
  const rEl=page.locator(`[data-message-id="${REPLY}"]`).last();
  await rEl.hover(); await page.waitForTimeout(1000);
  await rEl.locator('button[aria-label="Reply here"]').first().click();
  await page.waitForTimeout(2500);
  out.afterClick=await page.evaluate(()=>{
    const v=(e)=>{const r=e.getBoundingClientRect(); if(r.width<3||r.height<3) return false;
      let o=1,n=e; while(n&&n!==document.documentElement){const cs=getComputedStyle(n);
        o*=parseFloat(cs.opacity||'1'); if(cs.display==='none'||cs.visibility==='hidden') return false; n=n.parentElement;}
      return o>0.05;};
    const comps=[...document.querySelectorAll('div[contenteditable="true"][aria-label="Compose message"]')]
      .map((c,i)=>({i, x:Math.round(c.getBoundingClientRect().left), text:(c.innerText||'').replace(/\s+/g,' ').slice(0,90)}));
    // any visible node whose text mentions "sent" (the quote header) or the quoted body
    const quoted=[...document.querySelectorAll('*')].filter(e=>e.children.length===0&&v(e))
      .map(e=>(e.textContent||'').trim())
      .filter(t=>/sent|QA-V2-QMD|QA\\-V2\\-QMD/.test(t));
    return {composers:comps, quotedTexts:[...new Set(quoted)].slice(0,6)};});
  const j=JSON.stringify(out.afterClick);
  out.PASS = /\\\\-|\\\\\*/.test(j);
  return out;
};
