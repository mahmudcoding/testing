const GEN='C4QCGENERAL0001';
export default async ({page}) => {
  return await page.evaluate(async (ch)=>{
    const out=[];
    const t0=Date.now();
    for (let i=0;i<24;i++){
      const r=await fetch(`/api/v1/messaging/channels/${ch}/messages?limit=1`,{credentials:'include'});
      const m=await fetch(`/api/v1/channels/${ch}/members`,{credentials:'include'});
      let mm=null; try{ const j=await m.json(); mm=(j.members||j.data||[]).length; }catch(e){}
      out.push({ms:Date.now()-t0, messages:r.status, membersStatus:m.status, memberCount:mm});
      if (r.status===200) break;
      await new Promise(res=>setTimeout(res,2500));
    }
    return {samples:out.length, first:out[0], last:out[out.length-1],
      changed: out.filter((s,i)=> i===0 || s.messages!==out[i-1].messages)};
  }, GEN);
};
