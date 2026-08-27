export default async ({page}) => {
  const hits=[];
  const onResp = async (resp) => {
    const u=resp.url(); if(!/\/api\//.test(u)) return;
    const req=resp.request(); if(req.method()==='GET' && resp.status()<400) return;
    let b=null; try{ b=(await resp.text()).slice(0,260);}catch(e){}
    hits.push({u:u.replace(/^https?:\/\/[^/]+/,''), m:req.method(), s:resp.status(), resp:b});
  };
  page.on('response', onResp);
  const V=`el => { let n=el, op=1; while(n && n!==document.documentElement){ const c=getComputedStyle(n); if(c.display==='none'||c.visibility==='hidden') return false; op*=parseFloat(c.opacity||'1'); n=n.parentElement; } const r=el.getBoundingClientRect(); return op>0.05 && r.width>0 && r.height>0; }`;
  const clicked = await page.evaluate((v)=>{ const vis=eval(v);
    const b=[...document.querySelectorAll('button')].filter(vis).find(x=>/^Join$/i.test((x.innerText||'').trim()));
    if(b && !b.disabled){ b.click(); return true; } return {dis:b?b.disabled:'notfound'}; }, V);
  await page.waitForTimeout(10000);
  page.off('response', onResp);
  const after = await page.evaluate((v)=>{ const vis=eval(v);
    const s=document.querySelector('[data-testid="call-surface"]');
    return {url:location.href, inCall:!!s, title:s?(s.innerText||'').split('\n')[0]:null,
      notices:[...new Set([...document.querySelectorAll('[data-sonner-toast],[role=status],[role=alert]')].filter(vis).map(e=>(e.innerText||'').replace(/\s+/g,' ').trim().slice(0,140)).filter(Boolean))],
      body:(document.querySelector('main')||document.body).innerText.replace(/\n+/g,' | ').slice(0,220)}; }, V);
  return {clicked, badHits: hits.filter(h=>h.s>=400), allHits: hits.map(h=>`${h.s} ${h.m} ${h.u}`), after};
};
