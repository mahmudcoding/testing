const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
export default async ({ browser }) => {
  const cases = [
    ['known fixture email', 'qa.d.dave@aloqa.test'],
    ['unknown email',       'qa.d.nosuchperson7c1b@aloqa.test'],
    ['malformed',           'nope@'],
  ];
  const out=[];
  for (const [label,email] of cases) {
    const ctx = await browser.newContext();
    const p = await ctx.newPage();
    const nonGet=[];
    p.on('response', async r => { if(r.request().method()==='GET') return;
      let b=''; try{b=(await r.text()).slice(0,160);}catch{}
      nonGet.push(`${r.request().method()} ${r.url().replace(/^https?:\/\/[^/]+/,'').slice(0,52)} <- ${(r.request().postData()||'').slice(0,70)} -> ${r.status()} ${b}`); });
    await p.goto('https://airion-cargo.store/login', { waitUntil:'networkidle' });
    await p.waitForTimeout(1600);
    const entered = await p.evaluate(`(() => { const vis=(${VIS});
      const a=[...document.querySelectorAll('a[href],button')].filter(vis)
        .filter(e=>/magic link/i.test(e.innerText||''));
      if(!a.length) return {err:'no magic-link control'};
      a[0].click(); return {clicked:(a[0].innerText||'').trim()}; })()`);
    await p.waitForTimeout(2200);
    const form = await p.evaluate(`(() => { const vis=(${VIS});
      return { url:location.pathname,
        controls:[...document.querySelectorAll('input,button,a[href]')].filter(vis)
          .map(e=>({tag:e.tagName.toLowerCase(),name:e.getAttribute('name')||'',type:e.getAttribute('type')||'',
                    t:(e.innerText||'').trim().slice(0,34)})),
        text:(document.body.innerText||'').replace(/\\s+/g,' ').slice(0,260) }; })()`);
    let after=null;
    if (!form.controls.some(c=>c.name==='email')) { out.push({label, entered, form, after:'(no email field)'}); await ctx.close(); continue; }
    await p.fill('input[name="email"]', email).catch(()=>{});
    await p.waitForTimeout(300);
    await p.evaluate(`(() => { const vis=(${VIS});
      const b=[...document.querySelectorAll('button[type=submit]')].filter(vis); if(b.length) b[0].click(); })()`);
    await p.waitForTimeout(4000);
    after = await p.evaluate(`(() => ({url:location.pathname, text:(document.body.innerText||'').replace(/\\s+/g,' ').slice(0,240)}))()`);
    out.push({ label, entered, form:{url:form.url, controls:form.controls.map(c=>c.t||c.name||c.type)}, after, nonGet });
    await ctx.close();
  }
  return out;
};
