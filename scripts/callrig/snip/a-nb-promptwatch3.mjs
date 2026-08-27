import { VIS } from './a-nb-lib.mjs';
// Records the SET of matching visible leaf texts whenever it changes, so a message that
// appears, fades and appears again is visible as three transitions rather than one entry.
export default async ({page}) => {
  const MS = Number(process.env.QA_MS || 60000);
  const rx = process.env.QA_RX || 'host';
  return await page.evaluate(async ([v, ms, r])=>{ const vis=eval(v); const re=new RegExp(r,'i');
    const out=[]; const t0=Date.now(); let last='';
    while(Date.now()-t0<ms){
      const cur=[];
      for (const e of document.querySelectorAll('*')) {
        if (e.childElementCount) continue;
        const t=(e.textContent||'').trim();
        if (!t || t.length>140 || !re.test(t)) continue;
        if (!vis(e)) continue;
        const q=e.getBoundingClientRect();
        cur.push(t.slice(0,90)+'  ['+Math.round(q.width)+'x'+Math.round(q.height)+']');
      }
      const k=JSON.stringify([...new Set(cur)].sort());
      if(k!==last){ out.push({ms:Date.now()-t0, shown:[...new Set(cur)].sort()}); last=k; }
      await new Promise(x=>setTimeout(x,350)); }
    return out; }, [VIS, MS, rx]);
};
