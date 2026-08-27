import {VISFN, WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  const out={};
  out.me = await page.evaluate(`(async()=>{const r=await fetch('/api/v1/auth/me',{credentials:'include'});const j=await r.json().catch(()=>({}));return j?.email||'?';})()`);
  await page.goto(BASE+'/w/'+WS+'/chat/saved', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(7500);
  out.check = await page.evaluate(`(() => { ${VISFN}
    const re=/no message text|View all \\(|Start this channel|Add teammates|Pinned message/i;
    const all=[...document.querySelectorAll('*')].filter(n=>re.test(n.textContent||'') && (n.textContent||'').length<160);
    const leaves=all.filter(n=>![...all].some(o=>o!==n && n.contains(o)));
    return leaves.map(n=>{ const r=n.getBoundingClientRect();
      let a=n,op=1; while(a&&a!==document.documentElement){op*=parseFloat(getComputedStyle(a).opacity||'1');a=a.parentElement;}
      const hit=document.elementFromPoint(r.x+r.width/2, r.y+r.height/2);
      return {t:(n.textContent||'').replace(/\\s+/g,' ').trim().slice(0,46),
        rect:Math.round(r.width)+'x'+Math.round(r.height)+'@'+Math.round(r.y),
        chainOpacity:+op.toFixed(3), vis:vis(n),
        hitIsSelf: !!hit && (hit===n||n.contains(hit)||hit.contains(n))}; }).slice(0,8); })()`);
  out.visibleLeafText = await page.evaluate(`(() => { ${VISFN}
    const m=document.querySelector('main');
    const all=[...m.querySelectorAll('*')].filter(n=>n.children.length===0 && (n.textContent||'').trim());
    return all.filter(vis).map(n=>(n.textContent||'').replace(/\\s+/g,' ').trim().slice(0,40)).slice(0,20); })()`);
  return out;
};
