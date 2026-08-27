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
  return {ok:!covered, why: covered?('covered by '+(hit?hit.tagName:'nothing')):'visible', opacity:+op.toFixed(2)};
};
const probe = (re) => { const all=[...document.querySelectorAll('*')]
    .filter(x=>re.test((x.textContent||'').replace(/\\s+/g,' ')) && (x.textContent||'').replace(/\\s+/g,' ').trim().length<90);
  const inner=all.filter(c=>!all.some(o=>o!==c&&c.contains(o)));
  if(!inner.length) return {found:0, anyMatch:all.length};
  return {found:inner.length, results:inner.slice(0,2).map(e=>({tag:e.tagName,
    txt:(e.textContent||'').replace(/\\s+/g,' ').trim().slice(0,44), ...strictVis(e)}))}; };`;
export default async ({page}) => {
  const out={};
  await page.goto(BASE+'/w/'+WS+'/directories?tab=people', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(8500);
  out.F9_other = await page.evaluate(`(() => { ${STRICT} return probe(/OTHER/); })()`);
  await page.goto(BASE+'/w/'+WS+'/files', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(8500);
  const click = async re => { const t=await page.evaluate(`(() => { ${VISFN}
      const b=[...document.querySelector('main').querySelectorAll('button')].filter(vis).find(x=>${re}.test((x.textContent||'').trim()));
      if(!b) return {none:true}; const r=b.getBoundingClientRect();
      return {cx:Math.round(r.x+r.width/2), cy:Math.round(r.y+r.height/2)}; })()`);
    if(t.none) return 'nf';
    await page.mouse.move(t.cx,t.cy); await page.waitForTimeout(240);
    await page.mouse.down(); await page.waitForTimeout(120); await page.mouse.up();
    await page.waitForTimeout(3800); return 'ok'; };
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
  out.F13_notShared = await page.evaluate(`(() => { ${STRICT} return probe(/Not shared with anyone/); })()`);
  await page.keyboard.press('Escape'); await page.waitForTimeout(1200);
  await page.goto(BASE+'/w/'+WS+'/calendar', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(8000);
  await page.getByRole('button',{name:'New meeting'}).first().click();
  await page.waitForTimeout(3400);
  out.F11_summary = await page.evaluate(`(() => { ${STRICT} return probe(/· \\d+ min$/); })()`);
  await page.keyboard.press('Escape');
  return out;
};
