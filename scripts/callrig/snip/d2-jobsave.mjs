const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
export default async ({ page }) => {
  const W='W4QDF1XTURESO01';
  const net=[];
  page.on('response', async r => { if(r.request().method()==='GET') return;
    const u=r.url().replace(/^https?:\/\/[^/]+/,''); if(!/\/api\/v1\//.test(u)) return;
    let b=''; try{b=(await r.text()).slice(0,150);}catch{}
    net.push(`${r.request().method()} ${u.slice(0,34)} -> ${r.status()} ${b.replace(/\s+/g,' ')}`); });
  // 1. long Job title through the UI
  await page.goto(`https://airion-cargo.store/w/${W}/settings/profile`, { waitUntil:'networkidle' });
  await page.waitForTimeout(2500);
  await page.evaluate(`(() => { const vis=(${VIS}); const main=document.querySelector('main')||document.body;
    const ins=[...main.querySelectorAll('input[type=text],input:not([type])')].filter(vis)
      .filter(e=>e.getBoundingClientRect().left>300);
    const setter=Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype,'value').set;
    setter.call(ins[1], 'J'.repeat(200)); ins[1].dispatchEvent(new Event('input',{bubbles:true}));
    ins[1].dispatchEvent(new Event('change',{bubbles:true})); })()`);
  await page.waitForTimeout(900);
  net.length=0;
  await page.evaluate(`(() => { const vis=(${VIS});
    const b=[...document.querySelectorAll('button')].filter(vis).filter(x=>/^Save/.test((x.innerText||'').trim()));
    if(b.length) b[0].click(); })()`);
  await page.waitForTimeout(3000);
  const jobResult = { requests:[...net], stored: await page.evaluate(async () => {
    const me=await (await fetch('/api/v1/auth/me',{credentials:'include'})).json();
    const p=(me.settings||{}).profile||{}; return { jobTitleLen:(p.jobTitle||'').length }; }) };
  // 2. phone thresholds
  await page.goto(`https://airion-cargo.store/w/${W}/settings/account`, { waitUntil:'networkidle' });
  await page.waitForTimeout(2500);
  const phone={};
  for (const n of [10,20,32,33,40,64]) {
    await page.evaluate(`(() => { const vis=(${VIS}); const main=document.querySelector('main')||document.body;
      const ins=[...main.querySelectorAll('input[type=text],input:not([type])')].filter(vis)
        .filter(e=>e.getBoundingClientRect().left>300);
      const setter=Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype,'value').set;
      setter.call(ins[0], '1'.repeat(${n})); ins[0].dispatchEvent(new Event('input',{bubbles:true}));
      ins[0].dispatchEvent(new Event('change',{bubbles:true})); })()`);
    await page.waitForTimeout(450);
    phone[n] = await page.evaluate(`(() => { const vis=(${VIS});
      const s=[...document.querySelectorAll('button')].filter(vis).filter(b=>/^Save/.test((b.innerText||'').trim()))[0];
      return s?(s.disabled===true||s.getAttribute('aria-disabled')==='true'):null; })()`);
  }
  return { jobResult, phoneSaveDisabledByLength:phone };
};
