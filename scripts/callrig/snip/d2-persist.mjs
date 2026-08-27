const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
const SW = `(() => { const vis=(VISFN); const main=document.querySelector('main')||document.body;
  return [...main.querySelectorAll('[role=switch]')].filter(vis).filter(e=>e.getBoundingClientRect().left>300); })`;
export default async ({ page }) => {
  const W='W4QDF1XTURESO01';
  const PATH = process.env.D2_PATH || 'notifications';
  const IDX  = Number(process.env.D2_IDX || 0);
  const sw = SW.replace('VISFN', VIS);
  const reqs=[];
  page.on('response', async r => { const m=r.request().method(); if(m==='GET') return;
    const u=r.url().replace(/^https?:\/\/[^/]+/,''); if(!/\/api\/v1\//.test(u)) return;
    let body=''; try{ body=r.request().postData()||''; }catch{}
    reqs.push(`${m} ${u.slice(0,52)} <- ${body.slice(0,90)} -> ${r.status()}`); });
  const load = async () => { await page.goto(`https://airion-cargo.store/w/${W}/settings/${PATH}`,{waitUntil:'networkidle'}); await page.waitForTimeout(2500); };
  await load();
  const read = () => page.evaluate(`(() => { const list=${sw}();
    return list.map(e=>e.getAttribute('aria-checked')); })()`);
  const before = await read();
  if (IDX >= before.length) return { err:'index out of range', n:before.length };
  const label = await page.evaluate(`(() => { const list=${sw}(); const e=list[${IDX}];
    let n=e,best=''; for(let i=0;i<6&&n;i++){ n=n.parentElement; if(!n)break;
      const t=(n.innerText||'').replace(/\\s+/g,' ').trim(); if(t.length>3&&t.length<160){best=t;break;} }
    return { label:best, aria:e.getAttribute('aria-label')||'', id:e.id||'', tid:e.getAttribute('data-testid')||'' }; })()`);
  reqs.length=0;
  await page.evaluate(`(() => { const list=${sw}(); list[${IDX}].click(); })()`);
  await page.waitForTimeout(1600);
  const afterClick = await read();
  // save bar?
  const saveBar = await page.evaluate(`(() => { const vis=(${VIS});
    return [...document.querySelectorAll('button')].filter(vis)
      .filter(b=>/^(Save|Save changes|Save preferences|Save profile|Discard)$/.test((b.innerText||'').trim()))
      .map(b=>(b.innerText||'').trim()); })()`);
  if (saveBar.some(t=>/^Save/.test(t))) {
    await page.evaluate(`(() => { const vis=(${VIS});
      const b=[...document.querySelectorAll('button')].filter(vis).filter(x=>/^Save/.test((x.innerText||'').trim()));
      if(b.length) b[0].click(); })()`);
    await page.waitForTimeout(2000);
  }
  const reqsAfter=[...reqs];
  await load();
  const afterReload = await read();
  return { path:PATH, idx:IDX, control:label,
           before, afterClick, afterReload,
           changedOnScreen: before[IDX]!==afterClick[IDX],
           persisted: afterReload[IDX]===afterClick[IDX],
           saveBar, requests:reqsAfter.slice(0,6) };
};
