/* sector L: what transport is the media actually on? */
export default async ({ page }) => {
  return await page.evaluate(async ()=>{
    const out=[];
    for(const pc of (window.__pcs||[])){
      if(pc.connectionState==='closed') continue;
      const s=await pc.getStats(); const cands={}, pairs=[], transports=[];
      s.forEach(r=>{
        if(r.type==='local-candidate'||r.type==='remote-candidate') cands[r.id]={t:r.type,ct:r.candidateType,proto:r.protocol,relay:r.relayProtocol,port:r.port,addr:(r.address||'').slice(0,20)};
        if(r.type==='candidate-pair') pairs.push({state:r.state,nominated:r.nominated,sel:r.selected,l:r.localCandidateId,rr:r.remoteCandidateId,rtt:r.currentRoundTripTime,br:r.availableOutgoingBitrate});
        if(r.type==='transport') transports.push({sel:r.selectedCandidatePairId, bytesSent:r.bytesSent, dtls:r.dtlsState});
      });
      const selPair = pairs.find(p=>p.state==='succeeded'&&(p.nominated||p.sel)) || pairs.find(p=>p.state==='succeeded');
      out.push({conn:pc.connectionState, ice:pc.iceConnectionState,
        selected: selPair?{rtt:selPair.rtt, bitrate:selPair.br, local:cands[selPair.l], remote:cands[selPair.rr]}:null,
        pairCount:pairs.length, transports});
    }
    return {pcs:(window.__pcs||[]).length, out};
  });
};
