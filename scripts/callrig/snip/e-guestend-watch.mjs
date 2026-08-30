/* Driver: the GUEST browser. Polls the guest document from before the host ends
 * the call, so a control that appears and goes cannot be missed. */
import { chromium } from 'playwright';
import { rigPort } from '../rigmap.mjs';
import { DOM, HOOK, safeClick } from './lib.mjs';

export default async ({ page }) => {
  const out={states:[], samples:0};
  const port = rigPort('E','alice');
  const browser = await chromium.connectOverCDP(`http://127.0.0.1:${port}`);
  const ctx = browser.contexts()[0];
  await ctx.addInitScript(HOOK);
  const host = ctx.pages().filter(p=>p.url().includes('airion-cargo.store'))[0];
  await host.evaluate(DOM);

  const t0=Date.now(); let last=''; let fired=false;
  await page.evaluate(DOM).catch(()=>{});
  while (Date.now()-t0 < 60000) {
    out.samples++;
    let s;
    try {
      await page.evaluate(DOM).catch(()=>{});
      s = await page.evaluate(()=>{
        const q=window.__qa||{};
        const btn=[...document.querySelectorAll('button,a[href],[role=button],input')].filter(n=>q.boxVis&&q.boxVis(n));
        return {url:location.href, n:btn.length,
          names:btn.map(n=>q.nameOf(n).slice(0,40)).slice(0,12),
          head:(document.body.innerText||'').replace(/\s+/g,' ').slice(0,220)};
      });
    } catch(e){ s={err:String(e).slice(0,90)}; }
    const k=JSON.stringify(s);
    if(k!==last){ out.states.push({ms:Date.now()-t0,...s}); last=k; }
    if(!fired && Date.now()-t0>4000){
      fired=true;
      await safeClick(host,'[data-testid="call-controls-end-for-everyone"]').catch(()=>{});
      await host.waitForTimeout(1200);
      await safeClick(host,'[data-testid="call-end-confirm-submit"]').catch(()=>{});
      out.endTriggeredAtMs = Date.now()-t0;
    }
    await page.waitForTimeout(300);
  }
  out.durMs = Date.now()-t0;
  out.effectiveIntervalMs = Math.round(out.durMs/out.samples);
  await browser.close();
  return out;
};
