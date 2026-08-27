import {WS, BASE} from './e-p2-helpers.mjs';
const ARCH='C4QEARCHIVE0001';
export default async ({page}) => {
  await page.goto(BASE+'/w/'+WS+'/c/'+ARCH, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(10000);
  return await page.evaluate(`(() => {
    const strictVis = el => {
      const r=el.getBoundingClientRect(); if(r.width<2||r.height<2) return {ok:false,why:'rect'};
      let n=el,op=1; while(n&&n!==document.documentElement){const cs=getComputedStyle(n);
        if(cs.display==='none') return {ok:false,why:'display none'};
        if(cs.visibility==='hidden') return {ok:false,why:'visibility hidden'};
        op*=parseFloat(cs.opacity||'1'); n=n.parentElement;}
      if(op<=0.01) return {ok:false,why:'opacity '+op.toFixed(2)};
      const hit=document.elementFromPoint(Math.round(r.x+r.width/2),Math.round(r.y+r.height/2));
      const covered=!(hit&&(el.contains(hit)||hit.contains(el)));
      return {ok:!covered, why: covered?('covered by '+(hit?hit.tagName:'?')):'visible', opacity:+op.toFixed(2)};
    };
    const probe = re => { const all=[...document.querySelectorAll('*')]
        .filter(x=>re.test((x.textContent||'').replace(/\\s+/g,' ')) && (x.textContent||'').replace(/\\s+/g,' ').trim().length<80);
      const inner=all.filter(c=>!all.some(o=>o!==c&&c.contains(o)));
      if(!inner.length) return {found:0};
      return inner.slice(0,2).map(e=>({txt:(e.textContent||'').replace(/\\s+/g,' ').trim().slice(0,44), ...strictVis(e)})); };
    return {
      startThisChannel: probe(/Start this channel/),
      addTeammates:     probe(/Add teammates before starting/),
      archivedBanner:   probe(/This channel is archived/),
      unarchiveHint:    probe(/Unarchive to send messages/),
      innerTextHasBoth: /Start this channel/.test((document.querySelector('main')||document.body).innerText||'')
                     && /This channel is archived/.test((document.querySelector('main')||document.body).innerText||'')
    }; })()`);
};
