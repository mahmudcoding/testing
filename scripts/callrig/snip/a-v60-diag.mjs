const VS = `(el)=>{const r=el.getBoundingClientRect();if(r.width<1||r.height<1)return false;let n=el,op=1;while(n&&n!==document.documentElement){op*=parseFloat(getComputedStyle(n).opacity||'1');n=n.parentElement;}return op>0.05;}`;
export default async ({ page }) => {
  const out={};
  await page.goto('https://airion-cargo.store/w/W4QAF1XTURESO01/settings/calls',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4500);
  const on = await page.evaluate((vs)=>{const vis=eval(vs);const m=document.querySelector('[data-testid="app-shell-main-column"]')||document.body;
    const s=[...m.querySelectorAll('[role="switch"]')].filter(vis).find(x=>/diagnostic|nerd/i.test(x.closest('div')?.parentElement?.innerText||''));
    if(!s) return null; const was=s.getAttribute('aria-checked'); if(was==='false') s.click(); return was;},VS);
  out.diagWas=on;
  await page.waitForTimeout(3000);
  out.diagNow = await page.evaluate((vs)=>{const vis=eval(vs);const m=document.querySelector('[data-testid="app-shell-main-column"]')||document.body;
    const s=[...m.querySelectorAll('[role="switch"]')].filter(vis).find(x=>/diagnostic|nerd/i.test(x.closest('div')?.parentElement?.innerText||''));
    return s?s.getAttribute('aria-checked'):null;},VS);
  // back into the call and open the diagnostics surface
  await page.goto('https://airion-cargo.store/w/W4QAF1XTURESO01/call/V4OV4P8COFW6NNB',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(11000);
  out.callBtns = await page.evaluate((vs)=>{const vis=eval(vs);
    return [...document.querySelectorAll('button')].filter(vis).map(b=>(b.getAttribute('aria-label')||b.innerText||'').trim().slice(0,28)).filter(Boolean).slice(-16);},VS);
  await page.screenshot({path:'/private/tmp/claude-501/-Users-mahmud-Projects-testing/f92e5e8b-bcc2-441a-8a07-a9ff137b0db6/scratchpad/diag.png'});
  return out;
};
