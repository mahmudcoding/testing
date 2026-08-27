export default async ({page}) => page.evaluate(async ()=>{
  const ws='W4QCF1XTURESO01';
  // find the channel we just made (archived)
  const r=await fetch(`/api/v1/users/me/channels/archived?workspace_id=${ws}&limit=100`,{credentials:'include'});
  const j=await r.json(); const a=(j&&(j.channels||j.items))||[];
  const hit=(Array.isArray(a)?a:[]).find(c=>/^qa-c2-lim-/.test(c.name||'')||String(c.name||'').length>150);
  // and ask the server directly what it does with a long name
  const probe=await fetch('/api/v1/channels',{method:'POST',credentials:'include',
    headers:{'content-type':'application/json'},
    body:JSON.stringify({name:'y'.repeat(200), workspace_id:ws, type:'private'})});
  let pj=null; try{pj=await probe.json()}catch{}
  return {archivedChannelName:hit?String(hit.name).slice(0,40)+' (len '+String(hit.name).length+')':'not found',
    directCreateWith200chars:{status:probe.status, key:pj&&pj.key,
      message:String(pj&&pj.message||'').slice(0,70)}};
});
