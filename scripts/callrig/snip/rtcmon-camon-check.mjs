export default async ({page}) => {
  await page.evaluate(()=>{ const b=[...document.querySelectorAll('button')].filter(x=>x.offsetParent)
    .find(x=>/^turn camera on$/i.test(x.getAttribute('aria-label')||'')); if(b) b.click(); });
  await page.waitForTimeout(9000);
  return await page.evaluate(() => {
    const m=window.__rtcStreamMonitor__.model;
    const r=document.getElementById('rtc-stream-monitor-host').shadowRoot;
    const byId={}; m.inbound.concat(m.outbound).forEach(s=>byId[s.id]=s);
    return { cameraOn: !!document.querySelector('button[aria-label="Turn camera off"]'),
      out: [...r.querySelectorAll('.card[data-sid]')].map(c=>{
        const s=byId[c.getAttribute('data-sid')]||{};
        return { dir:s.dir, kind:s.kind, active:s.active, title:c.querySelector('[data-u=ttl]').textContent.trim(),
                 bps:c.querySelector('[data-u=bps]').textContent.trim(),
                 meta:c.querySelector('[data-u=meta]').textContent.replace(/\s+/g,' ').trim() };
      }).filter(c=>c.dir==='out') };
  });
};
