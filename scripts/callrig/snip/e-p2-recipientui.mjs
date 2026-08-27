import {VISFN, CLICKDEEPEST, WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  const out={}; const calls=[];
  page.on('response', async r => { const u=r.url();
    if(u.includes('/api/v1/files')&&r.request().method()!=='GET'){ let b=''; try{b=(await r.text()).slice(0,120);}catch(e){}
      calls.push(r.status()+' '+r.request().method()+' '+u.split('/api/v1/')[1].slice(0,40)+' :: '+b.replace(/\s+/g,' ')); }});
  await page.goto(BASE+'/w/'+WS+'/files', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(9000);
  const openDetails = async () => {
    const t = await page.evaluate(`(() => { ${VISFN}
       const b=[...document.querySelector('main').querySelectorAll('button,[role=button],a')].filter(vis)
         .find(x=>/bob-shared/i.test(x.getAttribute('aria-label')||x.textContent||''));
       if(!b) return {none:true}; const r=b.getBoundingClientRect();
       return {cx:Math.round(r.x+r.width/2), cy:Math.round(r.y+r.height/2)}; })()`);
    if(t.none) return false;
    await page.mouse.click(t.cx,t.cy,{button:'right'}); await page.waitForTimeout(2200);
    await page.evaluate(`(() => { ${VISFN} ${CLICKDEEPEST}
       clickDeepest(document.querySelector('[role=menu]')||document.body, /View details/i); })()`);
    await page.waitForTimeout(4500); return true;
  };
  out.opened = await openDetails();
  out.panelControls = await page.evaluate(`(() => { ${VISFN}
     const c=[...document.querySelectorAll('[role=dialog],aside,[data-state=open]')]
       .filter(e=>{const r=e.getBoundingClientRect(); return r.width>200&&r.height>120;});
     const d=c.pop(); if(!d) return [];
     return [...d.querySelectorAll('button')].filter(vis)
       .map(b=>((b.getAttribute('aria-label')||b.textContent||'').trim().slice(0,24))+'/disabled='+b.disabled).slice(0,10); })()`);
  // click Delete file and watch, from before the click
  calls.length=0;
  const notes=[];
  const grab = async () => await page.evaluate(`(() => { ${VISFN}
     const strict=el=>{const r=el.getBoundingClientRect(); return r.width>=24&&r.height>=12&&vis(el);};
     return [...document.querySelectorAll('[role=alert],[role=status],[data-sonner-toast]')].filter(strict)
       .map(n=>(n.innerText||'').replace(/\\s+/g,' ').trim()).filter(Boolean); })()`);
  out.delClick = await page.evaluate(`(() => { ${VISFN} ${CLICKDEEPEST}
     const c=[...document.querySelectorAll('[role=dialog],aside,[data-state=open]')]
       .filter(e=>{const r=e.getBoundingClientRect(); return r.width>200&&r.height>120;});
     return clickDeepest(c.pop()||document.body, /^Delete file$/); })()`);
  await page.waitForTimeout(2500);
  out.confirmDialog = await page.evaluate(`(() => { ${VISFN}
     const d=[...document.querySelectorAll('[role=alertdialog],[role=dialog]')]
       .filter(e=>{const r=e.getBoundingClientRect(); return r.width>150&&r.height>80;}).pop();
     if(!d) return '(none)';
     return {text:(d.innerText||'').replace(/\\s+/g,' ').slice(0,180),
             buttons:[...new Set([...d.querySelectorAll('button')].filter(vis).map(b=>(b.textContent||'').trim()))].slice(0,6)}; })()`);
  if(out.confirmDialog!=='(none)'){
    await page.evaluate(`(() => { ${VISFN} ${CLICKDEEPEST}
       const d=[...document.querySelectorAll('[role=alertdialog],[role=dialog]')]
         .filter(e=>{const r=e.getBoundingClientRect(); return r.width>150&&r.height>80;}).pop();
       clickDeepest(d, /^(Delete|Delete file|Confirm)$/); })()`);
    for(let i=0;i<12;i++){ await page.waitForTimeout(400); const g=await grab(); if(g.length) notes.push(...g); }
  }
  out.calls = calls.slice(0,3);
  out.notices = [...new Set(notes)].slice(0,3);
  out.fileStillListed = await page.evaluate(`(() => { ${VISFN}
     return /bob-shared/.test((document.querySelector('main')||document.body).innerText||''); })()`);
  return out;
};
