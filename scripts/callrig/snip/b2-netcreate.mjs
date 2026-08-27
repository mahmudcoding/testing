export default async ({page}) => {
  const hits=[];
  const onResp = async (resp) => {
    const u=resp.url();
    if(!/\/api\/v1\/(meeting|meetings)(\b|\/|\?)/.test(u)) return;
    const req=resp.request();
    if(req.method()==='GET') return;
    let body=null; try{ body=(await resp.text()).slice(0,400);}catch(e){ body='<unreadable>'; }
    let post=null; try{ post=req.postData(); }catch(e){}
    hits.push({url:u.replace(/^https?:\/\/[^/]+/,''), method:req.method(), status:resp.status(),
               post: post?post.slice(0,300):null, resp: body});
  };
  page.on('response', onResp);
  const V=`el => { let n=el, op=1; while(n && n!==document.documentElement){ const c=getComputedStyle(n); if(c.display==='none'||c.visibility==='hidden') return false; op*=parseFloat(c.opacity||'1'); n=n.parentElement; } const r=el.getBoundingClientRect(); return op>0.05 && r.width>0 && r.height>0; }`;
  await page.evaluate((v)=>{ const vis=eval(v);
    const b=[...document.querySelectorAll('button')].filter(vis).find(x=>(x.getAttribute('data-testid')||'')==='calls-start-submit');
    if(b && !b.disabled) b.click(); }, V);
  await page.waitForTimeout(9000);
  page.off('response', onResp);
  const err = await page.evaluate(()=>{
    const e=document.querySelector('[data-testid="calls-start-submit-error"]');
    return e?(e.innerText||'').replace(/\s+/g,' ').trim():null; });
  return {hits, err, url: page.url()};
};
