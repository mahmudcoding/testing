const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
export default async ({ page }) => {
  const W='W4QDF1XTURESO01';
  const net=[];
  page.on('response', async r => { if(r.request().method()==='GET') return;
    const u=r.url().replace(/^https?:\/\/[^/]+/,''); if(!/\/api\/v1\//.test(u)) return;
    let b=''; try{b=(await r.text()).slice(0,140);}catch{}
    net.push(`${r.request().method()} ${u.slice(0,40)} <- ${(r.request().postData()||'').slice(0,60)} -> ${r.status()} ${b.replace(/\s+/g,' ')}`); });
  await page.goto(`https://airion-cargo.store/w/${W}/settings/admin/workspaces`, { waitUntil:'networkidle' });
  await page.waitForTimeout(2800);
  const clicked = await page.evaluate(`(() => { const vis=(${VIS});
    const b=[...document.querySelectorAll('button')].filter(vis).filter(x=>/^Edit /.test(((x.innerText||'').trim()||x.getAttribute('aria-label')||'')));
    if(b.length!==1) return {n:b.length, saw:[...document.querySelectorAll('button')].filter(vis)
      .map(e=>((e.innerText||'').trim()||e.getAttribute('aria-label')||'')).filter(Boolean).slice(0,14)};
    const t=((b[0].innerText||'').trim()||b[0].getAttribute('aria-label')||''); b[0].click(); return {n:1,label:t}; })()`);
  await page.waitForTimeout(2400);
  const dialog = await page.evaluate(`(() => { const vis=(${VIS});
    const d=[...document.querySelectorAll('[role=dialog]')].filter(vis)[0];
    if(!d) return {dialogs:0, pageText:((document.querySelector('main')||document.body).innerText||'').replace(/\\s+/g,' ').slice(0,240)};
    return { dialogs:1, text:(d.innerText||'').replace(/\\s+/g,' ').trim().slice(0,260),
      fields:[...d.querySelectorAll('input,textarea')].filter(vis)
        .map(e=>({v:String(e.value||'').slice(0,26), ph:e.getAttribute('placeholder')||'', maxlen:e.getAttribute('maxlength')||''})),
      buttons:[...d.querySelectorAll('button')].filter(vis)
        .map(e=>({t:(e.innerText||'').trim().slice(0,24), dis:e.disabled===true||e.getAttribute('aria-disabled')==='true'})) }; })()`);
  // cancel without changing anything
  const closed = await page.evaluate(`(() => { const vis=(${VIS});
    const d=[...document.querySelectorAll('[role=dialog]')].filter(vis)[0];
    if(!d) return {n:0};
    const b=[...d.querySelectorAll('button')].filter(vis).filter(x=>/^(Cancel|Close)/.test((x.innerText||'').trim()));
    if(b.length) { b[0].click(); return {n:1}; } return {n:0}; })()`);
  await page.waitForTimeout(1600);
  const after = await page.evaluate(`(() => { const vis=(${VIS});
    return { dialogs:[...document.querySelectorAll('[role=dialog]')].filter(vis).length }; })()`);
  return { clicked, dialog, closed, after, net };
};
