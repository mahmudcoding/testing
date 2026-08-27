const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
export default async ({ page }) => {
  const TOKEN = process.env.D2_TOKEN || '';
  if (!TOKEN) return { err:'no token' };
  const who = await page.evaluate(`(async()=>{const a=await (await fetch('/api/v1/auth/me',{credentials:'include'})).json();
    return a.email;})()`);
  const net=[];
  const onResp = async r => { const u=r.url().replace(/^https?:\/\/[^/]+/,'');
    if(!/\/api\//.test(u)) return; let b=''; try{b=(await r.text()).slice(0,150);}catch{}
    if(/invite/i.test(u)) net.push(`${r.request().method()} ${u.slice(0,56)} -> ${r.status()} ${b}`); };
  page.on('response', onResp);
  await page.goto('https://airion-cargo.store/invite?token='+encodeURIComponent(TOKEN), { waitUntil:'networkidle' });
  await page.waitForTimeout(3500);
  const ui = await page.evaluate(`(() => { const vis=(${VIS});
    const b=document.body;
    const t=(b.innerText||'').replace(/\\s+/g,' ').trim();
    const ctl=[...b.querySelectorAll('button,a[href],input')].filter(vis)
      .map(e=>({ text:(e.innerText||e.getAttribute('aria-label')||e.getAttribute('placeholder')||'').replace(/\\s+/g,' ').trim().slice(0,30),
                 href:(e.getAttribute('href')||'').slice(0,44) }));
    return { landedOn: location.pathname+location.search.slice(0,26), text: t.slice(0,300),
             saysInvalid: /invalid|no longer valid|expired|недействит/i.test(t),
             saysAlreadyMember: /already|уже/i.test(t),
             controls: ctl }; })()`);
  page.off('response', onResp);
  return { signedInAs: who, ui, inviteRequests:[...net].slice(0,4) };
};
