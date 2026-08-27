export default async ({page}) => {
  const NAME=process.env.QA_GNAME||'QA Visitor';
  const inp = await page.$('input[type=text]');
  if(inp) { await inp.fill(NAME); await page.waitForTimeout(600); }
  const clicked = await page.evaluate(()=>{
    const v = el => { let n=el, op=1; while(n && n!==document.documentElement){ const c=getComputedStyle(n); if(c.display==='none'||c.visibility==='hidden') return false; op*=parseFloat(c.opacity||'1'); n=n.parentElement; } const r=el.getBoundingClientRect(); return op>0.05 && r.width>0 && r.height>0; };
    const b=[...document.querySelectorAll('button')].filter(v).find(x=>/^(Ask to join|Join call)$/i.test((x.innerText||'').trim()));
    if(b && !b.disabled){ b.click(); return (b.innerText||'').trim(); } return {dis:b?b.disabled:'notfound'};
  });
  await page.waitForTimeout(9000);
  const after = await page.evaluate(()=>{
    const v = el => { let n=el, op=1; while(n && n!==document.documentElement){ const c=getComputedStyle(n); if(c.display==='none'||c.visibility==='hidden') return false; op*=parseFloat(c.opacity||'1'); n=n.parentElement; } const r=el.getBoundingClientRect(); return op>0.05 && r.width>0 && r.height>0; };
    const all=[...document.querySelectorAll('button,a,input,[role=button],[tabindex]:not([tabindex="-1"])')].filter(v);
    return {url:location.href, body:(document.body.innerText||'').replace(/\n+/g,' | ').slice(0,340),
            interactiveCount: all.length,
            interactive: all.map(e=>({tag:e.tag||e.tagName, t:(e.getAttribute('aria-label')||e.innerText||'').replace(/\s+/g,' ').trim().slice(0,36)}))};
  });
  return {clicked, after};
};
