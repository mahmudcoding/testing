import fs from 'node:fs';
const SRC = fs.readFileSync('/Users/mahmud/Projects/rtc-stream-monitor/extension/monitor.js','utf8');
export default async ({page}) => {
  if (!(await page.evaluate(()=>!!window.__rtcStreamMonitor__))) {
    await page.evaluate(SRC); await page.waitForTimeout(8000);
  }
  return await page.evaluate(() => {
    const m=window.__rtcStreamMonitor__.model;
    const r=document.getElementById('rtc-stream-monitor-host').shadowRoot;
    const byId={}; m.inbound.concat(m.outbound).forEach(s=>byId[s.id]=s);
    return { pcs:m.pcs, rtpStats:m.rtpStats, ended:m.endedStreams, nIn:m.inbound.length, nOut:m.outbound.length,
      viaTransport:!!m.viaTransport,
      sections:[...r.querySelectorAll('.sech')].map(s=>s.textContent.replace(/\s+/g,' ').trim()),
      cards:[...r.querySelectorAll('.card[data-sid]')].map(c=>{
        const s=byId[c.getAttribute('data-sid')]||{};
        return s.dir+' '+s.kind+' · '+c.querySelector('[data-u=ttl]').textContent.trim()+' · '+
               c.querySelector('[data-u=bps]').textContent.trim(); }) };
  });
};
