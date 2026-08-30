export default async ({page}) => {
  const out={};
  out.url = page.url();
  out.pre = await page.evaluate(()=>{
    const vis = el=>{const r=el.getBoundingClientRect(); if(r.width<1||r.height<1) return false;
      let n=el,op=1; while(n&&n!==document.documentElement){op*=parseFloat(getComputedStyle(n).opacity||'1');n=n.parentElement;} return op>0.05;};
    return [...document.querySelectorAll('button')].filter(vis).map(b=>(b.getAttribute('aria-label')||b.innerText||'').trim().replace(/\s+/g,' ')).filter(Boolean).slice(0,45);
  });
  const adm = page.locator('button', {hasText:/^Admit$/}).first();
  if (await adm.count()>0) { await adm.click(); out.admitted=true; await page.waitForTimeout(4000); }
  out.post = await page.evaluate(()=>({body:(document.body.innerText||'').replace(/\s+/g,' ').slice(0,400)}));
  return out;
};
