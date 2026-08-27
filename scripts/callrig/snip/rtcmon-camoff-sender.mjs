export default async ({page}) => await page.evaluate(async () => {
  const pcs = (window.__rtcStreamMonitor__ && window.__rtcStreamMonitor__.model) ? null : null;
  // reach the live PCs through the monitor's own capture
  const api = window.__rtcStreamMonitor__;
  const out = [];
  // getStats via the monitor's model raw stats
  const m = api.model;
  for (const s of m.outbound) {
    out.push({ kind:s.kind, mid:s.mid, kbps:s.kbps, track:s.track, active:s.active,
               rawActive:s.raw && s.raw.active, rid:s.rid,
               bytesSent:s.raw && s.raw.bytesSent, framesEncoded: s.raw && s.raw.framesEncoded });
  }
  // and the transceiver/sender truth
  const trx = [];
  for (const pc of (window.__pcs||[])) {
    for (const t of pc.getTransceivers()) {
      if (!t.sender) continue;
      trx.push({ mid:t.mid, dir:t.direction, cur:t.currentDirection, stopped:t.stopped,
                 senderTrack: t.sender.track ? (t.sender.track.kind+':'+(t.sender.track.enabled?'enabled':'DISABLED')+':'+t.sender.track.readyState) : 'NULL',
                 encActive: (()=>{ try { return t.sender.getParameters().encodings.map(e=>e.active); } catch(e){ return 'err'; } })() });
    }
  }
  return { cameraOff: !!document.querySelector('button[aria-label="Turn camera on"]'), outbound: out, transceivers: trx };
});
