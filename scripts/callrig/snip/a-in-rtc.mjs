export default async ({page}) => {
  return await page.evaluate(async ()=>{
    const pcs = window.__pcs||[];
    const out = {n:pcs.length, inbound:[], outbound:[]};
    for (const pc of pcs){
      let s; try{ s = await pc.getStats(); }catch(e){ continue; }
      s.forEach(r=>{
        if(r.type==='inbound-rtp') out.inbound.push({kind:r.kind, bytes:r.bytesReceived, frames:r.framesDecoded||null, pkts:r.packetsReceived});
        if(r.type==='outbound-rtp') out.outbound.push({kind:r.kind, bytes:r.bytesSent, frames:r.framesEncoded||null});
      });
    }
    return out;
  });
};
