const VS = `(el)=>{const r=el.getBoundingClientRect();if(r.width<1||r.height<1)return false;let n=el,op=1;while(n&&n!==document.documentElement){op*=parseFloat(getComputedStyle(n).opacity||'1');n=n.parentElement;}return op>0.05;}`;
export default async ({ page }) => {
  await page.goto('https://airion-cargo.store/w/W4QAF1XTURESO01/settings/admin/invites',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(6000);
  await page.evaluate(()=>{const m=document.querySelector('[data-testid="app-shell-main-column"]')||document.body; m.scrollTop=m.scrollHeight; window.scrollTo(0,document.body.scrollHeight);});
  await page.waitForTimeout(2000);
  return await page.evaluate((vs)=>{const vis=eval(vs);
    const m=document.querySelector('[data-testid="app-shell-main-column"]')||document.body;
    return { fullTxt:(m.innerText||'').replace(/\s+/g,' ').slice(0,700),
      allButtons:[...m.querySelectorAll('button')].map(b=>({t:(b.innerText||'').trim().replace(/\s+/g,' ').slice(0,26),al:(b.getAttribute('aria-label')||'').slice(0,24),vis:vis(b),dis:b.disabled})),
      selects:[...m.querySelectorAll('select,[role="combobox"]')].map(s=>({t:(s.innerText||s.value||'').slice(0,26),vis:vis(s)})),
      inputs:[...m.querySelectorAll('input')].map(i=>({ph:(i.placeholder||'').slice(0,26),type:i.type,vis:vis(i)})) };},VS);
};
