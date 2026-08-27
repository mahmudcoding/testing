const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
export default async ({ page, browser }) => {
  const W='W4QDF1XTURESO01';
  const out={};
  // ---- ALK-3005: are sessions all called "Unknown device"?
  await page.goto(`https://airion-cargo.store/w/${W}/settings/sessions`, { waitUntil:'networkidle' });
  await page.waitForTimeout(2800);
  out.ALK_3005 = await page.evaluate(`(async () => { const vis=(${VIS});
    const main=document.querySelector('main')||document.body;
    const txt=(main.innerText||'').replace(/\\s+/g,' ');
    const r=await fetch('/api/v1/security/sessions',{credentials:'include'});
    const j=await r.json().catch(()=>null);
    const arr=Array.isArray(j)?j:((j&&(j.sessions||j.items))||[]);
    return { onScreenHasUnknownDevice: /Unknown device/i.test(txt),
             screenExcerpt: (txt.match(/Active sessions[^]{0,200}/)||[])[0]||txt.slice(0,200),
             apiCount: arr.length,
             apiDeviceFields: arr.slice(0,2).map(x=>({ device:x.device_name||x.device||null,
               ua:(x.user_agent||'').slice(0,48), ip:x.ip_address||x.ip||null })) }; })()`);

  // ---- ALK-3025: invalid reset-password link — can the user request a new one?
  const ctx = await browser.newContext();
  const p2 = await ctx.newPage();
  try {
    await p2.goto('https://airion-cargo.store/reset-password?token=not-a-real-token-000', { waitUntil:'networkidle' });
    await p2.waitForTimeout(2600);
    out.ALK_3025 = await p2.evaluate(`(() => { const vis=(${VIS});
      const b=document.body;
      const ctl=[...b.querySelectorAll('button,a[href],input,[role=button],[role=link]')].filter(vis)
        .map(e=>({ tag:e.tagName.toLowerCase(),
                   text:(e.innerText||e.getAttribute('aria-label')||e.getAttribute('placeholder')||'').replace(/\\s+/g,' ').trim().slice(0,34),
                   href:(e.getAttribute('href')||'').slice(0,40) }));
      const t=(b.innerText||'').replace(/\\s+/g,' ').trim();
      return { text:t.slice(0,260), controls:ctl,
               offersNewLink: /request a new|Send.*link|Forgot password|запрос/i.test(t)
                 || ctl.some(c=>/request|forgot|new link/i.test(c.text)) }; })()`);
  } finally { await ctx.close(); }
  return out;
};
