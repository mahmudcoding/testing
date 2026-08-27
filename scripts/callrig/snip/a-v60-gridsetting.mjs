const VS = `(el)=>{const r=el.getBoundingClientRect();if(r.width<1||r.height<1)return false;let n=el,op=1;while(n&&n!==document.documentElement){op*=parseFloat(getComputedStyle(n).opacity||'1');n=n.parentElement;}return op>0.05;}`;
export default async ({ page }) => {
  const out={};
  await page.goto('https://airion-cargo.store/w/W4QAF1XTURESO01/settings/calls',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4500);
  await page.evaluate(()=>{const m=document.querySelector('[data-testid="app-shell-main-column"]')||document.body;m.scrollTop=m.scrollHeight;});
  await page.waitForTimeout(1500);
  out.callsSettings = await page.evaluate((vs)=>{const vis=eval(vs);
    const m=document.querySelector('[data-testid="app-shell-main-column"]')||document.body;
    return { txt:(m.innerText||'').replace(/\s+/g,' ').slice(0,600),
      controls:[...m.querySelectorAll('button,select,input,[role="combobox"],[role="slider"]')].filter(vis)
        .map(c=>({tag:c.tagName,t:(c.innerText||c.value||'').replace(/\s+/g,' ').slice(0,26),al:(c.getAttribute('aria-label')||'').slice(0,30),role:c.getAttribute('role')||''}))
        .filter(c=>c.t||c.al).slice(0,24) };},VS);
  return out;
};
