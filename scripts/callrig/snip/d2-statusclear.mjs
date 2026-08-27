const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
export default async ({ page }) => {
  const W='W4QDF1XTURESO01';
  await page.goto(`https://airion-cargo.store/w/${W}/settings/profile`, { waitUntil:'networkidle' });
  await page.waitForTimeout(2800);
  const ui = await page.evaluate(`(() => { const vis=(${VIS});
    const main=document.querySelector('main')||document.body;
    const t=(main.innerText||'').replace(/\\s+/g,' ');
    return { everyInteractive:[...main.querySelectorAll('button,a[href],input,select,textarea,[role=switch],[role=radio],[role=combobox],[role=button]')]
        .filter(vis).filter(e=>e.getBoundingClientRect().left>300)
        .map(e=>({ tag:e.tagName.toLowerCase(), role:e.getAttribute('role')||'',
                   t:(e.innerText||'').replace(/\\s+/g,' ').trim().slice(0,30),
                   al:(e.getAttribute('aria-label')||'').slice(0,40),
                   val:String(e.value||'').slice(0,24), y:Math.round(e.getBoundingClientRect().top) })),
      mentionsClear:/clear|remove|снять|очист/i.test(t),
      statusSection: t.slice(Math.max(0,t.indexOf('Status')-40), t.indexOf('Status')+320) }; })()`);
  const api = await page.evaluate(async () => {
    const A='U4QDALICE000001';
    const del=await fetch('/api/v1/users/me/status',{method:'DELETE',credentials:'include'});
    const delRes={s:del.status,b:(await del.text()).slice(0,140)};
    const now=await (await fetch(`/api/v1/users/${A}/status`,{credentials:'include'})).text();
    return { delRes, statusNow:now.slice(0,120) };
  });
  return { ui, api };
};
