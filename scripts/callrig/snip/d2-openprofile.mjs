export default async ({ page }) => {
  const net = [];
  page.on('response', async r => { const u = r.url(); if (!u.includes('/api/v1/')) return;
    let b=''; try { b = (await r.text()).slice(0,700); } catch {}
    net.push({ u: u.replace(/^https?:\/\/[^/]+/,''), s: r.status(), body: b }); });
  await page.goto('https://airion-cargo.store/w/W4QDF1XTURESO01/directories?tab=people', { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);
  net.length = 0;
  const btn = page.locator('button[aria-label="Open QA Alice\'s profile"]').first();
  await btn.scrollIntoViewIfNeeded();
  await btn.click();
  await page.waitForTimeout(3000);
  const vis = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
      let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
        if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
  const panel = await page.evaluate(`(() => { const vis = ${vis};
    const cands = [...document.querySelectorAll('[role=dialog],[data-radix-popper-content-wrapper],aside,[data-state=open]')]
      .filter(vis).filter(e => /Alice/.test(e.innerText||''));
    const dlg = cands.sort((a,b)=> (b.getBoundingClientRect().width*b.getBoundingClientRect().height)-(a.getBoundingClientRect().width*a.getBoundingClientRect().height))[0];
    const t = document.body.innerText;
    const bodyHas = { phone: /998 90 123/.test(t), linkedin: /linkedin/i.test(t), github: /github/i.test(t), site: /example\\.org/.test(t) };
    if (!dlg) return { found:false, bodyHas };
    const txt = (dlg.innerText||'').trim().replace(/\\n{2,}/g,'\\n').slice(0,800);
    const btns = [...dlg.querySelectorAll('button,a')].filter(vis).map(b=>(b.getAttribute('aria-label')||b.innerText||'').trim()).filter(Boolean).slice(0,18);
    return { found:true, text:txt, buttons:btns, bodyHas,
      panelHas:{ phone:/998 90 123/.test(txt), linkedin:/linkedin/i.test(txt), github:/github/i.test(txt), site:/example\\.org/.test(txt) } }; })()`);
  return { panel, apiCalls: net.map(n => n.u + ' -> ' + n.s).slice(0,10),
           profileBody: (net.find(n => /user|profile|member/i.test(n.u) && n.s===200) || {}).body || '' };
};
