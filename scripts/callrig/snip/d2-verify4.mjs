const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
export default async ({ page }) => {
  const W='W4QDF1XTURESO01', CO='O4QDF1XTURESO01', OWNER='U4QDOWNER000001';
  await page.goto(`https://airion-cargo.store/w/${W}/settings/admin/members`, { waitUntil:'networkidle' });
  await page.waitForTimeout(3000);
  const ui = await page.evaluate(`(() => { const vis=(${VIS}); const main=document.querySelector('main')||document.body;
    const btns=[...main.querySelectorAll('button')].filter(vis)
      .filter(e=>/^Remove$/.test((e.innerText||'').trim()) || /Remove /.test(e.getAttribute('aria-label')||''));
    const rows=btns.map(b=>{ let n=b, txt='';
      for(let i=0;i<6&&n;i++){ n=n.parentElement; if(!n)break;
        const t=(n.innerText||'').replace(/\\s+/g,' ').trim(); if(t.length>6&&t.length<160){txt=t;break;} }
      return { label:(b.getAttribute('aria-label')||'').slice(0,50), row:txt.slice(0,70),
               dis:b.disabled===true||b.getAttribute('aria-disabled')==='true' }; });
    return { removeButtons:rows.length, rows:rows.slice(0,10),
             ownerRowEnabled: rows.filter(r=>/Owner/i.test(r.row)&&!r.dis).length }; })()`);
  const api = await page.evaluate(async () => {
    const CO='O4QDF1XTURESO01', OWNER='U4QDOWNER000001';
    const r=await fetch(`/api/v1/companies/${CO}/members/${OWNER}`,{method:'DELETE',credentials:'include'});
    return { s:r.status, b:(await r.text()).slice(0,180) };
  });
  return { ui, api };
};
