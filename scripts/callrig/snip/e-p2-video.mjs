import {VISFN, WS, BASE} from './e-p2-helpers.mjs';
const DIR='/private/tmp/claude-501/-Users-mahmud-Projects-testing/e413bd47-3211-4b38-a986-f622cf2d708c/scratchpad/upl2';
const boxVis = `const bv = el => { const r=el.getBoundingClientRect(); if(r.width<1||r.height<1) return false;
   let n=el,op=1; while(n&&n!==document.documentElement){const cs=getComputedStyle(n);
     if(cs.display==='none'||cs.visibility==='hidden')return false; op*=parseFloat(cs.opacity||'1'); n=n.parentElement;} return op>0.01; };`;
const mc = async (page, cx, cy) => { await page.mouse.move(cx,cy); await page.waitForTimeout(200);
  await page.mouse.down(); await page.waitForTimeout(100); await page.mouse.up(); await page.waitForTimeout(3000); };
export default async ({page}) => {
  const out={}; const ups=[];
  page.on('response', async r=>{ if(/files\/upload/.test(r.url())&&r.request().method()==='POST'){
    let b=''; try{b=(await r.text()).slice(0,130);}catch(e){} ups.push(r.status()+' '+b); }});
  await page.goto(BASE+'/w/'+WS+'/files', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(9500);
  await page.getByRole('button',{name:'Upload'}).first().click();
  await page.waitForTimeout(2500);
  await page.locator('input[type=file]').first().setInputFiles([DIR+'/e2video.mp4']);
  await page.waitForTimeout(3500);
  await page.evaluate(`(() => { ${VISFN} ${boxVis}
     const d=[...document.querySelectorAll('[role=dialog]')].filter(bv)
       .filter(e=>e.getBoundingClientRect().width>200).pop();
     const b=[...d.querySelectorAll('button')].filter(vis).find(x=>/^Upload \\d+ files?$/.test((x.innerText||'').trim()));
     if(b) b.click(); })()`);
  await page.waitForTimeout(9000);
  out.upload = ups.slice(0,1);
  await page.keyboard.press('Escape'); await page.waitForTimeout(1200);
  await page.reload({waitUntil:'domcontentloaded'}); await page.waitForTimeout(9500);
  out.filters = await page.evaluate(`(() => { ${VISFN}
     return [...document.querySelector('main').querySelectorAll('button')].filter(vis)
       .map(b=>(b.innerText||'').replace(/\\s+/g,' ').trim())
       .filter(t=>/^(All files|Images|Documents|Videos|Audio|Archives)/.test(t)); })()`);
  // open it
  const v = await page.evaluate(`(() => { ${VISFN}
     const m=document.querySelector('main');
     const el=[...m.querySelectorAll('*')].filter(vis)
       .find(e=>{const own=[...e.childNodes].filter(n=>n.nodeType===3).map(n=>n.textContent).join('');
                 return /e2video\\.mp4/.test(own);});
     if(!el) return null; const r=(el.closest('button,li,[role=row]')||el).getBoundingClientRect();
     return {cx:Math.round(r.x+r.width/2), cy:Math.round(r.y+r.height/2)}; })()`);
  if(v){ await mc(page, v.cx, v.cy); await page.waitForTimeout(4000);
    out.viewer = await page.evaluate(`(() => { ${VISFN}
       const d=[...document.querySelectorAll('[role=dialog],aside')]
         .filter(e=>{const r=e.getBoundingClientRect(); return r.width>200&&r.height>120;}).pop();
       if(!d) return {open:false};
       const vid=d.querySelector('video');
       return {open:true, hasVideoEl:!!vid,
               videoState: vid?{w:vid.videoWidth, h:vid.videoHeight, dur:Math.round((vid.duration||0)*10)/10,
                                readyState:vid.readyState, err:vid.error?vid.error.code:null}:null,
               text:(d.innerText||'').replace(/\\s+/g,' ').slice(0,110)}; })()`); }
  return out;
};
