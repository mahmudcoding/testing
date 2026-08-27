export default async ({page}) => {
  return await page.evaluate(async ()=>{
    const r=await fetch('/api/v1/messaging/channels/C4QCPRIVATE0001/messages?limit=4',{credentials:'include'});
    const j=await r.json();
    const withFiles=(j.messages||[]).filter(m=>(m.files||[]).length);
    const out=[];
    for (const m of withFiles.slice(0,3)) {
      for (const f of m.files) {
        out.push({msg:m.id.slice(-6), file:f.id.slice(-6), name:f.filename,
          allKeys:Object.keys(f).join(','), raw:JSON.stringify(f).slice(0,260)});
      }
    }
    return out;
  });
};
