export default async ({page}) => {
  const out = {};
  out.api = await page.evaluate(async () => {
    const r = await fetch('/api/v1/notifications?limit=15', {credentials:'include'});
    const t = await r.text();
    return {s:r.status, b:t.slice(0,900)};
  });
  // open the bell
  const clicked = await page.evaluate(() => {
    const v = el => { let n=el, op=1; while(n && n!==document.documentElement){ const c=getComputedStyle(n); if(c.display==='none'||c.visibility==='hidden') return false; op*=parseFloat(c.opacity||'1'); n=n.parentElement; } const r=el.getBoundingClientRect(); return op>0.05 && r.width>0 && r.height>0; };
    const b=[...document.querySelectorAll('button')].filter(v).find(x=>/notification/i.test(x.getAttribute('aria-label')||''));
    if(b){ b.click(); return (b.getAttribute('aria-label')||'').slice(0,40); } return null;
  });
  await page.waitForTimeout(3000);
  out.bellClicked = clicked;
  out.panel = await page.evaluate(() => {
    const v = el => { let n=el, op=1; while(n && n!==document.documentElement){ const c=getComputedStyle(n); if(c.display==='none'||c.visibility==='hidden') return false; op*=parseFloat(c.opacity||'1'); n=n.parentElement; } const r=el.getBoundingClientRect(); return op>0.05 && r.width>0 && r.height>0; };
    const p=[...document.querySelectorAll('[role=dialog],[role=menu],aside,[data-testid*=notification]')].filter(v).pop();
    return p ? (p.innerText||'').replace(/\n+/g,' | ').slice(0,700) : null;
  });
  return out;
};
