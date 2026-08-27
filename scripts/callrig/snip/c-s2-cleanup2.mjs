export default async ({page}) => page.evaluate(async ()=>{
  const ws='W4QCF1XTURESO01';
  const r=await fetch(`/api/v1/workspaces/${ws}/channels`,{credentials:'include'});
  const j=await r.json(); const a=(j&&(j.channels||j.items||j))||[];
  const mine=(Array.isArray(a)?a:[]).filter(c=>/^qa-c2-(sweep|roleid|rolecmp|rolefresh)/.test(c.name||''));
  const out=[];
  for (const c of mine){
    const res=await fetch(`/api/v1/channels/${c.id}/archive`,{method:'POST',credentials:'include'});
    out.push(`${c.name}: ${res.status}`);
  }
  return {archived:out, remaining:mine.length};
});
