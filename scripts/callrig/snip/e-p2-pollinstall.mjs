import {VISFN, WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  await page.goto(BASE+'/w/'+WS+'/calendar', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(8000);
  return await page.evaluate(`(() => {
    if (window.__pollTimer) clearInterval(window.__pollTimer);
    window.__poll=[];
    const vis = el => { const r=el.getBoundingClientRect(); if(r.width<1||r.height<1) return false;
      let n=el,op=1; while(n&&n!==document.documentElement){const cs=getComputedStyle(n);
        if(cs.display==='none'||cs.visibility==='hidden')return false; op*=parseFloat(cs.opacity||'1'); n=n.parentElement;} return op>0.01; };
    const t0=performance.now();
    window.__pollTimer=setInterval(async ()=>{
      let n=null;
      try{ const r=await fetch('/api/v1/notifications?limit=3',{credentials:'include'});
           const d=await r.json(); const a=d.notifications||[];
           n={count:a.length, top:(a[0]?.event_type||'')+' :: '+((a[0]?.body||'').slice(0,70))}; }catch(e){}
      const toasts=[...document.querySelectorAll('[role=alert],[role=status],[data-sonner-toast]')].filter(vis)
        .map(x=>(x.innerText||'').replace(/\\s+/g,' ').trim()).filter(Boolean);
      const chips=[...document.querySelectorAll('[data-testid="calendar-event-chip"]')]
        .map(c=>(c.innerText||'').replace(/\\s+/g,' ').trim()).filter(x=>/invite body probe/i.test(x));
      window.__poll.push({t:Math.round(performance.now()-t0), n, toasts, chips});
      if(window.__poll.length>400) window.__poll.shift();
    }, 300);
    return 'poller installed';
  })()`);
};
