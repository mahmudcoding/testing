import fs from 'node:fs';
const SRC = fs.readFileSync('/Users/mahmud/Projects/rtc-stream-monitor/extension/monitor.js','utf8');
export default async ({page}) => {
  await page.evaluate(()=>{ const b=[...document.querySelectorAll('button')].filter(x=>x.offsetParent)
    .find(x=>/^turn camera off$/i.test(x.getAttribute('aria-label')||'')); if(b) b.click(); });
  await page.waitForTimeout(4000);
  await page.evaluate(()=>{ try{ window.__rtcStreamMonitor__ && window.__rtcStreamMonitor__.stop(); }catch(e){} });
  await page.waitForTimeout(1000);
  await page.evaluate(SRC);
  await page.waitForTimeout(9000);
  await page.screenshot({ path: '/Users/mahmud/Projects/rtc-stream-monitor/screenshots/aloqa-camera-off.png' });
  return await page.evaluate(()=>{
    const r=document.getElementById('rtc-stream-monitor-host').shadowRoot;
    return [...r.querySelectorAll('.card[data-sid]')].map(c=>
      c.querySelector('[data-u=ttl]').textContent.trim()+' — '+
      c.querySelector('[data-u=bps]').textContent.trim()+' — '+
      c.querySelector('[data-u=meta]').textContent.replace(/\s+/g,' ').trim());
  });
};
