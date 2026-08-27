const VS = `(el)=>{const r=el.getBoundingClientRect();if(r.width<1||r.height<1)return false;let n=el,op=1;while(n&&n!==document.documentElement){op*=parseFloat(getComputedStyle(n).opacity||'1');n=n.parentElement;}return op>0.05;}`;
export default async ({ page }) => {
  const out={}; const net=[];
  page.on('response', async r=>{ const u=r.url(); if(!/\/api\/v1\//.test(u)) return;
    let b=null; try{ b=await r.text(); }catch(e){}
    net.push({m:r.request().method(), u:u.split('/api/v1/')[1].slice(0,80), s:r.status(),
              hasBobId:/U4QABOB00000001/.test(b||''), hasBobName:/QA Bob/.test(b||''),
              bobCtx:/U4QABOB00000001/.test(b||'')?(b||'').slice(Math.max(0,(b||'').indexOf('U4QABOB00000001')-160),(b||'').indexOf('U4QABOB00000001')+160):null}); });
  await page.goto('https://airion-cargo.store/w/W4QAF1XTURESO01/calendar',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(5500);
  const chip = page.locator('[data-testid="calendar-event-chip"]', { hasText: 'Participant Check' }).first();
  await chip.scrollIntoViewIfNeeded(); await chip.click(); await page.waitForTimeout(4000);
  out.who = await page.evaluate(async()=>{const j=await (await fetch('/api/v1/auth/me',{credentials:'include'})).json().catch(()=>null); return j?.email??j?.data?.email;});
  out.totalRequests = net.length;
  out.requestsMentioningBob = net.filter(n=>n.hasBobId||n.hasBobName).map(n=>({u:n.u,s:n.s,ctx:n.bobCtx?.slice(0,240)}));
  out.allUrls = net.map(n=>`${n.m} ${n.u}->${n.s}`);
  out.dialog = await page.evaluate((vs)=>{const vis=eval(vs);
    const d=[...document.querySelectorAll('[role="dialog"]')].filter(vis)[0];
    return (d?.innerText||'').replace(/\s+/g,' ').slice(0,190);},VS);
  return out;
};
