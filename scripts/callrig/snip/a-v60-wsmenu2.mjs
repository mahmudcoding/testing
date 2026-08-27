const VS = `(el)=>{const r=el.getBoundingClientRect();if(r.width<1||r.height<1)return false;let n=el,op=1;while(n&&n!==document.documentElement){op*=parseFloat(getComputedStyle(n).opacity||'1');n=n.parentElement;}return op>0.05;}`;
export default async ({ page }) => {
  const out={};
  await page.locator('button',{hasText:/^QA Workspace$/}).first().click().catch(e=>out.e=String(e).slice(0,40));
  await page.waitForTimeout(2800);
  out.menu = await page.evaluate((vs)=>{const vis=eval(vs);
    return [...new Set([...document.querySelectorAll('[role="menuitem"],[role="menu"] *,[role="dialog"] *')].filter(vis)
      .map(e=>(e.innerText||'').replace(/\s+/g,' ').trim()).filter(t=>t&&t.length<48))].slice(0,16);},VS);
  await page.screenshot({path:'/private/tmp/claude-501/-Users-mahmud-Projects-testing/f92e5e8b-bcc2-441a-8a07-a9ff137b0db6/scratchpad/ws-menu2.png'});
  const picked = await page.evaluate((vs)=>{const vis=eval(vs);
    const e=[...document.querySelectorAll('*')].filter(x=>vis(x)&&/^QA Second/.test((x.innerText||'').replace(/\s+/g,' ').trim())&&x.children.length<=3)[0];
    if(!e) return null; const r=e.getBoundingClientRect();
    return {t:e.innerText.replace(/\s+/g,' ').trim().slice(0,30),x:Math.round(r.x+r.width/2),y:Math.round(r.y+r.height/2)};},VS);
  out.picked=picked;
  if(picked){ await page.mouse.click(picked.x,picked.y); await page.waitForTimeout(11000); }
  out.after = await page.evaluate((vs)=>{const vis=eval(vs);
    return { url:location.pathname, inSecondWs:/W4OV431T9GS61M5/.test(location.pathname),
      callChrome:[...document.body.querySelectorAll('*')].filter(e=>vis(e)&&e.children.length===0&&/WS Switch|active call|Return to call|Rejoin/i.test(e.innerText||'')).map(e=>e.innerText.replace(/\s+/g,' ').trim().slice(0,46)).slice(0,6),
      callBtns:[...document.querySelectorAll('button')].filter(vis).map(b=>(b.getAttribute('aria-label')||b.innerText||'').trim().slice(0,26)).filter(t=>/leave call|return to call|end for/i.test(t)) };},VS);
  out.serverCall = await page.evaluate(async()=>{
    const r=await fetch('/api/v1/meetings/current',{credentials:'include'});
    const txt=await r.text(); return {status:r.status, active:/"status":"active"/.test(txt), len:txt.length};});
  await page.screenshot({path:'/private/tmp/claude-501/-Users-mahmud-Projects-testing/f92e5e8b-bcc2-441a-8a07-a9ff137b0db6/scratchpad/ws-after2.png'});
  return out;
};
