import {VISFN, CLICKDEEPEST, WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  const out={};
  await page.goto(BASE+'/w/'+WS+'/files', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(9000);
  const tile = await page.evaluate(`(() => { ${VISFN}
     const b=[...document.querySelector('main').querySelectorAll('button,[role=button],a')].filter(vis)
       .find(x=>/bob-shared/i.test(x.getAttribute('aria-label')||x.textContent||''));
     if(!b) return {none:true}; const r=b.getBoundingClientRect();
     return {cx:Math.round(r.x+r.width/2), cy:Math.round(r.y+r.height/2)}; })()`);
  out.tile=tile; if(tile.none){ out.pageText = await page.evaluate(`(() => ((document.querySelector('main')||document.body).innerText||'').replace(/\\s+/g,' ').slice(0,200))()`); return out; }
  await page.mouse.click(tile.cx, tile.cy, {button:'right'}); await page.waitForTimeout(2200);
  await page.evaluate(`(() => { ${VISFN} ${CLICKDEEPEST}
     clickDeepest(document.querySelector('[role=menu]')||document.body, /View details/i); })()`);
  await page.waitForTimeout(5000);
  out.details = await page.evaluate(`(() => { ${VISFN}
     const c=[...document.querySelectorAll('[role=dialog],aside,[data-state=open]')]
       .filter(e=>{const r=e.getBoundingClientRect(); return r.width>200&&r.height>120;});
     const d=c.pop(); if(!d) return '(no panel)';
     const t=(d.innerText||'').replace(/\\s+/g,' ');
     const i=t.indexOf('SHARED WITH');
     return {full:t.slice(0,240), sharedWith: i>=0? t.slice(i, i+90):'(no SHARED WITH section)'}; })()`);
  out.api = await page.evaluate(`(async () => {
     const r=await fetch('/api/v1/files/F4OWYV0TL02NVAK',{credentials:'include'});
     const t=await r.text(); return {st:r.status, body:t.slice(0,220)}; })()`);
  return out;
};
