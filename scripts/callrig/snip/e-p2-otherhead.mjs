import {WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  await page.goto(BASE+'/w/'+WS+'/directories?tab=people', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(8500);
  return await page.evaluate(`(() => {
    const strictVis = el => {
      const r=el.getBoundingClientRect(); if(r.width<2||r.height<2) return {ok:false,why:'rect'};
      let n=el,op=1; while(n&&n!==document.documentElement){const cs=getComputedStyle(n);
        if(cs.display==='none') return {ok:false,why:'display none'};
        if(cs.visibility==='hidden') return {ok:false,why:'visibility hidden'};
        op*=parseFloat(cs.opacity||'1'); n=n.parentElement;}
      if(op<=0.01) return {ok:false,why:'opacity '+op};
      const hit=document.elementFromPoint(Math.round(r.x+r.width/2),Math.round(r.y+r.height/2));
      return {ok:!!(hit&&(el.contains(hit)||hit.contains(el))), why:'checked', opacity:+op.toFixed(2)};
    };
    const all=[...document.querySelectorAll('*')]
      .filter(x=>/other/i.test((x.textContent||'')) && (x.textContent||'').trim().length<40);
    const inner=all.filter(c=>!all.some(o=>o!==c&&c.contains(o)));
    return { matches:inner.length,
      rows:inner.slice(0,3).map(e=>({tag:e.tagName,
        textContent:(e.textContent||'').trim().slice(0,24),
        innerText:(e.innerText||'').trim().slice(0,24),
        transform:getComputedStyle(e).textTransform, ...strictVis(e)})),
      mainInnerTextHasOTHER: /OTHER/.test((document.querySelector('main')||document.body).innerText||'') }; })()`);
};
