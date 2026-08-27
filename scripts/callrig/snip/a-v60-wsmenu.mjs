const VS = `(el)=>{const r=el.getBoundingClientRect();if(r.width<1||r.height<1)return false;let n=el,op=1;while(n&&n!==document.documentElement){op*=parseFloat(getComputedStyle(n).opacity||'1');n=n.parentElement;}return op>0.05;}`;
export default async ({ page }) => {
  const out={};
  out.startUrl = await page.evaluate(()=>location.pathname);
  const w = page.locator('button[aria-label="Open workspace menu"]').first();
  out.menuBtn = await w.count()>0;
  if(!out.menuBtn){
    out.candidates = await page.evaluate((vs)=>{const vis=eval(vs);
      return [...document.querySelectorAll('button')].filter(vis).map(b=>(b.getAttribute('aria-label')||b.innerText||'').trim().slice(0,30)).filter(t=>/workspace/i.test(t)).slice(0,6);},VS);
    return out;
  }
  await w.click(); await page.waitForTimeout(2500);
  out.menu = await page.evaluate((vs)=>{const vis=eval(vs);
    return [...new Set([...document.querySelectorAll('[role="menuitem"],[role="menu"] *,[role="dialog"] *')].filter(vis)
      .map(e=>(e.innerText||'').replace(/\s+/g,' ').trim()).filter(t=>t&&t.length<50))].slice(0,14);},VS);
  await page.screenshot({path:'/private/tmp/claude-501/-Users-mahmud-Projects-testing/f92e5e8b-bcc2-441a-8a07-a9ff137b0db6/scratchpad/ws-menu.png'});
  // click "QA Second"
  const picked = await page.evaluate((vs)=>{const vis=eval(vs);
    const e=[...document.querySelectorAll('*')].filter(x=>vis(x)&&/^QA Second/.test((x.innerText||'').trim())&&x.children.length<=3)[0];
    if(!e) return null; const r=e.getBoundingClientRect();
    return {t:e.innerText.trim().slice(0,26),x:Math.round(r.x+r.width/2),y:Math.round(r.y+r.height/2)};},VS);
  out.picked=picked;
  if(picked){ await page.mouse.click(picked.x,picked.y); await page.waitForTimeout(10000); }
  out.afterSwitch = await page.evaluate((vs)=>{const vis=eval(vs);
    return { url:location.pathname, inSecondWs:/W4OV431T9GS61M5/.test(location.pathname),
      callChrome:[...document.body.querySelectorAll('*')].filter(e=>vis(e)&&e.children.length===0&&/WS Switch|active call|Return to call/i.test(e.innerText||'')).map(e=>e.innerText.replace(/\s+/g,' ').trim().slice(0,46)).slice(0,5),
      callBtns:[...document.querySelectorAll('button')].filter(vis).map(b=>(b.getAttribute('aria-label')||b.innerText||'').trim().slice(0,26)).filter(t=>/leave call|return to call|end for/i.test(t)) };},VS);
  await page.screenshot({path:'/private/tmp/claude-501/-Users-mahmud-Projects-testing/f92e5e8b-bcc2-441a-8a07-a9ff137b0db6/scratchpad/ws-after.png'});
  return out;
};
