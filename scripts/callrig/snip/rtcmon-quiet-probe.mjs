export default async ({page}) => await page.evaluate(() => {
  const api = window.__rtcStreamMonitor__; const m = api.model;
  const r = document.getElementById('rtc-stream-monitor-host').shadowRoot;
  const byId = {}; m.inbound.concat(m.outbound).forEach(s=>byId[s.id]=s);
  return {
    quietStreams: m.quietStreams,
    streams: m.inbound.concat(m.outbound).map(s=>({dir:s.dir,kind:s.kind,kbps:s.kbps===null?null:Math.round(s.kbps*10)/10,quiet:!!s.quiet,ssrc:String(s.ssrc).slice(-4),track:s.track?s.track.slice(0,8):null})),
    cards: [...r.querySelectorAll('.card[data-sid]')].map(c=>{
      const s = byId[c.getAttribute('data-sid')]||{};
      return (s.dir||'?')+':'+(s.kind||'?')+':'+c.querySelector('[data-u=ttl]').textContent.trim()+':'+c.querySelector('[data-u=bps]').textContent.trim();
    }),
    sections: [...r.querySelectorAll('.sech')].map(s=>s.textContent.trim())
  };
});
