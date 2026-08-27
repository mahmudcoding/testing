const VS = `(el)=>{const r=el.getBoundingClientRect();if(r.width<1||r.height<1)return false;let n=el,op=1;while(n&&n!==document.documentElement){op*=parseFloat(getComputedStyle(n).opacity||'1');n=n.parentElement;}return op>0.05;}`;
export default async ({ page }) => {
  const out={};
  for (const scope of ['company','workspace']) {
    await page.goto(`https://airion-cargo.store/w/W4QAF1XTURESO01/settings/roles?scope=${scope}`,{waitUntil:'domcontentloaded'});
    await page.waitForTimeout(4200);
    out[scope] = await page.evaluate((vs)=>{const vis=eval(vs);
      const m=document.querySelector('[data-testid="app-shell-main-column"]')||document.body;
      const trs=[...m.querySelectorAll('tr')].filter(vis);
      if(trs.length){
        return { mode:'table', rows: trs.map(r=>({
          cells:[...r.querySelectorAll('td,th')].map(c=>(c.innerText||'').replace(/\s+/g,' ').trim().slice(0,26)),
          buttons:[...r.querySelectorAll('button')].filter(vis).map(b=>(b.innerText||b.getAttribute('aria-label')||'').trim().slice(0,14)).filter(Boolean) })).slice(0,8) };
      }
      // fall back: rows are the elements that contain a role id like R4QA...
      const rows=[...m.querySelectorAll('*')].filter(e=>vis(e)&&/R4QA[A-Z0-9]+/.test(e.innerText||'')&&e.children.length<=6&&(e.innerText||'').length<200);
      const seen=new Set(),o=[];
      for(const r of rows){const t=(r.innerText||'').replace(/\s+/g,' ').trim(); if(seen.has(t))continue; seen.add(t);
        o.push({txt:t.slice(0,80), buttons:[...r.querySelectorAll('button')].filter(vis).map(b=>(b.innerText||'').trim().slice(0,12)).filter(Boolean)});}
      return { mode:'divs', rows:o.slice(0,8) };},VS);
  }
  return out;
};
