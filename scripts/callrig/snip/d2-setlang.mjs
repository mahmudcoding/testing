const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
export default async ({ page }) => {
  const W='W4QDF1XTURESO01';
  const WANT = process.env.D2_LANGNAME || 'Uzbek (Cyrillic)';
  const net=[];
  page.on('response', async r => { if(r.request().method()==='GET') return;
    const u=r.url().replace(/^https?:\/\/[^/]+/,''); if(!/\/api\/v1\//.test(u)) return;
    net.push(`${r.request().method()} ${u.slice(0,38)} <- ${(r.request().postData()||'').slice(0,70)} -> ${r.status()}`); });
  await page.goto(`https://airion-cargo.store/w/${W}/settings/account`, { waitUntil:'networkidle' });
  await page.waitForTimeout(2600);
  const opened = await page.evaluate(`(() => { const vis=(${VIS}); const main=document.querySelector('main')||document.body;
    const b=[...main.querySelectorAll('button')].filter(vis).filter(e=>e.getBoundingClientRect().left>300)
      .filter(e=>['English','Russian','Uzbek','Uzbek (Cyrillic)','Русский'].includes((e.innerText||'').trim()));
    if(b.length!==1) return {n:b.length}; const was=(b[0].innerText||'').trim(); b[0].click(); return {n:1,was}; })()`);
  await page.waitForTimeout(1600);
  const picked = await page.evaluate(`(() => { const vis=(${VIS}); const WANT=${JSON.stringify(WANT)};
    const dlg=[...document.querySelectorAll('[role=dialog]')].filter(vis)
      .filter(e=>/English/.test(e.innerText||''))[0];
    if(!dlg) return {err:'no dialog'};
    const items=[...dlg.querySelectorAll('*')].filter(vis).filter(x=>!x.children.length)
      .filter(x=>(x.innerText||'').trim()===WANT);
    if(items.length!==1) return {matched:items.length};
    const c=items[0].closest('button,[role=menuitem],[role=option],li,div');
    (c||items[0]).click(); return {matched:1}; })()`);
  await page.waitForTimeout(3000);
  const after = await page.evaluate(async () => {
    const me=await (await fetch('/api/v1/auth/me',{credentials:'include'})).json();
    return { language:(me.settings||{}).language,
             localeCookie:(document.cookie.match(/NEXT_LOCALE=([^;]*)/)||[])[1]||null,
             lsLocale:localStorage.getItem('aloqa.locale') };
  });
  return { opened, picked, after, net };
};
