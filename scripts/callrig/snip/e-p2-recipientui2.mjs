import {VISFN, CLICKDEEPEST, WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  const out={}; const calls=[];
  page.on('response', async r => { const u=r.url();
    if(u.includes('/api/v1/files')&&r.request().method()!=='GET'){ let b=''; try{b=(await r.text()).slice(0,120);}catch(e){}
      calls.push(r.status()+' '+r.request().method()+' '+u.split('/api/v1/')[1].slice(0,40)+' :: '+b.replace(/\s+/g,' ')); }});
  await page.goto(BASE+'/w/'+WS+'/files', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(9000);
  const clickBtn = async (re, root='main') => { const t=await page.evaluate(`(() => { ${VISFN}
      const scope=${root==='main'?"document.querySelector('main')":"document.body"};
      const b=[...scope.querySelectorAll('button')].filter(vis).find(x=>${re}.test((x.textContent||'').trim()));
      if(!b) return {none:true}; const r=b.getBoundingClientRect();
      return {cx:Math.round(r.x+r.width/2), cy:Math.round(r.y+r.height/2)}; })()`);
    if(t.none) return 'not found';
    await page.mouse.move(t.cx,t.cy); await page.waitForTimeout(250);
    await page.mouse.down(); await page.waitForTimeout(120); await page.mouse.up();
    await page.waitForTimeout(3800); return 'clicked'; };
  out.scope = await clickBtn('/^Shared with me$/');
  out.listed = await page.evaluate(`(() => /bob-shared/.test((document.querySelector('main')||document.body).innerText||''))()`);
  const t = await page.evaluate(`(() => { ${VISFN}
     const b=[...document.querySelector('main').querySelectorAll('button,[role=button],a')].filter(vis)
       .find(x=>/bob-shared/i.test(x.getAttribute('aria-label')||x.textContent||''));
     if(!b) return {none:true}; const r=b.getBoundingClientRect();
     return {cx:Math.round(r.x+r.width/2), cy:Math.round(r.y+r.height/2)}; })()`);
  if(t.none){ out.err='tile not found'; return out; }
  await page.mouse.click(t.cx,t.cy,{button:'right'}); await page.waitForTimeout(2200);
  out.contextMenu = await page.evaluate(`(() => { ${VISFN}
     return [...new Set([...document.querySelectorAll('[role=menuitem],[role=menu] button')].filter(vis)
       .map(n=>((n.textContent||'').trim())+'/disabled='+n.disabled))].slice(0,8); })()`);
  calls.length=0;
  out.delClick = await page.evaluate(`(() => { ${VISFN} ${CLICKDEEPEST}
     return clickDeepest(document.querySelector('[role=menu]')||document.body, /Delete file/i); })()`);
  await page.waitForTimeout(2500);
  out.confirm = await page.evaluate(`(() => { ${VISFN}
     const d=[...document.querySelectorAll('[role=alertdialog],[role=dialog]')]
       .filter(e=>{const r=e.getBoundingClientRect(); return r.width>150&&r.height>80;}).pop();
     if(!d) return '(none)';
     return {text:(d.innerText||'').replace(/\\s+/g,' ').slice(0,190),
             buttons:[...new Set([...d.querySelectorAll('button')].filter(vis).map(b=>(b.textContent||'').trim()))].slice(0,6)}; })()`);
  const notes=[];
  if(out.confirm!=='(none)'){
    await page.evaluate(`(() => { ${VISFN} ${CLICKDEEPEST}
       const d=[...document.querySelectorAll('[role=alertdialog],[role=dialog]')]
         .filter(e=>{const r=e.getBoundingClientRect(); return r.width>150&&r.height>80;}).pop();
       clickDeepest(d, /^(Delete|Delete file|Confirm)$/); })()`);
    for(let i=0;i<12;i++){ await page.waitForTimeout(400);
      const g=await page.evaluate(`(() => { ${VISFN}
        const strict=el=>{const r=el.getBoundingClientRect(); return r.width>=24&&r.height>=12&&vis(el);};
        return [...document.querySelectorAll('[role=alert],[role=status],[data-sonner-toast]')].filter(strict)
          .map(n=>(n.innerText||'').replace(/\\s+/g,' ').trim()).filter(Boolean); })()`);
      if(g.length) notes.push(...g); }
  }
  out.calls=calls.slice(0,3); out.notices=[...new Set(notes)].slice(0,3);
  await page.waitForTimeout(2000);
  out.stillListed = await page.evaluate(`(() => /bob-shared/.test((document.querySelector('main')||document.body).innerText||''))()`);
  return out;
};
