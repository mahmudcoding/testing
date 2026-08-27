const VS = `(el)=>{const r=el.getBoundingClientRect();if(r.width<1||r.height<1)return false;let n=el,op=1;while(n&&n!==document.documentElement){op*=parseFloat(getComputedStyle(n).opacity||'1');n=n.parentElement;}return op>0.05;}`;
export default async ({ page }) => {
  const out={}; const joins=[];
  page.on('response', r=>{ const u=r.url();
    if(/breakout-rooms\/[A-Z0-9]+\/join/i.test(u)) joins.push({s:r.status(), t:Date.now()%100000}); });
  const state = () => page.evaluate((vs)=>{const vis=eval(vs);
    return { tabs:[...document.querySelectorAll('button,[role="tab"]')].filter(vis)
        .map(b=>(b.innerText||'').replace(/\s+/g,' ').trim()).filter(t=>/Room H|Grid Pass/.test(t)),
      roomsOpen:(document.body.innerText.match(/(\d+) open in this call/)||[])[1]||null,
      leaveBtns:[...document.querySelectorAll('button')].filter(vis).map(b=>(b.getAttribute('aria-label')||b.innerText||'').trim().slice(0,20)).filter(t=>/leave|close/i.test(t)) };},VS);
  out.beforeReload = await state();
  out.joinsBeforeReload = joins.length;
  joins.length = 0;
  // reload while inside the live Side Room
  await page.reload({waitUntil:'domcontentloaded'});
  await page.waitForTimeout(13000);
  out.afterReload = await state();
  out.joinCallsDuringReload = joins.length;
  // navigate away in-app and come back
  await page.goto('https://airion-cargo.store/w/W4QAF1XTURESO01/call/V4OV5H0L83BBIBI',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(11000);
  out.afterRenavigate = await state();
  out.joinCallsTotal = joins.length;
  // how many rooms does the server think exist?
  out.serverRooms = await page.evaluate(async()=>{
    const r=await fetch('/api/v1/meeting/V4OV5H0L83BBIBI/breakout-rooms',{credentials:'include'});
    const j=await r.json().catch(()=>null);
    return (j?.rooms||[]).map(x=>({name:x.name,status:x.status,participants:(x.participants||[]).length}));});
  return out;
};
