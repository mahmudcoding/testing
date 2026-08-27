export default async ({page}) => {
  const id=process.env.MID;
  const V=`(e => {const r=e.getBoundingClientRect(); if(!(r.width>0&&r.height>0))return false; let n=e,o=1; while(n){const cs=getComputedStyle(n); o*=parseFloat(cs.opacity||'1'); if(cs.display==='none'||cs.visibility==='hidden')return false; n=n.parentElement;} return o>0.05;})`;
  await page.keyboard.press('Escape'); await page.waitForTimeout(900);
  const m = page.locator(`[data-message-id="${id}"]`);
  await m.scrollIntoViewIfNeeded(); await m.hover(); await page.waitForTimeout(700);
  await m.locator('button[aria-label="More actions"]').first().click();
  await page.waitForTimeout(1300);
  const b = page.locator('button').filter({hasText:/^Seen by/}).last();
  await b.hover();
  const series=[];
  for(let i=0;i<14;i++){ await page.waitForTimeout(350);
    series.push(await page.evaluate(v=>{const vv=eval(v);
      const cont=[...document.querySelectorAll('[role=dialog],[role=menu],[role=tooltip],[data-radix-popper-content-wrapper],[data-state=open]')].filter(vv);
      return {n:cont.length, texts:[...new Set(cont.map(c=>c.innerText.replace(/\s+/g,' ').slice(0,80)))]};}, V)); }
  const uniq=[]; for(const s of series){const k=JSON.stringify(s); if(!uniq.length||JSON.stringify(uniq[uniq.length-1])!==k) uniq.push(s);}
  // does the API expose readers?
  const api = await page.evaluate(async mid=>{
    const out={};
    for(const u of [`/api/v1/messaging/messages/${mid}/reads`,`/api/v1/messaging/messages/${mid}/seen`,`/api/v1/messaging/messages/${mid}/receipts`]){
      const r=await fetch(u,{credentials:'include'}); out[u.split('/').pop()]={s:r.status, b:(await r.text()).slice(0,140)};
    }
    return out;
  }, id);
  return {hoverStates: uniq, receiptEndpoints: api};
};
