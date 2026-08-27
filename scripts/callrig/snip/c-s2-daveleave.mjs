export default async ({page}) => page.evaluate(async ()=>{
  const ws='W4QCF1XTURESO01';
  const r=await fetch(`/api/v1/workspaces/${ws}/channels`,{credentials:'include'});
  const j=await r.json(); const a=(j&&(j.channels||j.items))||[];
  const list=Array.isArray(a)?a:[];
  const out=[];
  for(const c of list){
    const res=await fetch(`/api/v1/channels/${c.id}/leave`,{method:'POST',credentials:'include'});
    out.push(`${c.name}: ${res.status}`);
  }
  await new Promise(x=>setTimeout(x,1500));
  const r2=await fetch(`/api/v1/workspaces/${ws}/channels`,{credentials:'include'});
  const j2=await r2.json(); const a2=(j2&&(j2.channels||j2.items))||[];
  return {left:out, channelsNow:Array.isArray(a2)?a2.length:null};
});
