const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
export default async ({ browser }) => {
  const W='W4QDF1XTURESO01';
  const EMAIL = process.env.D2_EMAIL || 'qa.d.guest@aloqa.test';
  const ctx = await browser.newContext();
  const p = await ctx.newPage();
  await p.goto('https://airion-cargo.store/login', { waitUntil:'networkidle' });
  await p.waitForTimeout(1400);
  await p.fill('input[name="email"]', EMAIL);
  await p.fill('input[name="password"]', 'QaPass123!');
  await p.evaluate(() => { const b=[...document.querySelectorAll('button[type=submit]')]; if(b.length) b[0].click(); });
  await p.waitForTimeout(6500);
  const out={};
  for (const path of ['workspace','company']) {
    await p.goto(`https://airion-cargo.store/w/${W}/settings/${path}`, { waitUntil:'networkidle' });
    await p.waitForTimeout(2600);
    out[path] = await p.evaluate(`(() => { const vis=(${VIS}); const main=document.querySelector('main')||document.body;
      const t=(main.innerText||'').replace(/\\s+/g,' '); const i=t.lastIndexOf('›');
      return { body:(i>=0?t.slice(i+1):t).trim().slice(0,320),
        controls:[...main.querySelectorAll('button,input,select,textarea,a[href]')].filter(vis)
          .filter(e=>e.getBoundingClientRect().left>300)
          .map(e=>({tag:e.tagName.toLowerCase(), t:(e.innerText||'').trim().slice(0,30),
                    val:String(e.value||'').slice(0,26), ro:e.readOnly===true,
                    dis:e.disabled===true||e.getAttribute('aria-disabled')==='true'})) }; })()`);
  }
  // can the guest actually change the workspace name via API?
  const api = await p.evaluate(async () => {
    const W='W4QDF1XTURESO01';
    const r=await fetch(`/api/v1/workspaces/${W}`,{method:'PATCH',credentials:'include',
      headers:{'Content-Type':'application/json'},body:JSON.stringify({name:'QA Workspace D'})});
    return { patchSameName:{s:r.status, b:(await r.text()).slice(0,140)} };
  });
  await ctx.close();
  return { ...out, api };
};
