// On a device that shows the channel as unmuted: mute, then unmute — the only path
// the UI offers to clear a mute it cannot see.
export default async ({page}) => {
  const out={reqs:[]};
  const onReq=r=>{ if(r.url().includes('/api/v1/')&&r.method()!=='GET')
    out.reqs.push(r.method()+' '+r.url().split('/api/v1')[1].slice(0,50)+' '+(r.postData()||'').slice(0,30)); };
  page.on('request', onReq);
  const sel='button[aria-label="Mute notifications"],button[aria-label="Unmute notifications"]';
  const read=()=>page.evaluate((s)=>{const b=document.querySelector(s);
    return {label:b&&b.getAttribute('aria-label'), pressed:b&&b.getAttribute('aria-pressed')};}, sel);
  out.start=await read();
  await page.locator(sel).first().click(); await page.waitForTimeout(800);
  const pt=await page.evaluate(()=>{ const w=document.createTreeWalker(document.documentElement,NodeFilter.SHOW_ELEMENT);
    let n; while((n=w.nextNode())){ if(n.children.length) continue;
      if((n.textContent||'').trim()==='For 1 hour'){const r=n.getBoundingClientRect();
        return {x:Math.round(r.x+r.width/2),y:Math.round(r.y+r.height/2)};} } return null;});
  if(pt){ await page.mouse.click(pt.x,pt.y); await page.waitForTimeout(1600); }
  out.afterMute=await read();
  // now the button offers Unmute
  await page.locator(sel).first().click(); await page.waitForTimeout(900);
  const pt2=await page.evaluate(()=>{ const w=document.createTreeWalker(document.documentElement,NodeFilter.SHOW_ELEMENT);
    let n; while((n=w.nextNode())){ if(n.children.length) continue;
      const t=(n.textContent||'').trim(); if(t==='Unmute'){const r=n.getBoundingClientRect();
        return {x:Math.round(r.x+r.width/2),y:Math.round(r.y+r.height/2)};} } return null;});
  out.unmuteItem=pt2;
  if(pt2){ await page.mouse.click(pt2.x,pt2.y); await page.waitForTimeout(1600); }
  else { await page.keyboard.press('Escape'); }
  out.afterUnmute=await read();
  page.off('request', onReq);
  return out;
};
