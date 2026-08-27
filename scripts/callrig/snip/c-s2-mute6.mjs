export default async ({page}) => {
  const out={reqs:[]};
  const onReq=r=>{ if(r.url().includes('/api/v1/')&&r.method()!=='GET')
    out.reqs.push({m:r.method(), u:r.url().split('/api/v1')[1].slice(0,55), body:(r.postData()||'').slice(0,60)}); };
  page.on('request', onReq);
  const sel='button[aria-label="Mute notifications"],button[aria-label="Unmute notifications"]';
  const read=()=>page.evaluate((s)=>{const b=document.querySelector(s);
    return {label:b&&b.getAttribute('aria-label'), pressed:b&&b.getAttribute('aria-pressed'),
      ls:String(localStorage.getItem('aloqa.channel.mute')).slice(0,140)};}, sel);
  out.before=await read();
  await page.locator(sel).first().click();
  await page.waitForTimeout(800);
  const pt=await page.evaluate(()=>{
    const w=document.createTreeWalker(document.documentElement, NodeFilter.SHOW_ELEMENT);
    let n; while((n=w.nextNode())){ if(n.children.length) continue;
      if((n.textContent||'').trim()==='For 1 hour'){ const r=n.getBoundingClientRect();
        return {x:Math.round(r.x+r.width/2), y:Math.round(r.y+r.height/2)}; } }
    return null;
  });
  out.pt=pt;
  if (pt) { await page.mouse.click(pt.x, pt.y); await page.waitForTimeout(2000); }
  page.off('request', onReq);
  out.afterPick=await read();
  await page.reload(); await page.waitForTimeout(3500);
  out.afterReload=await read();
  return out;
};
