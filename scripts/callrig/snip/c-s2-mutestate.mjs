export default async ({page}) => {
  const ws='W4QCF1XTURESO01', ch='C4QCGENERAL0001';
  return page.evaluate(async({ws,ch})=>{
    const out={};
    const grab=async(u)=>{ try{ const r=await fetch(u,{credentials:'include'});
      const t=await r.text(); return {status:r.status, len:t.length, body:t.slice(0,600)}; }
      catch(e){ return {err:String(e).slice(0,60)}; } };
    out.muteGet = await grab(`/api/v1/notifications/channels/${ch}/mute`);
    const chans = await grab(`/api/v1/workspaces/${ws}/channels`);
    out.channelsStatus=chans.status;
    try {
      const j=JSON.parse(chans.body.length<chans.len? '{}' : chans.body);
    } catch(e){}
    // fetch fully and inspect the one channel object
    try {
      const r=await fetch(`/api/v1/workspaces/${ws}/channels`,{credentials:'include'});
      const j=await r.json();
      const arr=j.channels||j.data||j||[];
      const c=arr.find(x=>x.id===ch);
      out.channelObj = c? {keys:Object.keys(c), muteish:Object.fromEntries(
        Object.entries(c).filter(([k])=>/mut|notif/i.test(k)))} : 'not found';
    } catch(e){ out.channelObj='ERR '+String(e).slice(0,50); }
    return out;
  }, {ws,ch});
};
