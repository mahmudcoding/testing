const VS = `(el)=>{const r=el.getBoundingClientRect();if(r.width<1||r.height<1)return false;let n=el,op=1;while(n&&n!==document.documentElement){op*=parseFloat(getComputedStyle(n).opacity||'1');n=n.parentElement;}return op>0.05;}`;
export default async ({ page }) => {
  if(!/\/w\//.test(page.url())){ await page.goto('https://airion-cargo.store/w/W4QAF1XTURESO01/chat/mentions',{waitUntil:'domcontentloaded'}); await page.waitForTimeout(3000); }
  return await page.evaluate((vs)=>{const vis=eval(vs);
    const out=[];
    // DM sidebar rows
    for(const a of document.querySelectorAll('a[href*="/d/"]')){
      if(!vis(a)) continue;
      const name=(a.innerText||'').replace(/\s+/g,' ').trim().slice(0,24);
      const dots=[...a.querySelectorAll('span,div')].filter(d=>{const b=d.getBoundingClientRect();const cs=getComputedStyle(d);
        return vis(d)&&b.width>3&&b.width<=14&&Math.abs(b.width-b.height)<3&&cs.backgroundColor!=='rgba(0, 0, 0, 0)';})
        .map(d=>({bg:getComputedStyle(d).backgroundColor,title:d.getAttribute('title')||d.getAttribute('aria-label')||''}));
      out.push({name,dots});
    }
    // also any element whose aria-label/title mentions status
    const labelled=[...document.querySelectorAll('[aria-label*="ctive"],[title*="ctive"],[aria-label*="ffline"],[title*="ffline"],[aria-label*="way"],[title*="way"]')]
      .filter(vis).map(e=>({al:e.getAttribute('aria-label')||e.getAttribute('title'),tag:e.tagName})).slice(0,8);
    return { dmRows: out, statusLabelled: labelled };},VS);
};
