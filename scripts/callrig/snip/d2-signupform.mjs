const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
export default async ({ browser }) => {
  const ctx = await browser.newContext();
  const p = await ctx.newPage();
  const out={};
  try {
    for (const [k,u] of [['signup','https://airion-cargo.store/signup'],
                         ['login','https://airion-cargo.store/login']]) {
      await p.goto(u, { waitUntil:'networkidle' });
      await p.waitForTimeout(2400);
      out[k] = await p.evaluate(`(() => { const vis=(${VIS});
        const b=document.body;
        const fields=[...b.querySelectorAll('input')].filter(vis)
          .map(i=>({ name:i.name||'', type:i.type, ph:(i.placeholder||'').slice(0,26),
                     required:i.required, label:((i.closest('label')||{}).innerText||'').replace(/\\s+/g,' ').trim().slice(0,26) }));
        const btns=[...b.querySelectorAll('button')].filter(vis).map(x=>(x.innerText||'').trim().slice(0,22)).filter(Boolean);
        const t=(b.innerText||'').replace(/\\s+/g,' ');
        return { fields, buttons:btns, mentionsName:/name/i.test(t), heading:t.slice(0,80) }; })()`);
    }
  } finally { await ctx.close(); }
  return out;
};
