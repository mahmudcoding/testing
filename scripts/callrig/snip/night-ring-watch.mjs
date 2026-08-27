export default async ({page}) => {
  const t0=Date.now(); let first=null;
  while (Date.now()-t0 < Number(process.env.QA_MAX||70000) && !first) {
    const s = await page.evaluate(()=>{
      const t=document.body.innerText;
      const m=t.match(/[^\n]*is calling[^\n]*/) || t.match(/[^\n]*Incoming call[^\n]*/);
      if(!m) return null;
      const btn=[...document.querySelectorAll('button')]
        .filter(b=>/^(Accept|Decline)$/.test((b.getAttribute('aria-label')||b.textContent||'').trim()))
        .map(b=>({l:(b.getAttribute('aria-label')||b.textContent||'').trim(), tid:b.getAttribute('data-testid')}));
      return {text:m[0].trim().slice(0,60), buttons:btn};
    });
    if(s) first={at:((Date.now()-t0)/1000).toFixed(1)+'s', ...s};
    else await page.waitForTimeout(500);
  }
  return first || {none:true, waited:((Date.now()-t0)/1000).toFixed(0)+'s'};
};
