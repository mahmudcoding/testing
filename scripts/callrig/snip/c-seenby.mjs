export default async ({page}) => {
  const id=process.env.MID;
  const V=`(e => {const r=e.getBoundingClientRect(); if(!(r.width>0&&r.height>0))return false; let n=e,o=1; while(n){const cs=getComputedStyle(n); o*=parseFloat(cs.opacity||'1'); if(cs.display==='none'||cs.visibility==='hidden')return false; n=n.parentElement;} return o>0.05;})`;
  await page.keyboard.press('Escape'); await page.waitForTimeout(800);
  const m = page.locator(`[data-message-id="${id}"]`);
  await m.scrollIntoViewIfNeeded(); await m.hover(); await page.waitForTimeout(700);
  await m.locator('button[aria-label="More actions"]').first().click();
  await page.waitForTimeout(1300);
  const attrs = await page.evaluate(v=>{const vv=eval(v);
    const b=[...document.querySelectorAll('button')].filter(vv).find(x=>/^Seen by/.test((x.innerText||'').trim()));
    if(!b) return {notFound:true};
    const r=b.getBoundingClientRect(); const cs=getComputedStyle(b);
    return {text:(b.innerText||'').trim(), disabled:b.disabled, ariaDisabled:b.getAttribute('aria-disabled'),
      role:b.getAttribute('role'), type:b.type, cursor:cs.cursor, pointerEvents:cs.pointerEvents,
      rect:Math.round(r.left)+','+Math.round(r.top)+' '+Math.round(r.width)+'x'+Math.round(r.height),
      topElAtCentre:(()=>{const e=document.elementFromPoint(r.left+r.width/2, r.top+r.height/2); return e?e.tagName+'.'+String(e.className).slice(0,25):'none';})()};}, V);
  // count visible nodes before/after, then click and poll
  const before = await page.evaluate(v=>{const vv=eval(v);
    return {nodes:[...document.querySelectorAll('[role=dialog],[role=menu],[role=tooltip],[data-radix-popper-content-wrapper]')].filter(vv).length,
      bodyLen:document.body.innerText.length};}, V);
  const b = page.locator('button').filter({hasText:/^Seen by/}).last();
  await b.click();
  const series=[];
  for(let i=0;i<12;i++){ await page.waitForTimeout(300);
    series.push(await page.evaluate(v=>{const vv=eval(v);
      const cont=[...document.querySelectorAll('[role=dialog],[role=menu],[role=tooltip],[data-radix-popper-content-wrapper]')].filter(vv);
      return {n:cont.length, texts:cont.map(c=>c.innerText.replace(/\s+/g,' ').slice(0,90)),
        hasName:/QA Bob|QA Carol|QA Owner|QA Admin|QA Guest/.test(document.body.innerText)};}, V)); }
  const uniq=[]; for(const s of series){const k=JSON.stringify(s); if(!uniq.length||JSON.stringify(uniq[uniq.length-1])!==k) uniq.push(s);}
  return {buttonAttrs: attrs, before, afterClick: uniq};
};
