const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
export default async ({ page }) => {
  const W='W4QDF1XTURESO01';
  const net=[];
  page.on('response', async r => { const u=r.url().replace(/^https?:\/\/[^/]+/,'');
    if(!/\/api\/v1\//.test(u)) return;
    let b=''; try{b=(await r.text()).slice(0,260);}catch{}
    net.push(`${r.request().method()} ${u.slice(0,52)} -> ${r.status()} ${b.replace(/\s+/g,' ')}`); });
  await page.goto(`https://airion-cargo.store/w/${W}/directories?tab=people`, { waitUntil:'networkidle' });
  await page.waitForTimeout(3000);
  const before = await page.evaluate(`(() => (document.body.innerText||'').replace(/\\s+/g,' '))()`);
  net.length=0;
  const clicked = await page.evaluate(`(() => { const vis=(${VIS});
    const c=[...document.querySelectorAll('button')].filter(vis)
      .filter(e=>(e.getAttribute('aria-label')||"")==="Open QA Alice's profile");
    if(c.length<1) return {n:0}; c[0].click(); return {n:c.length}; })()`);
  await page.waitForTimeout(3400);
  const after = await page.evaluate(`(() => { const vis=(${VIS});
    const b=(document.body.innerText||'').replace(/\\s+/g,' ');
    const dlg=[...document.querySelectorAll('[role=dialog]')].filter(vis);
    return { len:b.length, dialogs:dlg.length,
      dialogText: dlg.length?(dlg[0].innerText||'').replace(/\\s+/g,' ').trim().slice(0,520):'(no dialog)',
      dialogControls: dlg.length?[...dlg[0].querySelectorAll('button,a,[role=tab]')].filter(vis)
        .map(e=>((e.innerText||'').trim()||e.getAttribute('aria-label')||'').slice(0,28)).filter(Boolean):[],
      has:{ jobTitle:/QA Engineer/.test(b), department:/Quality/.test(b), pronouns:/they\\/them/.test(b),
            phone:/998 90 000/.test(b), github:/octocat/.test(b), website:/example\\.org/.test(b),
            linkedin:/in\\/example/.test(b), timezone:/Tashkent|GMT\\+5|UTC\\+5|05:00/i.test(b) } }; })()`);
  return { clicked, beforeLen:before.length, after, requests:net.slice(0,8) };
};
