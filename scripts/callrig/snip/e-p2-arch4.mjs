export default async ({page}) => {
  const reqs=[]; const h=r=>{const u=r.url(); if(u.includes('/api/v1/')) reqs.push(r.request().method()+' '+u.replace(/https?:\/\/[^/]+/,'')+' -> '+r.status());};
  page.on('response',h);
  const btn = page.locator('button[aria-label="Open archived channels"]');
  await btn.click();
  await page.waitForTimeout(2500);
  page.off('response',h);
  const dom = await page.evaluate(()=>{
    const vis = e => { let n=e,o=1; while(n&&n!==document.documentElement){const s=getComputedStyle(n); if(s.display==='none'||s.visibility==='hidden')return false; o*=parseFloat(s.opacity||'1'); n=n.parentElement;} return o>0.01 && e.getBoundingClientRect().width>0; };
    // do NOT filter to [role=dialog] — that mistake cost this session twice
    const cands=[...document.querySelectorAll('[role=dialog],aside,[data-state=open],div[class*=modal i],div[class*=Modal]')].filter(vis);
    const d = cands.sort((a,b)=>b.getBoundingClientRect().width*b.getBoundingClientRect().height - a.getBoundingClientRect().width*a.getBoundingClientRect().height)[0];
    if(!d) return {found:false, bodyText: document.body.innerText.slice(0,400)};
    const els=[...d.querySelectorAll('button,a,[role=button],input')].filter(vis);
    return {found:true, tag:d.tagName, role:d.getAttribute('role'),
      text: d.innerText.slice(0,700),
      controls: els.map(e=>({t:e.tagName,l:(e.getAttribute('aria-label')||e.textContent||'').trim().slice(0,40)}))};
  });
  return {requests:reqs, dom};
};
