const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
export default async ({ page }) => {
  const W='W4QDF1XTURESO01';
  const net=[];
  page.on('response', async r => { if(r.request().method()==='GET') return;
    const u=r.url().replace(/^https?:\/\/[^/]+/,''); if(!/status/.test(u)) return;
    let b=''; try{b=(await r.text()).slice(0,120);}catch{}
    net.push(`${r.request().method()} ${u.slice(0,38)} <- ${(r.request().postData()||'').slice(0,60)} -> ${r.status()} ${b}`); });
  // A. re-click the already-selected preset
  await page.goto(`https://airion-cargo.store/w/${W}/settings/profile`, { waitUntil:'networkidle' });
  await page.waitForTimeout(2700);
  const reclick = await page.evaluate(`(() => { const vis=(${VIS}); const main=document.querySelector('main')||document.body;
    const rs=[...main.querySelectorAll('[role=radio]')].filter(vis);
    const on=rs.filter(r=>r.getAttribute('aria-checked')==='true');
    if(on.length!==1) return {err:'selected count '+on.length};
    const before=(on[0].innerText||'').replace(/\\s+/g,' ').trim();
    on[0].click();
    return { before, afterImmediate:on[0].getAttribute('aria-checked') }; })()`);
  await page.waitForTimeout(1200);
  const afterReclick = await page.evaluate(`(() => { const vis=(${VIS}); const main=document.querySelector('main')||document.body;
    return { on:[...main.querySelectorAll('[role=radio]')].filter(vis)
        .filter(r=>r.getAttribute('aria-checked')==='true').map(r=>(r.innerText||'').replace(/\\s+/g,' ').trim()),
      bar:[...document.querySelectorAll('button')].filter(vis).map(b=>(b.innerText||'').trim()).filter(t=>/^(Save|Discard)/.test(t)) }; })()`);
  // B. the profile/avatar menu in the app shell
  await page.goto(`https://airion-cargo.store/w/${W}/chat`, { waitUntil:'networkidle' });
  await page.waitForTimeout(2600);
  const opened = await page.evaluate(`(() => { const vis=(${VIS});
    const cands=[...document.querySelectorAll('button,[role=button]')].filter(vis)
      .filter(e=>{const r=e.getBoundingClientRect(); return r.top<140;});
    const out=cands.map(e=>({t:(e.innerText||'').replace(/\\s+/g,' ').trim().slice(0,24),
       al:(e.getAttribute('aria-label')||'').slice(0,40), x:Math.round(e.getBoundingClientRect().x)}));
    const av=cands.filter(e=>/avatar|profile|account|you|menu/i.test((e.getAttribute('aria-label')||'')+' '+(e.innerText||'')));
    if(av.length) { av[0].click(); return {clicked:(av[0].getAttribute('aria-label')||av[0].innerText||'').slice(0,40), topButtons:out}; }
    return { clicked:null, topButtons:out }; })()`);
  await page.waitForTimeout(1800);
  const menu = await page.evaluate(`(() => { const vis=(${VIS});
    const m=[...document.querySelectorAll('[role=menu],[role=dialog],[data-radix-popper-content-wrapper]')].filter(vis);
    return { menus:m.length,
      items:m.length?[...m[0].querySelectorAll('button,a,[role=menuitem]')].filter(vis)
        .map(e=>(e.innerText||'').replace(/\\s+/g,' ').trim().slice(0,36)).filter(Boolean):[],
      text:m.length?(m[0].innerText||'').replace(/\\s+/g,' ').slice(0,240):'' }; })()`);
  return { reclick, afterReclick, opened:{clicked:opened.clicked, topButtons:opened.topButtons.slice(0,10)}, menu, net };
};
