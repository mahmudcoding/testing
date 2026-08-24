export const HOOK = `(() => {
  if (window.__pcs) return;
  window.__pcs = [];
  const O = window.RTCPeerConnection;
  window.RTCPeerConnection = function(...a){ const pc = new O(...a); window.__pcs.push(pc); return pc; };
  window.RTCPeerConnection.prototype = O.prototype;
  Object.assign(window.RTCPeerConnection, O);
  const gum = navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices);
  window.__gumCalls = [];
  navigator.mediaDevices.getUserMedia = async (c) => { window.__gumCalls.push({c: JSON.stringify(c), t: Date.now()}); return gum(c); };
  const gdm = navigator.mediaDevices.getDisplayMedia && navigator.mediaDevices.getDisplayMedia.bind(navigator.mediaDevices);
  window.__gdmCalls = [];
  if (gdm) navigator.mediaDevices.getDisplayMedia = async (c) => { window.__gdmCalls.push({c: JSON.stringify(c||{}), t: Date.now()}); return gdm(c); };
})()`;

export const RTC_STATS = `async () => {
  const pcs = window.__pcs || [];
  const res = [];
  for (const pc of pcs) {
    if (pc.connectionState === 'closed') continue;
    const s = await pc.getStats();
    const o = {conn: pc.connectionState, ice: pc.iceConnectionState, out: [], in: []};
    s.forEach(r => {
      if (r.type === 'outbound-rtp') o.out.push({kind:r.kind, bytes:r.bytesSent, packets:r.packetsSent, fps:r.framesPerSecond, w:r.frameWidth, h:r.frameHeight, framesEnc:r.framesEncoded});
      if (r.type === 'inbound-rtp') o.in.push({kind:r.kind, bytes:r.bytesReceived, packets:r.packetsReceived, fps:r.framesPerSecond, w:r.frameWidth, h:r.frameHeight, framesDec:r.framesDecoded, audioLevel:r.audioLevel, totalAudioEnergy:r.totalAudioEnergy});
    });
    if (o.out.length || o.in.length) res.push(o);
  }
  return {pcs: pcs.length, gum: (window.__gumCalls||[]).length, gdm: (window.__gdmCalls||[]).length, stats: res};
}`;

export const UI_STATE = `() => {
  const dlg = [...document.querySelectorAll('[role="dialog"]')].pop();
  const q = () => [...(dlg||document.querySelector('main')||document).querySelectorAll('button')].map(b=>({l:(b.getAttribute('aria-label')||b.textContent||'').trim().slice(0,40), p:b.getAttribute('aria-pressed'), d:b.disabled})).filter(x=>x.l);
  return {
    url: location.href,
    dialogTitle: dlg ? (dlg.querySelector('h2')?.textContent||'').trim() : null,
    text: dlg ? dlg.innerText.replace(/\\n+/g,' | ').slice(0,900) : (document.querySelector('main')?.innerText||'').replace(/\\n+/g,' | ').slice(0,600),
    buttons: q(),
    videos: [...document.querySelectorAll('video')].map(v=>({w:v.videoWidth,h:v.videoHeight,paused:v.paused,muted:v.muted,hasSrc:!!v.srcObject,tracks: v.srcObject? v.srcObject.getTracks().map(t=>t.kind+':'+(t.enabled?'on':'off')+':'+t.readyState):[]})),
    audios: [...document.querySelectorAll('audio')].map(a=>({paused:a.paused,muted:a.muted,hasSrc:!!a.srcObject}))
  };
}`;
