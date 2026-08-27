import {VISFN, WS, BASE} from './e-p2-helpers.mjs';
const openSearch = async page => { await page.evaluate(`(() => { ${VISFN}
     const b=[...document.querySelectorAll('button')].filter(vis).find(x=>/^Search /.test(x.getAttribute('aria-label')||''));
     if(b) b.click(); })()`); await page.waitForTimeout(2600); };
const SNAP = `(() => { ${VISFN}
   const dlgs=[...document.querySelectorAll('[role=dialog],[role=alertdialog]')]
     .filter(e=>{const r=e.getBoundingClientRect(); return r.width>200&&r.height>100;})
     .map(e=>({w:Math.round(e.getBoundingClientRect().width),
               lbl:(e.getAttribute('aria-label')||'').slice(0,28),
               head:(e.innerText||'').replace(/\\s+/g,' ').slice(0,58)}));
   const toasts=[...document.querySelectorAll('[role=status],[role=alert],[class*=toast],[class*=Toast]')]
     .filter(vis).map(e=>(e.innerText||'').replace(/\\s+/g,' ').slice(0,48)).filter(Boolean);
   const imgs=[...document.querySelectorAll('img')].filter(vis)
     .filter(e=>e.getBoundingClientRect().width>200).map(e=>String(e.src).slice(-28));
   return {nDlg:dlgs.length, dlgs, toasts, imgs, url:location.pathname}; })()`;
export default async ({page}) => {
  const out={};
  for(const q of ['viewer','normal']){
    await page.goto(BASE+'/w/'+WS+'/calendar', {waitUntil:'domcontentloaded'});
    await page.waitForTimeout(7000);
    await openSearch(page);
    await page.keyboard.type(q); await page.waitForTimeout(4500);
    const row = await page.evaluate(`(() => { ${VISFN}
       const d=[...document.querySelectorAll('[role=dialog]')].filter(e=>e.getBoundingClientRect().width>300).pop();
       const o=[...d.querySelectorAll('[role=option]')].filter(vis)
         .find(x=>/Open channel with file/.test(x.textContent||''));
       if(!o) return null; const r=o.getBoundingClientRect();
       return {cx:Math.round(r.x+r.width/2), cy:Math.round(r.y+r.height/2)}; })()`);
    if(!row){ out[q]={note:'no row'}; continue; }
    const frames=[];
    frames.push({t:'pre', ...(await page.evaluate(SNAP))});
    await page.mouse.move(row.cx,row.cy); await page.waitForTimeout(500);
    await page.mouse.down(); await page.waitForTimeout(120); await page.mouse.up();
    for(let i=0;i<12;i++){ await page.waitForTimeout(300); frames.push({t:(i+1)*300, ...(await page.evaluate(SNAP))}); }
    // collapse: keep frames where anything changed
    const key=f=>JSON.stringify([f.nDlg,f.dlgs.map(d=>d.head),f.toasts,f.imgs,f.url]);
    const kept=[]; let last=null;
    for(const f of frames){ const k=key(f); if(k!==last){kept.push(f); last=k;} }
    out[q]={nFrames:frames.length, changes:kept};
    await page.keyboard.press('Escape'); await page.waitForTimeout(1000);
  }
  return out;
};
