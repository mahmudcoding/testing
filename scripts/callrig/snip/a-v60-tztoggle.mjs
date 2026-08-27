const VS = `(el)=>{const r=el.getBoundingClientRect();if(r.width<1||r.height<1)return false;let n=el,op=1;while(n&&n!==document.documentElement){op*=parseFloat(getComputedStyle(n).opacity||'1');n=n.parentElement;}return op>0.05;}`;
export default async ({ page }) => {
  const reqs=[]; page.on('response', r=>{const u=r.url(); if(u.includes('/api/v1/')&&r.request().method()!=='GET') reqs.push({m:r.request().method(),u:u.split('/api/v1/')[1].slice(0,60),s:r.status()});});
  const state = () => page.evaluate((vs)=>{const vis=eval(vs);const main=document.querySelector('[data-testid="app-shell-main-column"]')||document.body;
    const sw=[...main.querySelectorAll('[role="switch"],input[type="checkbox"]')].filter(vis).map(s=>({
      near:(s.closest('div')?.parentElement?.innerText||'').replace(/\s+/g,' ').slice(0,34), on:String(s.getAttribute('aria-checked')??s.checked)}));
    const save=[...main.querySelectorAll('button')].filter(vis).filter(b=>/save|discard/i.test(b.innerText||'')).map(b=>b.innerText.trim());
    return {sw, save};},VS);

  await page.goto('https://airion-cargo.store/w/W4QAF1XTURESO01/settings/profile',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(3200);
  const before = await state();
  // click the "Show timezone" switch
  const clicked = await page.evaluate((vs)=>{const vis=eval(vs);const main=document.querySelector('[data-testid="app-shell-main-column"]')||document.body;
    const s=[...main.querySelectorAll('[role="switch"],input[type="checkbox"]')].filter(vis)
      .find(s=>/Show timezone/i.test(s.closest('div')?.parentElement?.innerText||''));
    if(!s) return false; s.click(); return true;},VS);
  const poll=[]; for(let i=0;i<8;i++){ poll.push(await state()); await page.waitForTimeout(350); }
  const afterClick = poll[poll.length-1];
  // reload and re-read
  await page.reload({waitUntil:'domcontentloaded'}); await page.waitForTimeout(3400);
  const afterReload = await state();
  return { clicked, before:before.sw, afterClick, afterReload:afterReload.sw, requests:reqs };
};
