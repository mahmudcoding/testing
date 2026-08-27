import { VIS } from './a-nb-lib.mjs';
// Full-DOM leaf watcher that also records the node's SIZE and whether it is the topmost
// element at its own centre — so a 1x1 sr-only node or a hover-only tooltip is visible as such.
export default async ({page}) => {
  const MS = Number(process.env.QA_MS || 45000);
  const rx = process.env.QA_RX || 'host';
  return await page.evaluate(async ([v, ms, r])=>{ const vis=eval(v); const re=new RegExp(r,'i');
    const out=[]; const t0=Date.now(); const seen=new Set();
    while(Date.now()-t0<ms){
      for (const e of document.querySelectorAll('*')) {
        if (e.childElementCount) continue;
        const t=(e.textContent||'').trim();
        if (!t || t.length>140 || !re.test(t)) continue;
        if (!vis(e)) continue;
        const q=e.getBoundingClientRect();
        const key=t+'|'+Math.round(q.width)+'x'+Math.round(q.height);
        if (seen.has(key)) continue; seen.add(key);
        const top=document.elementFromPoint(q.left+q.width/2, q.top+q.height/2);
        out.push({ms:Date.now()-t0, txt:t.slice(0,110), box:`${Math.round(q.width)}x${Math.round(q.height)}`,
          y:Math.round(q.top), onTop: !!(top && (top===e||e.contains(top)||top.contains(e))),
          tag:e.tagName.toLowerCase()});
      }
      await new Promise(x=>setTimeout(x,350)); }
    return out; }, [VIS, MS, rx]);
};
