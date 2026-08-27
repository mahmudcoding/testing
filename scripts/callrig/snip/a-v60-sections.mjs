const VS = `(el)=>{const r=el.getBoundingClientRect();if(r.width<1||r.height<1)return false;let n=el,op=1;while(n&&n!==document.documentElement){op*=parseFloat(getComputedStyle(n).opacity||'1');n=n.parentElement;}return op>0.05;}`;
export default async ({ page }) => {
  const out={};
  for (const s of ['privacy','sessions','security','roles?scope=company','notifications','appearance','calls']) {
    await page.goto('https://airion-cargo.store/w/W4QAF1XTURESO01/settings/'+s,{waitUntil:'domcontentloaded'});
    await page.waitForTimeout(2800);
    out[s.split('?')[0]] = await page.evaluate((vs)=>{const vis=eval(vs);
      const m=document.querySelector('[data-testid="app-shell-main-column"]')||document.body;
      return {
        sw:[...m.querySelectorAll('[role="switch"],input[type="checkbox"]')].filter(vis).map(x=>({
          n:(x.closest('div')?.parentElement?.innerText||'').replace(/\s+/g,' ').slice(0,46), on:String(x.getAttribute('aria-checked')??x.checked)})),
        btns:[...m.querySelectorAll('button')].filter(vis).map(b=>({t:(b.innerText||'').trim().replace(/\s+/g,' ').slice(0,26),dis:b.disabled})).filter(b=>b.t),
        combos:[...m.querySelectorAll('[role="combobox"],select')].filter(vis).map(c=>(c.innerText||c.value||'').replace(/\s+/g,' ').slice(0,30)),
        txt:(m.innerText||'').replace(/\s+/g,' ').slice(0,420),
      };},VS);
  }
  return out;
};
