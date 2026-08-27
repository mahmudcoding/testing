import {VISFN, WS, BASE} from './e-p2-helpers.mjs';
const mc = async (page, cx, cy) => { await page.mouse.move(cx,cy); await page.waitForTimeout(200);
  await page.mouse.down(); await page.waitForTimeout(100); await page.mouse.up(); await page.waitForTimeout(2800); };
export default async ({page}) => {
  const out={};
  await page.goto(BASE+'/w/'+WS+'/files', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(9500);
  const listed = `(() => { ${VISFN}
     const m=document.querySelector('main');
     const t=(m.innerText||'').replace(/\\s+/g,' ');
     const names=(t.match(/[\\w.-]+\\.(txt|png|zip|wav|jpg)/g)||[]);
     return {count:(t.match(/(\\d+) files? ·/)||[])[1]||null, names:[...new Set(names)].slice(0,8)}; })()`;
  for(const filt of ['Audio','Archives','All files']){
    const t = await page.evaluate(`(() => { ${VISFN}
       const b=[...document.querySelector('main').querySelectorAll('button')].filter(vis)
         .find(x=>new RegExp('^'+${JSON.stringify(filt)}+'\\\\b').test((x.innerText||'').replace(/\\s+/g,' ').trim()));
       if(!b) return null; const r=b.getBoundingClientRect();
       return {cx:Math.round(r.x+r.width/2), cy:Math.round(r.y+r.height/2), label:(b.innerText||'').replace(/\\s+/g,' ').trim()}; })()`);
    if(!t){ out[filt]='filter not found'; continue; }
    await mc(page, t.cx, t.cy);
    out[filt] = {clickedLabel:t.label, ...(await page.evaluate(listed))};
  }
  // open the audio file in the viewer
  const av = await page.evaluate(`(() => { ${VISFN}
     const m=document.querySelector('main');
     const el=[...m.querySelectorAll('*')].filter(vis)
       .find(e=>{const own=[...e.childNodes].filter(n=>n.nodeType===3).map(n=>n.textContent).join('');
                 return /e2audio\\.wav/.test(own);});
     if(!el) return null; const r=(el.closest('button,li,[role=row]')||el).getBoundingClientRect();
     return {cx:Math.round(r.x+r.width/2), cy:Math.round(r.y+r.height/2)}; })()`);
  if(av){ await mc(page, av.cx, av.cy); await page.waitForTimeout(3500);
    out.audioViewer = await page.evaluate(`(() => { ${VISFN}
       const d=[...document.querySelectorAll('[role=dialog],aside')]
         .filter(e=>{const r=e.getBoundingClientRect(); return r.width>200&&r.height>120;}).pop();
       if(!d) return {open:false};
       return {open:true, hasAudioEl:!!d.querySelector('audio'), hasVideoEl:!!d.querySelector('video'),
               text:(d.innerText||'').replace(/\\s+/g,' ').slice(0,110),
               buttons:[...d.querySelectorAll('button')].filter(vis)
                 .map(b=>((b.innerText||'').trim()||b.getAttribute('aria-label')||'').slice(0,18)).slice(0,7)}; })()`); }
  return out;
};
