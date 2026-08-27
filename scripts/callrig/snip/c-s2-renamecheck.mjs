export default async ({page}) => page.evaluate(async ()=>{
  const ws='W4QCF1XTURESO01';
  const out={};
  // 1. creation: does it normalise?
  const raw='QA C2 Rename Check';
  const c=await fetch('/api/v1/channels',{method:'POST',credentials:'include',
    headers:{'content-type':'application/json'},
    body:JSON.stringify({name:raw, workspace_id:ws, type:'private'})});
  const cj=await c.json(); const id=cj.id||cj.channel_id||(cj.channel&&cj.channel.id);
  await new Promise(r=>setTimeout(r,2500));
  const a=await fetch(`/api/v1/channels/${id}`,{credentials:'include'});
  const aj=await a.json();
  out.created={sent:raw, stored:aj.name};
  // 2. rename to the same raw shape
  const raw2='QA C2 Renamed WITH Spaces';
  const p=await fetch(`/api/v1/channels/${id}`,{method:'PATCH',credentials:'include',
    headers:{'content-type':'application/json'},body:JSON.stringify({name:raw2})});
  let pj=null; try{pj=await p.json()}catch{}
  await new Promise(r=>setTimeout(r,2000));
  const b=await fetch(`/api/v1/channels/${id}`,{credentials:'include'});
  const bj=await b.json();
  out.renamed={sent:raw2, status:p.status, stored:bj.name};
  out.differ = out.created.stored!==out.created.sent && out.renamed.stored===out.renamed.sent;
  await fetch(`/api/v1/channels/${id}/archive`,{method:'POST',credentials:'include'});
  return out;
});
