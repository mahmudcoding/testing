import {VISFN, CLICKDEEPEST, WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  const out={};
  await page.goto(BASE+'/w/'+WS+'/files', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(9000);
  const t = await page.evaluate(`(() => { ${VISFN}
     const b=[...document.querySelector('main').querySelectorAll('button')].filter(vis)
       .find(x=>/^Shared with me$/.test((x.textContent||'').trim()));
     if(!b) return {none:true}; const r=b.getBoundingClientRect();
     return {cx:Math.round(r.x+r.width/2), cy:Math.round(r.y+r.height/2)}; })()`);
  if(!t.none){ await page.mouse.move(t.cx,t.cy); await page.waitForTimeout(280);
    await page.mouse.down(); await page.waitForTimeout(130); await page.mouse.up(); await page.waitForTimeout(5000); }
  out.sharedList = await page.evaluate(`(() => { ${VISFN}
     const m=document.querySelector('main'); const t=(m.innerText||'').replace(/\\s+/g,' ');
     return t.slice(0,220); })()`);
  const tile = await page.evaluate(`(() => { ${VISFN}
     const b=[...document.querySelector('main').querySelectorAll('button,[role=button],a')].filter(vis)
       .find(x=>/bob-shared/i.test(x.getAttribute('aria-label')||x.textContent||''));
     if(!b) return {none:true}; const r=b.getBoundingClientRect();
     return {cx:Math.round(r.x+r.width/2), cy:Math.round(r.y+r.height/2)}; })()`);
  out.tile=tile; if(tile.none) return out;
  await page.mouse.click(tile.cx, tile.cy, {button:'right'}); await page.waitForTimeout(2200);
  await page.evaluate(`(() => { ${VISFN} ${CLICKDEEPEST}
     clickDeepest(document.querySelector('[role=menu]')||document.body, /View details/i); })()`);
  await page.waitForTimeout(5000);
  out.details = await page.evaluate(`(() => { ${VISFN}
     const c=[...document.querySelectorAll('[role=dialog],aside,[data-state=open]')]
       .filter(e=>{const r=e.getBoundingClientRect(); return r.width>200&&r.height>120;});
     const d=c.pop(); if(!d) return '(no panel)';
     const t=(d.innerText||'').replace(/\\s+/g,' ');
     return {text:t.slice(0,280), namesSender:/QA Bob/.test(t),
             uploadedByLine:(t.match(/Uploaded by[^·|]{0,30}/)||['(no line)'])[0]}; })()`);
  return out;
};
