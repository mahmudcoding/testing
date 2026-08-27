import {VISFN, CLICKDEEPEST, WS, BASE} from './e-p2-helpers.mjs';
const boxVisFn = `const boxVis = el => { const r=el.getBoundingClientRect(); if(r.width<120||r.height<70) return false;
    let n=el,op=1; while(n&&n!==document.documentElement){const cs=getComputedStyle(n); if(cs.display==='none'||cs.visibility==='hidden')return false; op*=parseFloat(cs.opacity||'1'); n=n.parentElement;} return op>0.01; };`;
export default async ({page}) => {
  const out={}; const calls=[];
  page.on('response', async r => { const u=r.url();
    if(u.includes('/api/v1/')&&r.request().method()!=='GET'){ let b=''; try{b=(await r.text()).slice(0,140);}catch(e){}
      calls.push(r.status()+' '+r.request().method()+' '+u.split('/api/v1/')[1].slice(0,44)+' :: '+b.replace(/\s+/g,' ')); }});
  await page.goto(BASE+'/w/'+WS+'/directories?tab=people', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(8500);
  const t = await page.evaluate(`(() => { ${VISFN}
     const b=[...document.querySelector('main').querySelectorAll('button')].filter(vis)
       .find(x=>/Open QA Carol's profile/i.test(x.getAttribute('aria-label')||''));
     if(!b) return {none:true}; const r=b.getBoundingClientRect();
     return {cx:Math.round(r.x+r.width/2), cy:Math.round(r.y+r.height/2)}; })()`);
  if(t.none){ out.err='profile button not found'; return out; }
  await page.mouse.move(t.cx,t.cy); await page.waitForTimeout(300);
  await page.mouse.down(); await page.waitForTimeout(130); await page.mouse.up();
  await page.waitForTimeout(4500);
  out.popupControls = await page.evaluate(`(() => { ${VISFN} ${boxVisFn}
     const d=[...document.querySelectorAll('[role=dialog],aside,[class*=popover]')].filter(boxVis).pop();
     if(!d) return {none:true};
     return [...new Set([...d.querySelectorAll('button')].filter(vis)
       .map(b=>(b.getAttribute('aria-label')||b.textContent||'').trim().slice(0,20)))].slice(0,8); })()`);
  out.shareClick = await page.evaluate(`(() => { ${VISFN} ${CLICKDEEPEST} ${boxVisFn}
     const d=[...document.querySelectorAll('[role=dialog],aside,[class*=popover]')].filter(boxVis).pop();
     return clickDeepest(d, /^Share$/); })()`);
  await page.waitForTimeout(3500);
  out.shareDialog = await page.evaluate(`(() => { ${VISFN} ${boxVisFn}
     const d=[...document.querySelectorAll('[role=dialog]')].filter(boxVis).pop();
     if(!d) return '(none)';
     return {text:(d.innerText||'').replace(/\\s+/g,' ').slice(0,200),
             controls:[...new Set([...d.querySelectorAll('button,[role=option],input')].filter(vis)
               .map(b=>(b.getAttribute('aria-label')||b.getAttribute('placeholder')||b.textContent||'').trim().slice(0,24)).filter(Boolean))].slice(0,10)}; })()`);
  // pick a channel target and confirm
  out.pickTarget = await page.evaluate(`(() => { ${VISFN} ${CLICKDEEPEST} ${boxVisFn}
     const d=[...document.querySelectorAll('[role=dialog]')].filter(boxVis).pop();
     return clickDeepest(d, /qa-general/i); })()`);
  await page.waitForTimeout(2200);
  calls.length=0;
  out.confirm = await page.evaluate(`(() => { ${VISFN} ${CLICKDEEPEST} ${boxVisFn}
     const d=[...document.querySelectorAll('[role=dialog]')].filter(boxVis).pop();
     return clickDeepest(d, /^(Share|Send|Share profile)$/); })()`);
  const notes=[];
  for(let i=0;i<14;i++){ await page.waitForTimeout(400);
    const g=await page.evaluate(`(() => { ${VISFN}
       const strict=el=>{const r=el.getBoundingClientRect(); return r.width>=24&&r.height>=12&&vis(el);};
       return [...document.querySelectorAll('[role=alert],[role=status],[data-sonner-toast]')].filter(strict)
         .map(n=>(n.innerText||'').replace(/\\s+/g,' ').trim()).filter(Boolean); })()`);
    if(g.length) notes.push(...g); }
  out.calls=calls.slice(0,3); out.notices=[...new Set(notes)].slice(0,3);
  out.dialogStillOpen = await page.evaluate(`(() => { ${boxVisFn}
     return [...document.querySelectorAll('[role=dialog]')].filter(boxVis).length>0; })()`);
  return out;
};
