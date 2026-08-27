export default async ({ page }) => {
  const net = [];
  page.on('response', async r => { const u=r.url(); if(!u.includes('/api/v1/')) return;
    let b=''; try { b=(await r.text()).slice(0,600); } catch {}
    net.push({ u:u.replace(/^https?:\/\/[^/]+/,''), s:r.status, body:b }); });
  const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
      let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
        if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
  await page.goto('https://airion-cargo.store/w/W4QDF1XTURESO01/directories?tab=people', { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);
  net.length = 0;
  await page.locator('button[aria-label="Open QA Alice\'s profile"]').first().click();
  await page.waitForTimeout(3000);
  const panel = await page.evaluate(`(() => { const vis = ${VIS};
    const cands = [...document.querySelectorAll('[role=dialog],aside,[data-radix-popper-content-wrapper]')].filter(vis)
      .filter(e => /Alice/.test(e.innerText||'') && !/Search QA Workspace/.test(e.innerText||''));
    const dlg = cands.sort((a,b)=>{const A=a.getBoundingClientRect(),B=b.getBoundingClientRect();return (B.width*B.height)-(A.width*A.height);})[0];
    const txt = dlg ? (dlg.innerText||'').trim() : '(no panel)';
    const t = document.body.innerText;
    return { panelText: txt.slice(0,400),
      inPanel: { job:/QA Engineer/.test(txt), dept:/Quality/.test(txt), pron:/they\\/them/.test(txt), status:/Testing profile fields/.test(txt) },
      inBody:  { job:/QA Engineer/.test(t), dept:/Quality/.test(t), pron:/they\\/them/.test(t), status:/Testing profile fields/.test(t) } }; })()`);
  const statusApi = await page.evaluate(async () => {
    const r = await fetch('/api/v1/users/U4QDALICE000001/status', { credentials:'include' });
    return { s: r.status, body: (await r.text()).slice(0,300) };
  });
  return { panel, statusEndpoint: statusApi,
    panelCalls: net.map(n=>n.u+' -> '+n.s).slice(0,8),
    statusResponseSeen: (net.find(n=>/\/status$/.test(n.u))||{}).body || '' };
};
