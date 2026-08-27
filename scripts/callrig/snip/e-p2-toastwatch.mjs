import {VISFN, WS, BASE} from './e-p2-helpers.mjs';
const SEC = Number(process.env.QA_SEC || 75);
export default async ({page}) => {
  await page.goto(BASE+'/w/'+WS+'/calendar', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(7000);
  const probe = `(() => { ${VISFN}
    // any VISIBLE transient: live regions, toast libraries, or a fixed-position node carrying text
    const cands=[...document.querySelectorAll('[role=status],[role=alert],[data-sonner-toast],[class*=toast],[class*=Toast],[class*=snackbar]')];
    const vis1=cands.filter(vis).map(e=>e.tagName+'['+(e.getAttribute('role')||'')+'] "'+(e.innerText||'').replace(/\\s+/g,' ').trim().slice(0,50)+'"').filter(x=>!x.endsWith('""'));
    const fixed=[...document.querySelectorAll('body > div, body > section')].filter(e=>{
      const cs=getComputedStyle(e); return (cs.position==='fixed') && vis(e) && (e.innerText||'').trim().length>0 && (e.innerText||'').length<160; })
      .map(e=>'FIXED "'+(e.innerText||'').replace(/\\s+/g,' ').trim().slice(0,50)+'"');
    const bell=[...document.querySelectorAll('button')].find(b=>/^Notifications/i.test(b.getAttribute('aria-label')||''));
    return {toasts:[...vis1,...fixed], bell: bell? bell.getAttribute('aria-label') : '?',
      vis: document.visibilityState, bodyKids: document.body.children.length}; })()`;
  const trace=[]; let last='';
  const n = Math.floor(SEC*1000/400);
  for (let i=0;i<n;i++){
    const s = await page.evaluate(probe);
    const line = 'bell['+s.bell+'] bk'+s.bodyKids+' toasts='+JSON.stringify(s.toasts);
    if (line!==last){ trace.push('t+'+String((i*0.4).toFixed(1)).padStart(5,'0')+'s vis='+s.vis+'  '+line); last=line; }
    await page.waitForTimeout(400);
  }
  return {transitions: trace.slice(0,14), samples:n};
};
