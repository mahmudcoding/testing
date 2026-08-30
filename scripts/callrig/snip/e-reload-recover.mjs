/* Reload a tab that is in a call and watch what the app does. */
import { DOM } from './lib.mjs';
export default async ({ page }) => {
  const out={t0:new Date().toISOString(), states:[]};
  await page.reload({waitUntil:'domcontentloaded'});
  const t=Date.now(); let last='';
  while (Date.now()-t < 40000) {
    let s;
    try {
      await page.evaluate(DOM).catch(()=>{});
      s = await page.evaluate(()=>{
        const q=window.__qa||{};
        const ov=document.querySelector('[data-testid="call-overlay-expanded"]');
        const txt=(ov?ov.innerText:document.body.innerText||'').replace(/\s+/g,' ');
        const btns=[...document.querySelectorAll('button')].filter(n=>q.vis?q.vis(n):true).map(n=>q.nameOf?q.nameOf(n):n.textContent);
        return {url:location.href, inCall: btns.some(b=>/Leave call/i.test(b)),
          lobby: btns.some(b=>/^Join$/.test(b)) || /READY TO JOIN|Waiting for host approval/.test(txt),
          banner: (txt.match(/(Reconnecting[^.]*|Connection lost[^.]*|Restoring[^.]*|Waiting for network[^.]*|Trying to reconnect[^.]*)/i)||[null])[0],
          notices:(q.notices?q.notices():[]).map(n=>n.text).slice(0,4),
          head: txt.slice(0,160)};
      });
    } catch(e) { s={err:String(e).slice(0,100)}; }
    const k=JSON.stringify(s);
    if (k!==last) { out.states.push({ms:Date.now()-t, ...s}); last=k; }
    await page.waitForTimeout(300);
  }
  return out;
};
