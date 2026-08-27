export default async ({page}) => {
  return await page.evaluate(async(ws)=>{
    const body={workspace_id:ws, name:'QA api probe', is_private:false,
                requires_approval:true, who_can_see_guest_link:'everyone'};
    const tries=['/api/v1/meeting','/api/v1/meetings'];
    const out=[];
    for(const u of tries){
      try{ const r=await fetch(u,{method:'POST',credentials:'include',
             headers:{'Content-Type':'application/json'}, body:JSON.stringify(body)});
        const t=await r.text();
        out.push({u, s:r.status, b:t.slice(0,400)});
        if(r.ok) break;
      }catch(e){ out.push({u, err:String(e).slice(0,80)}); }
    }
    return out;
  }, 'W4QBF1XTURESO01');
};
