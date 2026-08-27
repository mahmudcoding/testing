export default async ({page}) => {
  const hits=[]; const fails=[];
  const onResp = async (resp) => {
    const u=resp.url();
    if(!/\/api\//.test(u)) return;
    const req=resp.request();
    let body=null; try{ body=(await resp.text()).slice(0,300);}catch(e){ body='<unreadable>'; }
    hits.push({u:u.replace(/^https?:\/\/[^/]+/,''), m:req.method(), s:resp.status(),
               post:(req.postData()||'').slice(0,200), resp: resp.status()>=400?body:body.slice(0,120)});
  };
  const onFail = (req) => { if(/\/api\//.test(req.url())) fails.push({u:req.url().replace(/^https?:\/\/[^/]+/,''), m:req.method(), err:String(req.failure()&&req.failure().errorText)}); };
  page.on('response', onResp); page.on('requestfailed', onFail);
  const V=`el => { let n=el, op=1; while(n && n!==document.documentElement){ const c=getComputedStyle(n); if(c.display==='none'||c.visibility==='hidden') return false; op*=parseFloat(c.opacity||'1'); n=n.parentElement; } const r=el.getBoundingClientRect(); return op>0.05 && r.width>0 && r.height>0; }`;
  await page.evaluate((v)=>{ const vis=eval(v);
    const b=[...document.querySelectorAll('button')].filter(vis).find(x=>(x.getAttribute('data-testid')||'')==='calls-start-submit');
    if(b && !b.disabled) b.click(); }, V);
  await page.waitForTimeout(11000);
  page.off('response', onResp); page.off('requestfailed', onFail);
  const err = await page.evaluate(()=>{
    const e=document.querySelector('[data-testid="calls-start-submit-error"]');
    return e?(e.innerText||'').replace(/\s+/g,' ').trim():null; });
  return {n:hits.length, bad: hits.filter(h=>h.s>=400), all: hits.map(h=>`${h.s} ${h.m} ${h.u}`), fails, err};
};
