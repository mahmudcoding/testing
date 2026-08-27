import { VIS } from './a-nb-lib.mjs';
// Watch BOTH the participants panel text AND the whole visible DOM for ban-list evidence.
export default async ({page}) => {
  const MS = Number(process.env.QA_MS || 50000);
  const t = page.locator('[data-testid="call-controls-people-toggle"]').first();
  if (await t.count() && (await t.getAttribute('aria-pressed')) !== 'true') { await t.click(); await page.waitForTimeout(2000); }
  return await page.evaluate(async ([v,ms])=>{ const vis=eval(v); const out=[]; const t0=Date.now(); let last='';
    while(Date.now()-t0<ms){
      const p=document.querySelector('[data-testid="call-side-panel-slot"]');
      const panel = p?(p.innerText||'').replace(/\s+/g,' ').slice(0,220):null;
      // wide net: any visible leaf text or aria-label mentioning blocked/unban
      const wide=[];
      for (const e of document.querySelectorAll('*')) {
        const al=e.getAttribute && e.getAttribute('aria-label');
        if (al && /unban|blocked/i.test(al) && vis(e)) wide.push('aria:'+al.slice(0,40));
        if (e.childElementCount) continue;
        const txt=(e.textContent||'').trim();
        if (txt && txt.length<60 && /unban|blocked/i.test(txt) && vis(e)) wide.push('txt:'+txt.slice(0,40));
      }
      const s={panel, wide:[...new Set(wide)]};
      const k=JSON.stringify(s); if(k!==last){ out.push({ms:Date.now()-t0, at:Date.now(), ...s}); last=k; }
      await new Promise(x=>setTimeout(x,400)); }
    return out; }, [VIS, MS]);
}
