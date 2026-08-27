export default async ({page}) => {
  const TARGET=process.env.QA_TARGETNAME||'QA endurance';
  const hits=[];
  const onResp = async (resp) => {
    const u=resp.url(); if(!/\/api\//.test(u)) return;
    const req=resp.request(); if(req.method()==='GET' && resp.status()<400) return;
    let b=null; try{ b=(await resp.text()).slice(0,240);}catch(e){}
    hits.push({u:u.replace(/^https?:\/\/[^/]+/,''), m:req.method(), s:resp.status(), resp:b});
  };
  page.on('response', onResp);
  const V=`el => { let n=el, op=1; while(n && n!==document.documentElement){ const c=getComputedStyle(n); if(c.display==='none'||c.visibility==='hidden') return false; op*=parseFloat(c.opacity||'1'); n=n.parentElement; } const r=el.getBoundingClientRect(); return op>0.05 && r.width>0 && r.height>0; }`;
  const clicked = await page.evaluate(({v,t})=>{ const vis=eval(v);
    const joins=[...document.querySelectorAll('button')].filter(vis).filter(b=>/^Join$/i.test((b.innerText||'').trim()));
    for(const b of joins){
      let card=b;
      for(let k=0;k<6&&card.parentElement;k++){ card=card.parentElement; const txt=(card.innerText||''); if(txt.includes('LIVE')&&txt.length<300) break; }
      const txt=(card.innerText||'');
      if(txt.includes(t)){ b.click(); return {clicked: txt.replace(/\s+/g,' ').trim().slice(0,80)}; }
    }
    return {candidates: joins.map(b=>{ let c=b; for(let k=0;k<6&&c.parentElement;k++){ c=c.parentElement; if((c.innerText||'').includes('LIVE')) break; } return (c.innerText||'').replace(/\s+/g,' ').trim().slice(0,60); })};
  }, {v:V, t:TARGET});
  await page.waitForTimeout(9000);
  page.off('response', onResp);
  const after = await page.evaluate((v)=>{ const vis=eval(v);
    return {url:location.href,
      notices:[...new Set([...document.querySelectorAll('[data-sonner-toast],[role=status],[role=alert]')].filter(vis).map(e=>(e.innerText||'').replace(/\s+/g,' ').trim().slice(0,130)).filter(Boolean))],
      inCallTitle:(()=>{const s=document.querySelector('[data-testid="call-surface"]'); return s?(s.innerText||'').split('\n')[0]:null;})(),
      bodyTail:(document.querySelector('main')||document.body).innerText.replace(/\n+/g,' | ').slice(0,200)}; }, V);
  return {clicked, hits, after};
};
