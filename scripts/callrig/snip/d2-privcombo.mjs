const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
const CB = `(() => { const vis=(VISFN); const main=document.querySelector('main')||document.body;
  return [...main.querySelectorAll('[role=combobox]')].filter(vis).filter(e=>e.getBoundingClientRect().left>300); })`;
export default async ({ page }) => {
  const W='W4QDF1XTURESO01';
  const cb = CB.replace('VISFN', VIS);
  const net=[];
  page.on('response', async r => { if(r.request().method()==='GET') return;
    const u=r.url().replace(/^https?:\/\/[^/]+/,''); if(!/\/api\/v1\//.test(u)) return;
    let b=''; try{b=r.request().postData()||'';}catch{}
    net.push(`${r.request().method()} ${u.slice(0,44)} <- ${b.slice(0,80)} -> ${r.status()}`); });
  const load=async()=>{ await page.goto(`https://airion-cargo.store/w/${W}/settings/privacy`,{waitUntil:'networkidle'}); await page.waitForTimeout(2600); };
  await load();
  // label each combobox by the nearest heading text above it
  const labels = await page.evaluate(`(() => { const vis=(${VIS}); const list=${cb}();
    return list.map(e=>{ let n=e,best='';
      for(let i=0;i<6&&n;i++){ n=n.parentElement; if(!n)break;
        const t=(n.innerText||'').replace(/\\s+/g,' ').trim();
        if(t.length>4&&t.length<140){best=t;break;} }
      return { label:best, value:(e.innerText||'').trim() }; }); })()`);
  const results=[];
  for (let i=0;i<labels.length;i++){
    await load();
    const before = await page.evaluate(`(() => ${cb}()[${i}].innerText.trim())()`);
    await page.evaluate(`(() => { ${cb}()[${i}].click(); })()`);
    await page.waitForTimeout(900);
    const opts = await page.evaluate(`(() => { const vis=(${VIS});
      return [...document.querySelectorAll('[role=option]')].filter(vis).map(o=>(o.innerText||'').trim()); })()`);
    const target = opts.find(o=>o && o!==before);
    if (!target){ results.push({i, label:labels[i].label.slice(0,70), before, opts, err:'no alternative option' }); continue; }
    net.length=0;
    await page.evaluate(`(() => { const vis=(${VIS});
      const o=[...document.querySelectorAll('[role=option]')].filter(vis).filter(x=>(x.innerText||'').trim()===${JSON.stringify('')}||true)
        .filter(x=>(x.innerText||'').trim()!==${JSON.stringify('')});
      const hit=[...document.querySelectorAll('[role=option]')].filter(vis).filter(x=>(x.innerText||'').trim()===TARGET);
      if(hit.length) hit[0].click(); })()`.replace('TARGET', JSON.stringify(target)));
    await page.waitForTimeout(1200);
    const afterSelect = await page.evaluate(`(() => ${cb}()[${i}].innerText.trim())()`);
    const bar = await page.evaluate(`(() => { const vis=(${VIS});
      return [...document.querySelectorAll('button')].filter(vis).map(b=>(b.innerText||'').trim())
        .filter(t=>/^(Save|Discard)/.test(t)); })()`);
    if (bar.some(t=>/^Save/.test(t))) {
      await page.evaluate(`(() => { const vis=(${VIS});
        const b=[...document.querySelectorAll('button')].filter(vis).filter(x=>/^Save/.test((x.innerText||'').trim()));
        if(b.length) b[0].click(); })()`);
      await page.waitForTimeout(2400);
    }
    const sent=[...net];
    await load();
    const afterReload = await page.evaluate(`(() => ${cb}()[${i}].innerText.trim())()`);
    results.push({ i, label:labels[i].label.slice(0,70), options:opts, before, target,
                   afterSelect, saveBar:bar, afterReload,
                   persisted: afterReload===target, requests:sent.slice(0,4) });
  }
  return { count:labels.length, results };
};
