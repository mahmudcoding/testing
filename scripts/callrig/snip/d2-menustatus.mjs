const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
export default async ({ page }) => {
  const W='W4QDF1XTURESO01';
  const net=[];
  page.on('response', async r => { if(r.request().method()==='GET') return;
    const u=r.url().replace(/^https?:\/\/[^/]+/,''); if(!/status/.test(u)) return;
    let b=''; try{b=(await r.text()).slice(0,130);}catch{}
    net.push(`${r.request().method()} ${u.slice(0,36)} <- ${(r.request().postData()||'').slice(0,60)} -> ${r.status()} ${b}`); });
  const stat=()=>page.evaluate(async()=>(await (await fetch('/api/v1/users/U4QDALICE000001/status',{credentials:'include'})).text()).slice(0,110));
  await page.goto(`https://airion-cargo.store/w/${W}/chat`, { waitUntil:'networkidle' });
  await page.waitForTimeout(2600);
  const before = await stat();
  const openMenu = async () => { await page.evaluate(`(() => { const vis=(${VIS});
      const b=[...document.querySelectorAll('button,[role=button]')].filter(vis)
        .filter(e=>(e.getAttribute('aria-label')||'')==='Profile'); if(b.length) b[0].click(); })()`);
    await page.waitForTimeout(1800); };
  await openMenu();
  const pick = await page.evaluate(`(() => { const vis=(${VIS});
    const c=[...document.querySelectorAll('[role=menuitemradio],[role=menuitem],button')].filter(vis)
      .filter(e=>(e.getAttribute('aria-label')||'')==='Commuting');
    if(c.length!==1) return {n:c.length}; c[0].click(); return {n:1}; })()`);
  await page.waitForTimeout(3000);
  const afterPick = { net:[...net], server: await stat() };
  // does Settings -> Profile agree?
  await page.goto(`https://airion-cargo.store/w/${W}/settings/profile`, { waitUntil:'networkidle' });
  await page.waitForTimeout(2700);
  const settingsView = await page.evaluate(`(() => { const vis=(${VIS}); const main=document.querySelector('main')||document.body;
    const ins=[...main.querySelectorAll('input')].filter(vis);
    return { selected:[...main.querySelectorAll('[role=radio]')].filter(vis)
        .filter(r=>r.getAttribute('aria-checked')==='true').map(r=>(r.innerText||'').replace(/\\s+/g,' ').trim()),
      statusField:ins[ins.length-1].value }; })()`);
  // clear again from the menu if it offers a way
  await page.goto(`https://airion-cargo.store/w/${W}/chat`, { waitUntil:'networkidle' });
  await page.waitForTimeout(2400);
  await openMenu();
  const menuNow = await page.evaluate(`(() => { const vis=(${VIS});
    const m=[...document.querySelectorAll('[role=menu],[data-radix-popper-content-wrapper]')].filter(vis)
      .sort((a,b)=>(b.innerText||'').length-(a.innerText||'').length)[0];
    if(!m) return {none:true};
    return { items:[...m.querySelectorAll('button,a,[role=menuitem],[role=menuitemradio]')].filter(vis)
        .map(e=>({t:(e.innerText||'').replace(/\\s+/g,' ').trim().slice(0,34),
                  checked:e.getAttribute('aria-checked')||''})),
      text:(m.innerText||'').replace(/\\s+/g,' ').slice(0,200) }; })()`);
  return { before, pick, afterPick, settingsView, menuNow };
};
