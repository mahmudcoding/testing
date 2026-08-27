export default async ({page}) => {
  // no reload — click Join in the Live now block
  await page.waitForTimeout(3000);
  const before = await page.evaluate(()=>{const m=document.querySelector('main')||document.body; const t=(m.innerText||''); const i=t.indexOf('Live now'); return i<0?null:t.slice(i,i+150).replace(/\n+/g,' | ');});
  const clicked = await page.evaluate(()=>{
    const b=[...document.querySelectorAll('button')].filter(x=>x.getClientRects().length).find(x=>/^Join$/i.test((x.textContent||'').trim()));
    if(!b) return false; b.click(); return true;});
  await page.waitForTimeout(9000);
  const j = await page.evaluate(()=>{const b=[...document.querySelectorAll('button')].filter(x=>x.getClientRects().length).find(x=>/^Join$/i.test((x.textContent||'').trim())); if(b){b.click(); return true;} return false;});
  await page.waitForTimeout(9000);
  return {before, clicked, secondJoin:j, state: await page.evaluate(async ()=>{
    let cur=null; try{cur=await (await fetch('/api/v1/meetings/current',{credentials:'include'})).json();}catch(e){}
    const hdr=(document.body.innerText||'').replace(/\n+/g,' | ');
    return {inCall:!!(cur&&cur.meeting), url:location.pathname, head: hdr.slice(0,120)};
  })};
};
