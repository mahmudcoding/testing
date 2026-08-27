const VS = `(el)=>{const r=el.getBoundingClientRect();if(r.width<1||r.height<1)return false;let n=el,op=1;while(n&&n!==document.documentElement){op*=parseFloat(getComputedStyle(n).opacity||'1');n=n.parentElement;}return op>0.05;}`;
export default async ({ page }) => {
  const out={};
  // --- ALK-2690: the live-calls summary should collapse all three frames, not one
  await page.goto('https://airion-cargo.store/w/W4QAF1XTURESO01/calls',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(5000);
  out.hub = await page.evaluate((vs)=>{const vis=eval(vs);
    const m=document.querySelector('[data-testid="app-shell-main-column"]')||document.body;
    const t=(m.innerText||'').replace(/\s+/g,' ');
    return { liveNow:(t.match(/Live now[^]{0,70}/)||[''])[0],
      scheduled:(t.match(/Scheduled today[^]{0,60}/)||[''])[0],
      recent:(t.match(/Recent calls[^]{0,60}/)||[''])[0],
      tabs:[...m.querySelectorAll('[role="tab"],button')].filter(vis).map(b=>(b.innerText||'').replace(/\s+/g,' ').trim()).filter(x=>/^(All|Group meetings|1-to-1)/.test(x)) };},VS);
  // --- ALK-2963 / ALK-2965: a workspace inviter can actually invite
  await page.goto('https://airion-cargo.store/w/W4QAF1XTURESO01/settings/admin/invites',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(5000);
  out.directInvites = await page.evaluate((vs)=>{const vis=eval(vs);
    const m=document.querySelector('[data-testid="app-shell-main-column"]')||document.body;
    const t=(m.innerText||'').replace(/\s+/g,' ');
    return { block:(t.match(/Direct invites[^]{0,140}/)||[''])[0],
      btns:[...m.querySelectorAll('button')].filter(vis).map(b=>(b.innerText||'').trim().slice(0,26)).filter(Boolean).slice(0,8) };},VS);
  const dv = page.locator('button',{hasText:/^Create direct invites$|^Send direct invites$/}).first();
  if(await dv.count()){ await dv.click(); await page.waitForTimeout(2600);
    out.directDialog = await page.evaluate((vs)=>{const vis=eval(vs);
      const d=[...document.querySelectorAll('[role="dialog"]')].filter(vis).pop()||document.body;
      return { txt:(d.innerText||'').replace(/\s+/g,' ').slice(0,240),
        inputs:[...d.querySelectorAll('input')].filter(vis).map(i=>(i.placeholder||'').slice(0,26)),
        btns:[...d.querySelectorAll('button')].filter(vis).map(b=>(b.innerText||'').trim().slice(0,22)).filter(Boolean).slice(0,10) };},VS);
    await page.keyboard.press('Escape').catch(()=>{}); }
  return out;
};
