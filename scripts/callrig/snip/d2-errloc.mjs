const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
export default async ({ page }) => {
  const W='W4QDF1XTURESO01';
  const LANG = process.env.D2_LANG || 'ru';
  await page.goto(`https://airion-cargo.store/w/${W}/settings/account`, { waitUntil:'domcontentloaded' });
  await page.waitForTimeout(1400);
  await page.evaluate(`(async () => { await fetch('/api/v1/auth/me/language',{method:'PATCH',credentials:'include',
    headers:{'Content-Type':'application/json'},body:JSON.stringify({language:${JSON.stringify(LANG)}})}); })()`);
  const out={};
  // A. display name too long -> blur
  await page.goto(`https://airion-cargo.store/w/${W}/settings/profile`, { waitUntil:'networkidle' });
  await page.waitForTimeout(2600);
  const sel = `(() => { const vis=(${VIS}); const main=document.querySelector('main')||document.body;
    return [...main.querySelectorAll('input[type=text],input:not([type])')].filter(vis)
      .filter(e=>e.getBoundingClientRect().left>300)[0]; })`;
  await page.evaluate(`(() => { const i=${sel}(); i.focus(); i.select&&i.select(); })()`);
  await page.keyboard.type('N'.repeat(45), { delay: 3 });
  await page.waitForTimeout(600);
  await page.evaluate(`(() => { ${sel}().blur(); })()`);
  await page.waitForTimeout(1600);
  out.longName = await page.evaluate(`(() => { const vis=(${VIS}); const main=document.querySelector('main')||document.body;
    return [...main.querySelectorAll('p,span,div')].filter(vis).filter(e=>!e.children.length)
      .map(e=>(e.innerText||'').trim()).filter(x=>x&&x.length<90)
      .filter(x=>/символ|character|не больше|fewer/i.test(x)).slice(0,2); })()`);
  // B. notifications delivery-channel refusal
  await page.goto(`https://airion-cargo.store/w/${W}/settings/notifications`, { waitUntil:'networkidle' });
  await page.waitForTimeout(2600);
  await page.evaluate(`(async () => { await fetch('/api/v1/notifications/settings',{method:'PATCH',credentials:'include',
    headers:{'Content-Type':'application/json'},body:JSON.stringify({in_app_enabled:true, mute_all_channels:false})}); })()`);
  await page.reload({ waitUntil:'networkidle' }); await page.waitForTimeout(2400);
  const notices=[];
  const poll=setInterval(async()=>{ try{
    const n=await page.evaluate(`(() => { const vis=(${VIS});
      return [...document.querySelectorAll('[data-sonner-toast],[role=status],[role=alert],[class*=oast],p,span')].filter(vis)
        .map(e=>(e.innerText||'').replace(/\\s+/g,' ').trim())
        .filter(x=>x&&x.length<160&&/канал|доставк|delivery|channel|включ|enable/i.test(x)); })()`);
    for(const x of n) if(!notices.includes(x)) notices.push(x);
  }catch{} }, 300);
  await page.waitForTimeout(500);
  await page.evaluate(`(() => { const vis=(${VIS}); const main=document.querySelector('main')||document.body;
    const l=[...main.querySelectorAll('[role=switch]')].filter(vis).filter(e=>e.getBoundingClientRect().left>300);
    if(l[0]) l[0].click(); })()`);
  await page.waitForTimeout(900);
  await page.evaluate(`(() => { const vis=(${VIS});
    const b=[...document.querySelectorAll('button')].filter(vis).filter(x=>/^(Save|Сохран)/.test((x.innerText||'').trim()));
    if(b.length) b[0].click(); })()`);
  await page.waitForTimeout(4000);
  clearInterval(poll);
  out.deliveryRefusal=[...new Set(notices)].slice(0,4);
  const lang = await page.evaluate(async () => (await (await fetch('/api/v1/auth/me',{credentials:'include'})).json()).settings.language);
  return { lang, ...out };
};
