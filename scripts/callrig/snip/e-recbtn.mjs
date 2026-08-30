import { DOM } from './lib.mjs';
export default async ({ page }) => {
  const t0=Date.now(); const out={samples:[]}; let last='';
  while (Date.now()-t0 < Number(process.env.QA_MS||90000)) {
    await page.evaluate(DOM).catch(()=>{});
    const s = await page.evaluate(()=>{
      const q=window.__qa; const b=document.querySelector('[data-testid="call-controls-record"]');
      const t=document.querySelector('[data-testid="recording-start-access-trigger"]');
      const badge=[...document.querySelectorAll('*')].filter(n=>!n.children.length&&/^Recording$/i.test((n.textContent||'').trim())&&q.boxVis(n)).length;
      return {rec: b?{name:q.nameOf(b),dis:b.disabled,title:b.getAttribute('title'),active:b.getAttribute('data-active')}:null,
              trig: t?{dis:t.disabled}:null, badge,
              notices:q.notices().map(n=>n.text).slice(0,3)};
    }).catch(e=>({err:String(e).slice(0,90)}));
    const k=JSON.stringify(s);
    if(k!==last){ out.samples.push({ms:Date.now()-t0,...s}); last=k; }
    await page.waitForTimeout(500);
  }
  return out;
};
