const VS = `(el)=>{const r=el.getBoundingClientRect();if(r.width<1||r.height<1)return false;let n=el,op=1;while(n&&n!==document.documentElement){op*=parseFloat(getComputedStyle(n).opacity||'1');n=n.parentElement;}return op>0.05;}`;
export default async ({ page }) => {
  const out={};
  const m = page.locator('button[aria-label^="Minimize"]').first();
  out.minFound = await m.count()>0;
  if(out.minFound){ out.minLabel = await m.getAttribute('aria-label'); await m.click(); await page.waitForTimeout(4000); }
  out.afterMin = await page.evaluate(()=>({url:location.pathname, videos:document.querySelectorAll('video').length}));
  // now switch workspace
  await page.goto('https://airion-cargo.store/w/W4OV431T9GS61M5/chat/mentions',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(9000);
  await page.screenshot({path:'/private/tmp/claude-501/-Users-mahmud-Projects-testing/f92e5e8b-bcc2-441a-8a07-a9ff137b0db6/scratchpad/ws-switch2.png'});
  out.afterSwitch = await page.evaluate((vs)=>{const vis=eval(vs);
    return { url:location.pathname,
      inSecondWs:/W4OV431T9GS61M5/.test(location.pathname),
      callChrome:[...document.body.querySelectorAll('*')].filter(e=>vis(e)&&e.children.length===0&&/WS Switch|active call|Return to call|in call/i.test(e.innerText||'')).map(e=>e.innerText.replace(/\s+/g,' ').trim().slice(0,44)).slice(0,5),
      callBtns:[...document.querySelectorAll('button')].filter(vis).map(b=>(b.getAttribute('aria-label')||b.innerText||'').trim().slice(0,26)).filter(t=>/leave call|return to call|end for/i.test(t)),
      videos:document.querySelectorAll('video').length };},VS);
  // is the call still live on the server?
  out.serverStillLive = await page.evaluate(async()=>{
    const r=await fetch('/api/v1/meetings/current',{credentials:'include'});
    return {status:r.status, body:(await r.text()).slice(0,140)};});
  return out;
};
