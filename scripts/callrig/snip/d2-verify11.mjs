const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
export default async ({ page }) => {
  const W='W4QDF1XTURESO01';
  await page.goto(`https://airion-cargo.store/w/${W}/settings/admin/invites`, { waitUntil:'networkidle' });
  await page.waitForTimeout(3000);
  return await page.evaluate(`(() => { const vis=(${VIS}); const main=document.querySelector('main')||document.body;
    const full=(main.innerText||'').replace(/\\s+/g,' ');
    const leaves=[...main.querySelectorAll('*')].filter(e=>!e.children.length).filter(vis)
      .map(e=>(e.innerText||'').replace(/\\s+/g,' ').trim()).filter(Boolean);
    return { len:full.length,
      hasDelayed: full.includes('Email delivery may be delayed'),
      hasInbox: full.includes("in-app inbox"),
      inboxLine: leaves.find(l=>/in-app inbox/.test(l))||'(not found)',
      delayedLine: leaves.find(l=>/delivery may be delayed/.test(l))||'(not found)',
      directBlock: (()=>{ const i=full.indexOf('direct invite'); const j=full.toLowerCase().indexOf('create direct');
        const k = j>=0?j:(i>=0?i:0); return full.slice(k, k+320); })() }; })()`);
};
