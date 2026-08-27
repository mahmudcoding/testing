import { VIS } from './a-nb-lib.mjs';
// Poll the stage: which tile is largest (spotlighted) + every visible short text on the page.
// Records only changes. Starts before the trigger.
export default async ({page}) => {
  const MS = Number(process.env.QA_MS || 30000);
  return await page.evaluate(async ([v, ms])=>{ const vis=eval(v);
    const out=[]; const t0=Date.now(); let lastBig='', lastTxt='';
    const seenText = new Set();
    const snap=()=>{
      const ov=document.querySelector('[data-testid="call-overlay-expanded"]')||document.body;
      const tiles=[...ov.querySelectorAll('[data-testid="participant-tile"]')].filter(vis)
        .map(t=>({w:(t.querySelector('[data-testid="participant-name"]')?.textContent||'').trim(),
                  a:Math.round(t.getBoundingClientRect().width*t.getBoundingClientRect().height/1000),
                  m:[...t.querySelectorAll('[data-testid]')].map(y=>y.getAttribute('data-testid'))
                     .filter(x=>/pin|spotlight|host/i.test(x))}))
        .sort((a,b)=>b.a-a.a);
      return tiles;
    };
    const texts=()=>{ const hits=[];
      for (const e of document.querySelectorAll('*')) { if (e.childElementCount) continue;
        const t=(e.textContent||'').trim(); if (t && t.length<90 && vis(e)) hits.push(t); }
      return hits; };
    const base = new Set(texts());
    while(Date.now()-t0<ms){
      const tl=snap(); const big = tl[0] ? tl[0].w+' '+tl[0].a+' '+JSON.stringify(tl[0].m) : 'none';
      if(big!==lastBig){ out.push({ms:Date.now()-t0, big, all:tl.map(x=>x.w+':'+x.a+(x.m.length?'!'+x.m.join(','):''))}); lastBig=big; }
      const nw = texts().filter(t=>!base.has(t) && !seenText.has(t));
      if(nw.length){ nw.forEach(t=>seenText.add(t)); out.push({ms:Date.now()-t0, newText:[...new Set(nw)].slice(0,10)}); }
      await new Promise(x=>setTimeout(x,300)); }
    return out; }, [VIS, MS]);
};
