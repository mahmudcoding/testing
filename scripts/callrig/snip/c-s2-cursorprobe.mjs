const CH='C4OWKU9EANT1XSR';
export default async ({page}) => {
  return await page.evaluate(async (ch)=>{
    const base=`/api/v1/messaging/channels/${ch}/messages?limit=5`;
    const first=await (await fetch(base,{credentials:'include'})).json();
    const l=first.messages||[];
    const oldest=l[l.length-1];
    const probes={};
    for (const p of ['before','before_id','before_seq','cursor','offset','before_message_id','max_seq']) {
      const v = /seq/.test(p)? oldest.channel_seq : oldest.id;
      try {
        const r=await fetch(`${base}&${p}=${v}`,{credentials:'include'});
        const j=await r.json();
        const m=(j.messages||[]);
        probes[p]={status:r.status, n:m.length, newest:(m[0]&&m[0].body||'').slice(0,18), same:(m[0]&&m[0].id)===l[0].id};
      } catch(e){ probes[p]={err:String(e).slice(0,40)}; }
    }
    return {firstPageNewest:(l[0].body||'').slice(0,18), firstPageOldest:(oldest.body||'').slice(0,18),
      oldestSeq:oldest.channel_seq, probes};
  }, CH);
};
