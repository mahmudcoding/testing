import fs from 'node:fs';
const SRC = fs.readFileSync('/Users/mahmud/Projects/rtc-stream-monitor/src/rtc-stream-monitor.js','utf8');
export default async ({page}) => {
  const already = await page.evaluate(()=>!!window.__rtcStreamMonitor__);
  if (!already) await page.evaluate(SRC);
  await page.waitForTimeout(7000);
  return await page.evaluate(() => {
    const api = window.__rtcStreamMonitor__;
    if (!api) return { injected:false };
    const m = api.model;
    const host = document.getElementById('rtc-stream-monitor-host');
    const r = host && host.shadowRoot;
    const byId = {}; if (m) m.inbound.concat(m.outbound).forEach(s=>byId[s.id]=s);
    const cards = r ? [...r.querySelectorAll('.card[data-sid]')].map(c=>{
      const s = byId[c.getAttribute('data-sid')]||{};
      return { dir:s.dir, kind:s.kind, mid:s.mid, track:s.track?s.track.slice(0,8):null,
               title:c.querySelector('[data-u=ttl]').textContent.trim(),
               tip:(c.querySelector('[data-u=ttl]').title||'').slice(0,120),
               bps:c.querySelector('[data-u=bps]').textContent.trim() };
    }) : [];
    return { injected:true, pcs:m&&m.pcs, rtpStats:m&&m.rtpStats, ended:m&&m.endedStreams,
             nIn:m&&m.inbound.length, nOut:m&&m.outbound.length,
             viaTransport:m&&!!m.viaTransport,
             sections: r?[...r.querySelectorAll('.sech')].map(s=>s.textContent.trim()):[],
             elements: (m&&m.elements||[]).map(e=>({kind:e.kind, local:e.local, name:e.name, track:e.elTrack.slice(0,8)})),
             cards };
  });
};
