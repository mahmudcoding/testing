export default async ({page}) => {
  const WS='W4QBF1XTURESO01', WHO=process.env.QA_WHO||'QA Bob';
  await page.goto(`https://airion-cargo.store/w/${WS}/directories?tab=people`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4500);
  const hits=[];
  const onResp = async (resp) => {
    const u=resp.url(); if(!/\/api\//.test(u)) return;
    const req=resp.request(); if(req.method()==='GET' && resp.status()<400) return;
    let b=null; try{ b=(await resp.text()).slice(0,260);}catch(e){}
    hits.push({u:u.replace(/^https?:\/\/[^/]+/,''), m:req.method(), s:resp.status(), post:(req.postData()||'').slice(0,160), resp:b});
  };
  page.on('response', onResp);
  const V=`el => { let n=el, op=1; while(n && n!==document.documentElement){ const c=getComputedStyle(n); if(c.display==='none'||c.visibility==='hidden') return false; op*=parseFloat(c.opacity||'1'); n=n.parentElement; } const r=el.getBoundingClientRect(); return op>0.05 && r.width>0 && r.height>0; }`;
  await page.evaluate(({v,who})=>{ const vis=eval(v);
    const rows=[...document.querySelectorAll('li,tr,div')].filter(e=>vis(e) && (e.innerText||'').includes(who) && (e.innerText||'').length<200 && [...e.querySelectorAll('button')].some(b=>/^Call$/.test((b.innerText||'').trim())));
    const row=rows[rows.length-1];
    if(row){ const cb=[...row.querySelectorAll('button')].filter(vis).find(b=>/^Call$/.test((b.innerText||'').trim())); if(cb) cb.click(); }
  }, {v:V, who:WHO});
  await page.waitForTimeout(9000);
  page.off('response', onResp);
  const after = await page.evaluate((v)=>{ const vis=eval(v);
    return {url:location.href,
      notices:[...new Set([...document.querySelectorAll('[data-sonner-toast],[role=status],[role=alert],[class*=toast]')].filter(vis).map(e=>(e.innerText||'').replace(/\s+/g,' ').trim().slice(0,110)).filter(Boolean))],
      outgoing: !!document.querySelector('[data-testid="outgoing-call-surface"]')}; }, V);
  return {hits, after};
};
