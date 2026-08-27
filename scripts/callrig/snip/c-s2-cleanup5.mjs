export default async ({page}) => page.evaluate(async ()=>{
  const ws='W4QCF1XTURESO01';
  const r=await fetch(`/api/v1/workspaces/${ws}/channels`,{credentials:'include'});
  const j=await r.json(); const a=(j&&(j.channels||j.items||j))||[];
  const keep=new Set(['qa-general','qa-private','qa-empty','qa-archived','qa-c-spaces-test']);
  const mine=(Array.isArray(a)?a:[]).filter(c=>!keep.has(c.name));
  const out=[];
  for (const c of mine){
    const res=await fetch(`/api/v1/channels/${c.id}/archive`,{method:'POST',credentials:'include'});
    out.push(`${c.name}: ${res.status}`);
  }
  const r2=await fetch(`/api/v1/workspaces/${ws}/channels`,{credentials:'include'});
  const j2=await r2.json(); const a2=(j2&&(j2.channels||j2.items||j2))||[];
  return {archived:out, remainingActive:(Array.isArray(a2)?a2:[]).map(c=>c.name)};
});
