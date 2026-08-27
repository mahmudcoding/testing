export default async ({page}) => {
  const ws='W4QCF1XTURESO01';
  const fixture = await page.evaluate(async ()=>{
    const r=await fetch('/api/v1/channels/C4QCPRIVATE0001/roles',{credentials:'include'});
    const j=await r.json(); const a=(j&&(j.roles||j))||[];
    return Array.isArray(a)?a[0]:a;
  });
  const fresh = await page.evaluate(async (ws)=>{
    const name='qa-c2-rolecmp-'+Math.random().toString(36).slice(2,6);
    const c=await fetch('/api/v1/channels',{method:'POST',credentials:'include',
      headers:{'content-type':'application/json'},
      body:JSON.stringify({name, workspace_id:ws, type:'private'})});
    const cj=await c.json();
    const id=cj.id||cj.channel_id||(cj.channel&&cj.channel.id);
    await new Promise(r=>setTimeout(r,2500));
    const r=await fetch(`/api/v1/channels/${id}/roles`,{credentials:'include'});
    const j=await r.json(); const a=(j&&(j.roles||j))||[];
    const role=Array.isArray(a)?a[0]:a;
    await fetch(`/api/v1/channels/${id}/archive`,{method:'POST',credentials:'include'});
    return {count:Array.isArray(a)?a.length:null, role};
  }, ws);
  const keys=(o)=>o?Object.keys(o).sort():[];
  const shape=(o)=>o?Object.fromEntries(Object.entries(o).map(([k,v])=>
    [k, v===null?'null':(typeof v==='string'?(v.length>26?v.slice(0,26)+'…':v):JSON.stringify(v))])):null;
  return {fixtureRole:shape(fixture), freshRoleCount:fresh.count, freshRole:shape(fresh.role),
          keysDiffer: JSON.stringify(keys(fixture))!==JSON.stringify(keys(fresh.role))};
};
