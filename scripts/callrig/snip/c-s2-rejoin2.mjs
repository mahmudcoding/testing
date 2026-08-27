const WS='W4QCF1XTURESO01', GEN='C4QCGENERAL0001';
export default async ({page}) => {
  const out = await page.evaluate(async (ch)=>{
    const tries=[];
    for (const [m,u,b] of [
      ['POST', `/api/v1/channels/${ch}/join`, '{}'],
      ['POST', `/api/v1/channels/join`, JSON.stringify({channel_id:ch})],
    ]) {
      try { const r=await fetch(u,{method:m,credentials:'include',headers:{'Content-Type':'application/json'},body:b});
        tries.push({u:u.split('/api/v1')[1], s:r.status, b:(await r.text()).slice(0,90)});
        if (r.ok) break; } catch(e){ tries.push({u, err:String(e).slice(0,50)}); }
    }
    const chk=await fetch(`/api/v1/messaging/channels/${ch}/messages?limit=1`,{credentials:'include'});
    return {tries, access:chk.status};
  }, GEN);
  return out;
};
