import {VISFN, CLICKDEEPEST, WS, BASE} from './e-p2-helpers.mjs';
const STRICT = `const strictVis = el => {
  const r=el.getBoundingClientRect(); if(r.width<2||r.height<2) return {ok:false,why:'rect '+Math.round(r.width)+'x'+Math.round(r.height)};
  let n=el, op=1;
  while(n && n!==document.documentElement){ const cs=getComputedStyle(n);
    if(cs.display==='none') return {ok:false,why:'display none'};
    if(cs.visibility==='hidden') return {ok:false,why:'visibility hidden'};
    op*=parseFloat(cs.opacity||'1'); n=n.parentElement; }
  if(op<=0.01) return {ok:false,why:'opacity '+op.toFixed(2)};
  const hit=document.elementFromPoint(Math.round(r.x+r.width/2), Math.round(r.y+r.height/2));
  const covered = !(hit && (el.contains(hit)||hit.contains(el)));
  return {ok:!covered, why: covered?('covered by '+(hit?hit.tagName:'nothing')):'visible', opacity:op};
};`;
const find = (re) => `(() => { ${STRICT}
   const els=[...document.querySelectorAll('*')].filter(x=>x.children.length===0 && ${re}.test((x.textContent||'').trim()));
   if(!els.length) return {found:0};
   return {found:els.length, results:els.slice(0,2).map(e=>({txt:(e.textContent||'').trim().slice(0,40), ...strictVis(e)}))}; })()`;
export default async ({page}) => {
  const out={};
  // finding 9 — the OTHER heading in Directories
  await page.goto(BASE+'/w/'+WS+'/directories?tab=people', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(8500);
  out.F9_otherHeading = await page.evaluate(find('/^OTHER( \\\\d+)?$/'));
  // finding 13 — the SHARED WITH line
  await page.goto(BASE+'/w/'+WS+'/files', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(8500);
  const click = async re => { const t=await page.evaluate(`(() => { ${VISFN}
      const b=[...document.querySelector('main').querySelectorAll('button')].filter(vis).find(x=>${re}.test((x.textContent||'').trim()));
      if(!b) return {none:true}; const r=b.getBoundingClientRect();
      return {cx:Math.round(r.x+r.width/2), cy:Math.round(r.y+r.height/2)}; })()`);
    if(t.none) return 'not found';
    await page.mouse.move(t.cx,t.cy); await page.waitForTimeout(240);
    await page.mouse.down(); await page.waitForTimeout(120); await page.mouse.up();
    await page.waitForTimeout(3800); return 'clicked'; };
  await click('/^Shared with me$/');
  const tile = await page.evaluate(`(() => { ${VISFN}
     const b=[...document.querySelector('main').querySelectorAll('button,[role=button],a')].filter(vis)
       .find(x=>/\\.(txt|png)/i.test(x.getAttribute('aria-label')||x.textContent||''));
     const r=b.getBoundingClientRect();
     return {cx:Math.round(r.x+r.width/2), cy:Math.round(r.y+r.height/2)}; })()`);
  await page.mouse.click(tile.cx,tile.cy,{button:'right'}); await page.waitForTimeout(2200);
  await page.evaluate(`(() => { ${VISFN} ${CLICKDEEPEST}
     clickDeepest(document.querySelector('[role=menu]')||document.body, /View details/i); })()`);
  await page.waitForTimeout(4800);
  out.F13_notShared = await page.evaluate(find('/^Not shared with anyone yet\\\\.?$/'));
  out.F13_sharedBy  = await page.evaluate(find('/^Shared by$/'));
  await page.keyboard.press('Escape'); await page.waitForTimeout(1200);
  // finding 11 — the summary line in the meeting form
  await page.goto(BASE+'/w/'+WS+'/calendar', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(8000);
  await page.getByRole('button',{name:'New meeting'}).first().click();
  await page.waitForTimeout(3400);
  out.F11_summary = await page.evaluate(find('/^\\\\w{3}, \\\\w{3} \\\\d{1,2} ·/'));
  await page.keyboard.press('Escape');
  return out;
};
