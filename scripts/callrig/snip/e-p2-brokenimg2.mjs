import {VISFN, WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  const out={};
  out.me = await page.evaluate(`(async()=>{const r=await fetch('/api/v1/auth/me',{credentials:'include'});const j=await r.json().catch(()=>({}));return j?.email||'?';})()`);
  await page.goto(BASE+'/w/'+WS+'/c/C4QEPRIVATE0001', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(8000);
  // scroll the message into view first
  await page.evaluate(`(() => { const m=[...document.querySelectorAll('[data-message-id]')].pop(); m && m.scrollIntoView({block:'center'}); })()`);
  await page.waitForTimeout(1500);
  out.detail = await page.evaluate(`(() => { ${VISFN}
    const m=[...document.querySelectorAll('[data-message-id]')].pop();
    if(!m) return 'no message';
    const img=m.querySelector('img');
    const mr=m.getBoundingClientRect();
    const res={ msgRect:Math.round(mr.x)+','+Math.round(mr.y)+' '+Math.round(mr.width)+'x'+Math.round(mr.height),
      msgVisible: vis(m), innerH: innerHeight,
      msgText:(m.innerText||'').replace(/\\s+/g,' ').trim().slice(0,80) };
    if(img){ const r=img.getBoundingClientRect(); const cs=getComputedStyle(img);
      const cx=r.x+r.width/2, cy=r.y+r.height/2;
      const hit=cx>=0&&cy>=0&&cx<=innerWidth&&cy<=innerHeight? document.elementFromPoint(cx,cy):null;
      let n=img,op=1; while(n&&n!==document.documentElement){op*=parseFloat(getComputedStyle(n).opacity||'1');n=n.parentElement;}
      res.img={ nat:img.naturalWidth+'x'+img.naturalHeight, complete:img.complete,
        rect:Math.round(r.x)+','+Math.round(r.y)+' '+Math.round(r.width)+'x'+Math.round(r.height),
        inViewport: r.y>=0 && r.y<innerHeight, display:cs.display, visibility:cs.visibility,
        chainOpacity:+op.toFixed(3), alt:img.getAttribute('alt'),
        hitTag: hit? hit.tagName+'.'+String(hit.className||'').slice(0,26):'(outside viewport)',
        hitIsImg: !!hit && (hit===img) }; }
    else res.img='no img element';
    // what leaf text is visible inside the message?
    res.visibleLeaves=[...m.querySelectorAll('*')].filter(n=>n.children.length===0&&(n.textContent||'').trim()).filter(vis)
      .map(n=>(n.textContent||'').replace(/\\s+/g,' ').trim().slice(0,36));
    return res; })()`);
  return out;
};
