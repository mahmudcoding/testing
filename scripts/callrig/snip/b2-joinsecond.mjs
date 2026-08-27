export default async ({page}) => {
  const WS='W4QBF1XTURESO01', TARGET=process.env.QA_TARGETNAME||'QA endurance';
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
    const body=document.querySelector('[data-testid="calls-hub-body"]')||document.querySelector('main');
    const live=[...body.querySelectorAll('section')].find(s=>/Live now/.test((s.innerText||'').slice(0,30)));
    if(!live) return {noLive:true};
    // find the card mentioning the target call and click its Join
    const cards=[...live.querySelectorAll('div')].filter(e=>vis(e) && (e.innerText||'').includes(t) && (e.innerText||'').length<300);
    for(const c of cards.reverse()){
      const b=[...c.querySelectorAll('button')].filter(vis).find(x=>/^Join$/i.test((x.innerText||'').trim()));
      if(b){ b.click(); return {clicked:(c.innerText||'').replace(/\s+/g,' ').trim().slice(0,70)}; }
    }
    return {noJoin: cards.length}; }, {v:V, t:TARGET});
  await page.waitForTimeout(9000);
  page.off('response', onResp);
  const after = await page.evaluate((v)=>{ const vis=eval(v);
    return {url:location.href,
      notices:[...new Set([...document.querySelectorAll('[data-sonner-toast],[role=status],[role=alert]')].filter(vis).map(e=>(e.innerText||'').replace(/\s+/g,' ').trim().slice(0,120)).filter(Boolean))],
      inCallTitle:(()=>{const s=document.querySelector('[data-testid="call-surface"]'); return s?(s.innerText||'').split('\n')[0]:null;})()}; }, V);
  return {clicked, hits, after};
};
