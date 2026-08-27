const VS = `(el)=>{const r=el.getBoundingClientRect();if(r.width<1||r.height<1)return false;let n=el,op=1;while(n&&n!==document.documentElement){op*=parseFloat(getComputedStyle(n).opacity||'1');n=n.parentElement;}return op>0.05;}`;
export default async ({ page }) => {
  await page.goto('https://airion-cargo.store/w/W4QAF1XTURESO01/calls',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4500);
  await page.screenshot({path:'/private/tmp/claude-501/-Users-mahmud-Projects-testing/f92e5e8b-bcc2-441a-8a07-a9ff137b0db6/scratchpad/calls-hub.png'});
  return await page.evaluate((vs)=>{const vis=eval(vs);
    const m=document.querySelector('[data-testid="app-shell-main-column"]')||document.body;
    return { btns:[...m.querySelectorAll('button')].filter(vis).map(b=>({t:(b.innerText||'').trim().replace(/\s+/g,' ').slice(0,26),tid:b.getAttribute('data-testid')||'',al:(b.getAttribute('aria-label')||'').slice(0,24)})).filter(b=>b.t||b.tid||b.al).slice(0,22),
             tabs:[...m.querySelectorAll('[role="tab"]')].filter(vis).map(t=>(t.innerText||'').trim().slice(0,16)),
             txt:(m.innerText||'').replace(/\s+/g,' ').slice(0,300) };},VS);
};
