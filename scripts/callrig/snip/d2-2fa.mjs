const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
export default async ({ page }) => {
  const W='W4QDF1XTURESO01';
  const net=[];
  page.on('response', async r => { if(r.request().method()==='GET') return;
    const u=r.url().replace(/^https?:\/\/[^/]+/,''); if(!/\/api\/v1\//.test(u)) return;
    let b=''; try{b=(await r.text()).slice(0,220);}catch{}
    net.push(`${r.request().method()} ${u.slice(0,44)} -> ${r.status()} ${b.replace(/\s+/g,' ')}`); });
  await page.goto(`https://airion-cargo.store/w/${W}/settings/security`, { waitUntil:'networkidle' });
  await page.waitForTimeout(2600);
  const before = await page.evaluate(`(() => { const vis=(${VIS}); const main=document.querySelector('main')||document.body;
    const t=(main.innerText||'').replace(/\\s+/g,' '); const i=t.lastIndexOf('›');
    return (i>=0?t.slice(i+1):t).trim().slice(0,300); })()`);
  const clicked = await page.evaluate(`(() => { const vis=(${VIS}); const main=document.querySelector('main')||document.body;
    const b=[...main.querySelectorAll('button')].filter(vis).filter(e=>e.getBoundingClientRect().left>300)
      .filter(e=>/^Enable$/.test((e.innerText||'').trim()));
    if(b.length!==1) return {n:b.length}; b[0].click(); return {n:1}; })()`);
  await page.waitForTimeout(3400);
  const after = await page.evaluate(`(() => { const vis=(${VIS});
    const dlg=[...document.querySelectorAll('[role=dialog]')].filter(vis);
    const d=dlg[0];
    const body=(document.body.innerText||'').replace(/\\s+/g,' ');
    return { dialogs:dlg.length,
      dialogText: d?(d.innerText||'').replace(/\\s+/g,' ').trim().slice(0,420):'(none)',
      dialogControls: d?[...d.querySelectorAll('button,input')].filter(vis)
        .map(e=>({tag:e.tagName.toLowerCase(), t:(e.innerText||'').trim().slice(0,26),
                  ph:e.getAttribute('placeholder')||'', type:e.getAttribute('type')||''})):[],
      hasQR: !!document.querySelector('svg[class*=qr],canvas,img[src^="data:image"]'),
      mentionsEmail:/email|e-mail/i.test(body), mentionsApp:/authenticator|authentication app|scan/i.test(body) }; })()`);
  return { before, clicked, after, net };
};
