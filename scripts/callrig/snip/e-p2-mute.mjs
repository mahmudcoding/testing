import {VISFN, CLICKDEEPEST, WS, BASE} from './e-p2-helpers.mjs';
const boxVisFn = `const boxVis = el => { const r=el.getBoundingClientRect(); if(r.width<1||r.height<1) return false;
    let n=el,op=1; while(n&&n!==document.documentElement){const cs=getComputedStyle(n); if(cs.display==='none'||cs.visibility==='hidden')return false; op*=parseFloat(cs.opacity||'1'); n=n.parentElement;} return op>0.01; };`;
export default async ({page}) => {
  const out={}; const writes=[];
  page.on('response', async r=>{ const u=r.url(); if(u.includes('/api/v1/')&&r.request().method()!=='GET'){
    let b=''; try{b=(await r.text()).slice(0,140);}catch(e){}
    writes.push(r.request().method()+' '+u.replace(/^https:\/\/[^/]+/,'').slice(0,52)+' -> '+r.status()+' '+b); }});
  await page.goto(BASE+'/w/'+WS+'/c/C4QEGENERAL0001', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(7000);
  out.muteControl = await page.evaluate(`(() => { ${VISFN}
    const b=[...document.querySelectorAll('button')].filter(vis).find(x=>/mute/i.test(x.getAttribute('aria-label')||''));
    return b? b.getAttribute('aria-label')+' pressed='+(b.getAttribute('aria-pressed')??'-') : 'not found'; })()`);
  writes.length=0;
  out.click = await page.evaluate(`(() => { ${VISFN} ${CLICKDEEPEST}
    return clickDeepest(document.body, /Mute notifications|Unmute notifications/i); })()`);
  await page.waitForTimeout(3000);
  out.afterClickUI = await page.evaluate(`(() => { ${VISFN} ${boxVisFn}
    const d=[...document.querySelectorAll('[role=dialog],[role=menu],[data-radix-popper-content-wrapper]')].filter(boxVis).pop();
    const b=[...document.querySelectorAll('button')].filter(vis).find(x=>/mute/i.test(x.getAttribute('aria-label')||''));
    return {control: b? b.getAttribute('aria-label') : 'gone',
      popup: d? (d.innerText||'').replace(/\\n+/g,' | ').slice(0,200) : null,
      popupCtrls: d? interactives(d).map(x=>x.label.slice(0,24)).join(' | ').slice(0,200) : null}; })()`);
  out.writes = writes.slice(0,3);
  return out;
};
