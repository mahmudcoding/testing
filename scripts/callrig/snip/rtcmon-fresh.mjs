import fs from 'node:fs';
const SRC = fs.readFileSync('/Users/mahmud/Projects/rtc-stream-monitor/src/rtc-stream-monitor.js','utf8');
export default async ({page}) => {
  // Tear the monitor down and re-inject, so nothing is remembered from a run
  // when the camera was on. This is the "joined with video off" case.
  await page.evaluate(()=>{ try { window.__rtcStreamMonitor__ && window.__rtcStreamMonitor__.stop(); } catch(e){} });
  await page.waitForTimeout(1200);
  await page.evaluate(SRC);
  await page.waitForTimeout(8000);
  return await page.evaluate(() => {
    const m = window.__rtcStreamMonitor__.model;
    const r = document.getElementById('rtc-stream-monitor-host').shadowRoot;
    const byId = {}; m.inbound.concat(m.outbound).forEach(s=>byId[s.id]=s);
    return {
      localElements: (m.elements||[]).filter(e=>e.local).length,
      cards: [...r.querySelectorAll('.card[data-sid]')].map(c=>{
        const s = byId[c.getAttribute('data-sid')]||{};
        return { dir:s.dir, kind:s.kind, title:c.querySelector('[data-u=ttl]').textContent.trim(),
                 why:(c.querySelector('[data-u=ttl]').title||'').replace(/ · ssrc.*/,'') };
      })
    };
  });
};
