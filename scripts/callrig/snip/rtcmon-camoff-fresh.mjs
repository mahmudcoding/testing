import fs from 'node:fs';
const SRC = fs.readFileSync('/Users/mahmud/Projects/rtc-stream-monitor/src/rtc-stream-monitor.js','utf8');
export default async ({page}) => {
  const clicked = await page.evaluate(() => {
    const b=[...document.querySelectorAll('button')].filter(x=>x.offsetParent)
      .find(x=>/^turn camera off$/i.test(x.getAttribute('aria-label')||''));
    if(!b) return 'already off';
    b.click(); return 'clicked off';
  });
  await page.waitForTimeout(7000);
  const dom = await page.evaluate(() => ({
    camBtn: [...document.querySelectorAll('button')].filter(b=>b.offsetParent)
      .map(b=>b.getAttribute('aria-label')).filter(l=>l&&/^turn camera/i.test(l)),
    localTileMedia: document.querySelectorAll('[data-local="true"] video, [data-local="true"] audio').length,
    selfTileName: (document.querySelector('[data-testid="participant-tile"][data-local="true"] [data-testid="participant-name"]')||{}).textContent
  }));
  // fresh monitor: nothing remembered
  await page.evaluate(()=>{ try{ window.__rtcStreamMonitor__ && window.__rtcStreamMonitor__.stop(); }catch(e){} });
  await page.waitForTimeout(1200);
  await page.evaluate(SRC);
  await page.waitForTimeout(8000);
  const mon = await page.evaluate(() => {
    const m=window.__rtcStreamMonitor__.model;
    const r=document.getElementById('rtc-stream-monitor-host').shadowRoot;
    const byId={}; m.inbound.concat(m.outbound).forEach(s=>byId[s.id]=s);
    return { localElements:(m.elements||[]).filter(e=>e.local).length,
      cards:[...r.querySelectorAll('.card[data-sid]')].map(c=>{
        const s=byId[c.getAttribute('data-sid')]||{};
        return { dir:s.dir, kind:s.kind, title:c.querySelector('[data-u=ttl]').textContent.trim(),
                 why:(c.querySelector('[data-u=ttl]').title||'').replace(/ · ssrc.*/,'') }; }) };
  });
  return { clicked, dom, mon };
};
