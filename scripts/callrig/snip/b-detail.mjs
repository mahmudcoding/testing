export default async ({page}) => {
  const WS='W4QBF1XTURESO01', M='V4OWAZJ5MTHSO98';
  const out={};
  await page.goto(`https://airion-cargo.store/w/${WS}/calls/${M}`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(5000);
  out.url = page.url();
  const vis = `el=>{const r=el.getBoundingClientRect(); if(r.width===0||r.height===0) return false; let o=1,n=el; while(n&&n!==document.documentElement){const cs=getComputedStyle(n); if(cs.display==='none'||cs.visibility==='hidden') return false; o*=parseFloat(cs.opacity||'1'); n=n.parentElement;} return o>0.05;}`;
  out.page = await page.evaluate((vs)=>{ const v=eval(vs);
    return {
      text: document.body.innerText.replace(/\n{2,}/g,'\n').slice(0,1200),
      tabs: [...document.querySelectorAll('[role=tab]')].filter(v).map(t=>({t:t.innerText.replace(/\s+/g,' ').trim(), sel:t.getAttribute('aria-selected')})),
      buttons: [...document.querySelectorAll('button')].filter(v).map(b=>(b.getAttribute('aria-label')||b.innerText||'').replace(/\s+/g,' ').trim()).filter(Boolean).slice(0,30)
    }; }, vis);
  return out;
};
