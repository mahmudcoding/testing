const VS = `(el)=>{const r=el.getBoundingClientRect();if(r.width<1||r.height<1)return false;let n=el,op=1;while(n&&n!==document.documentElement){op*=parseFloat(getComputedStyle(n).opacity||'1');n=n.parentElement;}return op>0.05;}`;
export default async ({ page }) => {
  const out={};
  for (const scope of ['company','workspace']) {
    await page.goto(`https://airion-cargo.store/w/W4QAF1XTURESO01/settings/roles?scope=${scope}`,{waitUntil:'domcontentloaded'});
    await page.waitForTimeout(4200);
    out[scope] = await page.evaluate((vs)=>{const vis=eval(vs);
      const m=document.querySelector('[data-testid="app-shell-main-column"]')||document.body;
      return [...m.querySelectorAll('tr')].filter(vis)
        .filter(r=>/R4QA[A-Z0-9]+/.test(r.innerText||''))
        .map(r=>{const c=[...r.querySelectorAll('td,th')].map(c=>(c.innerText||'').replace(/\s+/g,' ').trim());
          return { role:c[0]?.slice(0,26), state:c.find(x=>/^(System|Custom)$/.test(x))||'?',
                   buttons:[...r.querySelectorAll('button')].filter(vis).map(b=>(b.innerText||b.getAttribute('aria-label')||'').trim().slice(0,14)).filter(Boolean) };});},VS);
  }
  return out;
};
