const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
export default async ({ page }) => {
  const W='W4QDF1XTURESO01';
  const VAL = process.env.D2_NAME;
  const net=[];
  page.on('response', async r => { if(r.request().method()==='GET') return;
    const u=r.url().replace(/^https?:\/\/[^/]+/,''); if(!/\/api\/v1\//.test(u)) return;
    let b=''; try{b=(await r.text()).slice(0,120);}catch{}
    net.push(`${r.request().method()} ${u.slice(0,36)} -> ${r.status()} ${b.replace(/\s+/g,' ')}`); });
  await page.goto(`https://airion-cargo.store/w/${W}/settings/profile`, { waitUntil:'networkidle' });
  await page.waitForTimeout(2600);
  const setRes = await page.evaluate(`(() => { const vis=(${VIS}); const main=document.querySelector('main')||document.body;
    const i=[...main.querySelectorAll('input')].filter(vis)[0];
    if(!i) return {err:'no name field'};
    const was=i.value; const maxlen=i.getAttribute('maxlength')||'';
    const setter=Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype,'value').set;
    setter.call(i, ${JSON.stringify(process.env.D2_NAME||'')});
    i.dispatchEvent(new Event('input',{bubbles:true})); i.dispatchEvent(new Event('change',{bubbles:true}));
    return { was, maxlen, now:i.value, nowLen:i.value.length }; })()`);
  if (setRes.err) return setRes;
  await page.waitForTimeout(900);
  const bar = await page.evaluate(`(() => { const vis=(${VIS});
    return [...document.querySelectorAll('button')].filter(vis).map(b=>(b.innerText||'').trim()).filter(t=>/^(Save|Discard)/.test(t)); })()`);
  let saved=false;
  if (bar.some(t=>/^Save/.test(t))) {
    await page.evaluate(`(() => { const vis=(${VIS});
      const b=[...document.querySelectorAll('button')].filter(vis).filter(x=>/^Save/.test((x.innerText||'').trim())); if(b.length) b[0].click(); })()`);
    await page.waitForTimeout(2800); saved=true;
  }
  const notices = await page.evaluate(`(() => { const vis=(${VIS});
    return [...document.querySelectorAll('[data-sonner-toast],[role=status],[role=alert],[class*=oast]')].filter(vis)
      .map(e=>(e.innerText||'').replace(/\\s+/g,' ').trim()).filter(Boolean).slice(0,3); })()`);
  const stored = await page.evaluate(async () => {
    const me=await (await fetch('/api/v1/auth/me',{credentials:'include'})).json();
    return { name: me.name || (me.user&&me.user.name), len:(me.name||'').length }; });
  // render check in Directories
  await page.goto(`https://airion-cargo.store/w/${W}/directories?tab=people`, { waitUntil:'networkidle' });
  await page.waitForTimeout(2800);
  const render = await page.evaluate(`(() => { const vis=(${VIS});
    const main=document.querySelector('main')||document.body;
    const leaves=[...main.querySelectorAll('*')].filter(e=>!e.children.length).filter(vis);
    const clipped=leaves.filter(e=>e.scrollWidth>e.clientWidth+1)
      .map(e=>({t:(e.innerText||'').trim().slice(0,30), sw:e.scrollWidth, cw:e.clientWidth}));
    const spill=[...main.querySelectorAll('*')].filter(vis)
      .filter(e=>e.getBoundingClientRect().right>innerWidth+2).length;
    return { clippedCount:clipped.length, clipped:clipped.slice(0,5), spillPastViewport:spill,
             pageScrollsSideways: document.documentElement.scrollWidth>document.documentElement.clientWidth,
             sample:(main.innerText||'').replace(/\\s+/g,' ').slice(0,150) }; })()`);
  return { setRes, saveBar:bar, saved, notices, stored, render, net:net.slice(0,4) };
};
