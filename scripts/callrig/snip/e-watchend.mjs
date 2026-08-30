/* Poll the whole document from before a trigger, recording distinct states. */
import { DOM } from './lib.mjs';
export default async ({ page }) => {
  const ms = Number(process.env.QA_MS||30000);
  const t0=Date.now(); const seen=[]; let lastKey='';
  await page.evaluate(DOM).catch(()=>{});
  while (Date.now()-t0 < ms) {
    let s=null;
    try {
      s = await page.evaluate(()=>{
        const q=window.__qa||{};
        const t=(document.body.innerText||'').replace(/\s+/g,' ');
        const ov=document.querySelector('[data-testid="call-ended-overlay"]')
              ||document.querySelector('[data-testid="call-taken-over"]');
        return {url:location.href, ovText: ov?(ov.innerText||'').replace(/\s+/g,' ').slice(0,700):null,
                hasOv: !!ov, notices: q.notices?q.notices().map(n=>n.text).slice(0,6):[],
                tailLen:t.length};
      });
    } catch(e) { s={err:String(e).slice(0,120)}; }
    const key = JSON.stringify([s.url,s.hasOv,s.ovText,s.notices,s.err]);
    if (key!==lastKey) { seen.push({ms:Date.now()-t0, ...s}); lastKey=key; }
    await page.waitForTimeout(300);
  }
  return {samples:seen.length, seen: seen.slice(0,14)};
};
