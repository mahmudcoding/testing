export default async ({page}) => {
  const ws='W4QCF1XTURESO01';
  await page.goto(`https://airion-cargo.store/w/${ws}/settings/account`);
  await page.waitForTimeout(6000);
  return page.evaluate(()=>{
    const vis=(el)=>{const r=el.getBoundingClientRect(); if(r.width<2||r.height<2) return false;
      let op=1,n=el; while(n&&n!==document.documentElement){const cs=getComputedStyle(n);
        if(cs.display==='none'||cs.visibility==='hidden') return false;
        op*=parseFloat(cs.opacity||'1'); n=n.parentElement;} return op>=0.05;};
    const texts=[...document.querySelectorAll('main *')].filter(e=>e.children.length===0).filter(vis)
      .map(e=>(e.textContent||'').trim()).filter(Boolean);
    const tzIdx=texts.findIndex(t=>/time ?zone|Timezone|Region/i.test(t));
    const controls=[...document.querySelectorAll('main button, main select, main input, main [role="combobox"]')]
      .filter(vis).map(e=>({tag:e.tagName, role:e.getAttribute('role'),
        label:e.getAttribute('aria-label')||(e.textContent||'').trim().slice(0,30), val:e.value}));
    return {tzContext: tzIdx>=0? texts.slice(Math.max(0,tzIdx-2), tzIdx+6):'no timezone text',
      allTexts: texts.slice(0,40), controls: controls.slice(0,18)};
  });
};
