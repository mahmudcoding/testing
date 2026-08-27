export default async ({page}) => {
  return await page.evaluate(async ()=>{
    const cur = await (await fetch('/api/v1/meetings/current',{credentials:'include'})).json();
    const id = cur && cur.meeting && cur.meeting.id;
    if (!id) return {none:true};
    const tries=[];
    for (const [m,u] of [['POST',`/api/v1/meeting/${id}/cancel`],['POST',`/api/v1/meeting/${id}/end`],['DELETE',`/api/v1/meeting/${id}`]]) {
      try { const r=await fetch(u,{method:m,credentials:'include',headers:{'Content-Type':'application/json'},body:'{}'});
        tries.push({m,u:u.slice(-30),s:r.status,b:(await r.text()).slice(0,90)});
        if (r.ok) break; } catch(e){ tries.push({m,u,err:String(e).slice(0,60)}); }
    }
    const after = await (await fetch('/api/v1/meetings/current',{credentials:'include'})).text();
    return {id, tries, after: after.slice(0,140)};
  });
};
