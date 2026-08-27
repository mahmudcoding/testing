const VS = `(el)=>{const r=el.getBoundingClientRect();if(r.width<1||r.height<1)return false;let n=el,op=1;while(n&&n!==document.documentElement){op*=parseFloat(getComputedStyle(n).opacity||'1');n=n.parentElement;}return op>0.05;}`;
export default async ({ page }) => {
  await page.goto('https://airion-cargo.store/w/W4QAF1XTURESO01/settings/profile',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(3200);
  await page.screenshot({ path:'/private/tmp/claude-501/-Users-mahmud-Projects-testing/f92e5e8b-bcc2-441a-8a07-a9ff137b0db6/scratchpad/settings-profile.png', fullPage:true });
  return await page.evaluate((vs)=>{const vis=eval(vs);
    const main=document.querySelector('[data-testid="app-shell-main-column"]')||document.body;
    return {
      switches:[...main.querySelectorAll('[role="switch"],input[type="checkbox"]')].filter(vis).map(s=>({
        al:(s.getAttribute('aria-label')||'').slice(0,40), checked:s.getAttribute('aria-checked')??s.checked,
        near:(s.closest('div')?.parentElement?.innerText||'').replace(/\s+/g,' ').slice(0,90)})),
      buttons:[...main.querySelectorAll('button')].filter(vis).map(b=>({t:(b.innerText||'').trim().replace(/\s+/g,' ').slice(0,30),dis:b.disabled})),
      text:(main.innerText||'').replace(/\s+/g,' ').slice(0,900),
    };},VS);
};
