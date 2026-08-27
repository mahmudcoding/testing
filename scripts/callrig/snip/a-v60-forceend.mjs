export default async ({ page }) => {
  const out = await page.evaluate(async()=>{
    const id=location.pathname.split('/call/')[1];
    const tries=[['POST','/api/v1/meeting/'+id+'/cancel'],['POST','/api/v1/meeting/'+id+'/end'],
                 ['POST','/api/v1/meetings/'+id+'/cancel']];
    const res=[];
    for(const [m,u] of tries){
      try{ const r=await fetch(u,{method:m,credentials:'include',headers:{'content-type':'application/json'},body:'{}'});
        res.push({u:u.split('/api/v1/')[1],s:r.status,b:(await r.text()).slice(0,80)}); }catch(e){ res.push({u,err:String(e).slice(0,50)}); }
    }
    return res;});
  await page.waitForTimeout(4000);
  await page.goto('https://airion-cargo.store/w/W4QAF1XTURESO01/settings/account',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(6000);
  return { tries:out, url: await page.evaluate(()=>location.pathname) };
};
