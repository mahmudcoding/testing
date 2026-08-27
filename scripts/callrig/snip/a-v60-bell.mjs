const VS = `(el)=>{const r=el.getBoundingClientRect();if(r.width<1||r.height<1)return false;let n=el,op=1;while(n&&n!==document.documentElement){op*=parseFloat(getComputedStyle(n).opacity||'1');n=n.parentElement;}return op>0.05;}`;
export default async ({ page }) => {
  const out={};
  await page.goto('https://airion-cargo.store/w/W4QAF1XTURESO01/chat/mentions',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4200);
  const bell = page.locator('button[aria-label^="Notifications"]').first();
  out.bellLabel = await bell.getAttribute('aria-label');
  await bell.click(); await page.waitForTimeout(3000);
  await page.screenshot({path:'/private/tmp/claude-501/-Users-mahmud-Projects-testing/f92e5e8b-bcc2-441a-8a07-a9ff137b0db6/scratchpad/bell.png'});
  out.panel = await page.evaluate((vs)=>{const vis=eval(vs);
    const d=[...document.querySelectorAll('[role="dialog"],aside,[role="menu"]')].filter(vis).pop()||document.body;
    return { txt:(d.innerText||'').replace(/\s+/g,' ').slice(0,420),
      tabs:[...d.querySelectorAll('[role="tab"],button')].filter(vis).map(b=>(b.innerText||'').trim().replace(/\s+/g,' ').slice(0,22)).filter(Boolean).slice(0,12) };},VS);
  out.api = await page.evaluate(async()=>{
    const a=await fetch('/api/v1/notifications?limit=50',{credentials:'include'});
    const j=await a.json().catch(()=>null);
    const arr=j?.notifications||j?.data||(Array.isArray(j)?j:[]);
    return { status:a.status, n:(arr||[]).length, unread:(arr||[]).filter(x=>!x.read).length,
             kinds:[...new Set((arr||[]).map(x=>x.event_type||x.category||'?'))].slice(0,8) };});
  return out;
};
