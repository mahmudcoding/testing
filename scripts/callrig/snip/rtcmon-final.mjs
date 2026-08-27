import fs from 'node:fs';
// Inject exactly what the packaged extension injects.
const SRC = fs.readFileSync('/Users/mahmud/Projects/rtc-stream-monitor/extension/monitor.js','utf8');
export default async ({page}) => {
  await page.evaluate(()=>{ try{ window.__rtcStreamMonitor__ && window.__rtcStreamMonitor__.stop(); }catch(e){} });
  await page.waitForTimeout(1200);
  await page.evaluate(SRC);
  await page.waitForTimeout(9000);
  const out = await page.evaluate(() => {
    const m=window.__rtcStreamMonitor__.model;
    const r=document.getElementById('rtc-stream-monitor-host').shadowRoot;
    const byId={}; m.inbound.concat(m.outbound).forEach(s=>byId[s.id]=s);
    return { pcs:m.pcs, rtpStats:m.rtpStats, ended:m.endedStreams,
      localElements:(m.elements||[]).filter(e=>e.local).length,
      cameraOff: !!document.querySelector('button[aria-label="Turn camera on"]'),
      cards:[...r.querySelectorAll('.card[data-sid]')].map(c=>{
        const s=byId[c.getAttribute('data-sid')]||{};
        return { dir:s.dir, kind:s.kind, title:c.querySelector('[data-u=ttl]').textContent.trim(),
                 bps:c.querySelector('[data-u=bps]').textContent.trim(),
                 meta:c.querySelector('[data-u=meta]').textContent.replace(/\s+/g,' ').trim(),
                 why:(c.querySelector('[data-u=ttl]').title||'').replace(/ · ssrc.*/,'') }; }) };
  });
  await page.screenshot({ path: '/Users/mahmud/Projects/rtc-stream-monitor/screenshots/aloqa-live-call.png' });
  return out;
};
