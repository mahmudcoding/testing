export default async ({page}) => await page.evaluate(async(sid)=>{
  const out={};
  // try GET then POST on the documented guest-link path
  for (const m of ['GET','POST']) {
    try{
      const r=await fetch(`/api/v1/calendar/meetings/${sid}/guest-link`,
        m==='POST'?{method:'POST',credentials:'include',headers:{'Content-Type':'application/json'},body:'{}'}
                  :{credentials:'include'});
      const t=await r.text();
      out[m]={s:r.status, b:t.slice(0,400)};
      if(r.ok) break;
    }catch(e){ out[m]={err:String(e).slice(0,80)}; }
  }
  return out;
}, process.env.QA_SID);
