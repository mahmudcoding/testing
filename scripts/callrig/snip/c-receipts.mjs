export default async ({page}) => {
  const id=process.env.MID;
  const V=`(e => {const r=e.getBoundingClientRect(); if(!(r.width>0&&r.height>0))return false; let n=e,o=1; while(n){const cs=getComputedStyle(n); o*=parseFloat(cs.opacity||'1'); if(cs.display==='none'||cs.visibility==='hidden')return false; n=n.parentElement;} return o>0.05;})`;
  const m = page.locator(`[data-message-id="${id}"]`);
  await m.scrollIntoViewIfNeeded(); await m.hover(); await page.waitForTimeout(700);
  await m.locator('button[aria-label="More actions"]').first().click();
  await page.waitForTimeout(1300);
  const menu = await page.evaluate(v=>{const vv=eval(v);
    const c=[...document.querySelectorAll('[role=menu],[role=dialog],[data-radix-popper-content-wrapper]')].filter(vv)
      .sort((a,b)=>b.innerText.length-a.innerText.length)[0];
    return c?[...c.querySelectorAll('button')].filter(vv).map(b=>(b.innerText||'').replace(/\s+/g,' ').trim().slice(0,22)):[];}, V);
  const seen = page.locator('button').filter({hasText:/^Seen by/}).last();
  let detail=null;
  if(await seen.count()){ await seen.click(); await page.waitForTimeout(2000);
    detail = await page.evaluate(v=>{const vv=eval(v);
      const d=[...document.querySelectorAll('[role=dialog],[role=menu],[data-radix-popper-content-wrapper]')].filter(vv)
        .sort((a,b)=>b.innerText.length-a.innerText.length)[0];
      return d?d.innerText.replace(/\s+/g,' ').slice(0,220):'no panel';}, V); }
  return {menu, seenPanel: detail};
};
