const WS='W4QCF1XTURESO01', CH='C4OWKU9EANT1XSR';
const TARGET='M4OWLYAIKTDCO26';
export default async ({page, ctx}) => {
  await ctx.grantPermissions(['clipboard-read','clipboard-write'],{origin:'https://airion-cargo.store'}).catch(()=>{});
  await page.addInitScript(() => {
    window.__bn = {events: [], t0: performance.now()};
    const push = () => {
      const vis=(el)=>{const r=el.getBoundingClientRect(); if(r.width<1||r.height<1)return false;
        let n=el,o=1;while(n&&n!==document.documentElement){const s=getComputedStyle(n);o*=parseFloat(s.opacity||'1');
        if(s.display==='none'||s.visibility==='hidden')return false;n=n.parentElement;}return o>0.05;};
      const hits=[...document.querySelectorAll('[role="status"],[role="alert"]')].filter(vis)
        .map(e=>(e.textContent||'').trim()).filter(Boolean);
      const older=/older than loaded history/i.test(document.body.innerText||'');
      const key=JSON.stringify(hits)+'|'+older;
      const r=window.__bn; const last=r.events[r.events.length-1];
      if(!last||last.key!==key) r.events.push({key, ms:Math.round(performance.now()-r.t0), hits, older});
    };
    const start=()=>{ if(!document.body) return setTimeout(start,20);
      new MutationObserver(push).observe(document.body,{subtree:true,childList:true,characterData:true});
      setInterval(push,250); push(); };
    start();
  });
  await page.goto('about:blank'); await page.waitForTimeout(700);
  await page.goto(`https://airion-cargo.store/w/${WS}/c/${CH}?m=${TARGET}`,{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(13000);
  const out={};
  out.deepLinkPhase = await page.evaluate((want)=>{
    const r=window.__bn;
    const nums=[...document.querySelectorAll('[data-message-id]')].map(e=>{const m=(e.innerText||'').match(/QA-S2-PAGE-(\d+)/); return m?Number(m[1]):null;}).filter(Boolean);
    return {events:r.events.length, older:r.events.filter(e=>e.older).length,
      hits:[...new Set(r.events.flatMap(e=>e.hits))].slice(0,6),
      targetPresent:!!document.querySelector(`[data-message-id="${want}"]`),
      minNum:nums.length?Math.min(...nums):null, maxNum:nums.length?Math.max(...nums):null,
      n:document.querySelectorAll('[data-message-id]').length, vis:document.visibilityState};
  }, TARGET);
  // positive control: produce a known toast and confirm the recorder catches it
  const last = page.locator('[data-message-id]').last();
  await last.hover(); await page.waitForTimeout(800);
  await last.locator('button[aria-label="More actions"]').first().click({timeout:10000});
  await page.waitForTimeout(1200);
  await page.locator('[role="menu"] button, [data-radix-popper-content-wrapper] button').filter({hasText:/^Share$/}).last().click({timeout:8000});
  await page.waitForTimeout(2500);
  out.control = await page.evaluate(()=>{
    const r=window.__bn;
    return {events:r.events.length, hits:[...new Set(r.events.flatMap(e=>e.hits))].slice(0,6)};
  });
  return out;
};
