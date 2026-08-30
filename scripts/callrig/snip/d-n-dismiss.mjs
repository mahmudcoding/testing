export default async ({page}) => {
  const out={};
  out.before = await page.evaluate(()=>[...document.querySelectorAll('[role=dialog]')].filter(d=>{const r=d.getBoundingClientRect();return r.width>1&&r.width<900;}).map(d=>(d.innerText||'').replace(/\s+/g,' ').slice(0,100)));
  for (let i=0;i<3;i++){ await page.keyboard.press('Escape'); await page.waitForTimeout(600); }
  out.after = await page.evaluate(()=>[...document.querySelectorAll('[role=dialog]')].filter(d=>{const r=d.getBoundingClientRect();return r.width>1&&r.width<900;}).map(d=>(d.innerText||'').replace(/\s+/g,' ').slice(0,100)));
  out.rec = await page.evaluate(()=>{
    const vis = el=>{if(!el)return false;const r=el.getBoundingClientRect(); if(r.width<1||r.height<1) return false;
      let n=el,op=1; while(n&&n!==document.documentElement){op*=parseFloat(getComputedStyle(n).opacity||'1');n=n.parentElement;} return op>0.05;};
    return [...document.querySelectorAll('button')].filter(vis).filter(x=>/record/i.test((x.getAttribute('aria-label')||'')+(x.innerText||''))).map(x=>({l:(x.getAttribute('aria-label')||x.innerText||'').trim(),tid:x.dataset.testid||null}));});
  return out;
};
