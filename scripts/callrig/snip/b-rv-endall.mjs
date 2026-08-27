export default async ({page}) => {
  return await page.evaluate(async()=>{
    const r=await fetch('/api/v1/workspace/W4QBF1XTURESO01/meetings/active',{credentials:'include'});
    const j=await r.json(); const out=[];
    for (const m of (j.meetings||[])) {
      const e=await fetch(`/api/v1/meeting/${m.id}/end`,{method:'POST',credentials:'include'});
      out.push({id:m.id,name:m.name,end:e.status});
    }
    return out;
  });
};
