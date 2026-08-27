const VS = `(el)=>{const r=el.getBoundingClientRect();if(r.width<1||r.height<1)return false;let n=el,op=1;while(n&&n!==document.documentElement){op*=parseFloat(getComputedStyle(n).opacity||'1');n=n.parentElement;}return op>0.05;}`;
export default async ({ page }) => {
  await page.goto('https://airion-cargo.store/w/W4QAF1XTURESO01/files',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4500);
  await page.screenshot({path:'/private/tmp/claude-501/-Users-mahmud-Projects-testing/f92e5e8b-bcc2-441a-8a07-a9ff137b0db6/scratchpad/files.png'});
  return await page.evaluate((vs)=>{const vis=eval(vs);
    const m=document.querySelector('[data-testid="app-shell-main-column"]')||document.body;
    return { txt:(m.innerText||'').replace(/\s+/g,' ').slice(0,300),
      tabs:[...m.querySelectorAll('[role="tab"],button')].filter(vis).map(b=>(b.innerText||'').trim().replace(/\s+/g,' ').slice(0,22)).filter(Boolean).slice(0,18),
      rows:[...m.querySelectorAll('[data-testid],tr,li')].filter(vis).map(r=>(r.innerText||'').replace(/\s+/g,' ').trim().slice(0,40)).filter(Boolean).slice(0,8) };},VS);
};
