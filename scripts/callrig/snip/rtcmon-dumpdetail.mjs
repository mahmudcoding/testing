import fs from 'node:fs';
const SRC = fs.readFileSync('/Users/mahmud/Projects/rtc-stream-monitor/src/rtc-stream-monitor.js','utf8');
export default async ({page}) => {
  if (await page.evaluate(()=>!!window.__rtcStreamMonitor__)) {
    await page.evaluate(()=>window.__rtcStreamMonitor__.stop());
  }
  await page.evaluate(SRC);
  await page.waitForTimeout(9000);
  return await page.evaluate(() => {
    const r = document.getElementById('rtc-stream-monitor-host').shadowRoot;
    const m = window.__rtcStreamMonitor__.model;
    const byId = {}; m.inbound.concat(m.outbound).forEach(s=>byId[s.id]=s);
    // expand one sending and one receiving card
    const picked = {};
    for (const c of r.querySelectorAll('.card[data-sid]')) {
      const s = byId[c.getAttribute('data-sid')]; if (!s || picked[s.dir+s.kind]) continue;
      if (s.dir === 'in' && s.kind !== 'video') continue;
      c.querySelector('.chev').click(); picked[s.dir+s.kind] = c.getAttribute('data-sid');
    }
    const read = (sid) => {
      const c = r.querySelector('.card[data-sid="'+CSS.escape(sid)+'"]'); if(!c) return null;
      const dl = c.querySelector('[data-u=exp]');
      const rows = [...dl.querySelectorAll('dt')].map(d=>({k:d.textContent.trim(), v:(d.nextElementSibling||{}).textContent||''}));
      return {
        title: c.querySelector('[data-u=ttl]').textContent.trim(),
        meta: c.querySelector('[data-u=meta]').textContent.replace(/\s+/g,' ').trim(),
        headings: rows.filter(x=>!x.v.trim()).map(x=>x.k),
        interesting: rows.filter(x=>/packetsLost|jitter|roundTrip|fractionLost|mimeType|trackIdentifier|qualityLimitationDurations|powerEfficient|targetBitrate|totalPlayoutDelay|remoteTimestamp|reportsSent/.test(x.k))
                        .map(x=>x.k+' = '+x.v.trim()),
        totalRows: rows.length
      };
    };
    return { sending: read(picked['outvideo']||picked['outaudio']), receiving: read(picked['invideo']) };
  });
};
