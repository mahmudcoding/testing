import {VISFN, CLICKDEEPEST, WS, BASE} from './e-p2-helpers.mjs';
const boxVisFn = `const boxVis = el => { const r=el.getBoundingClientRect(); if(r.width<1||r.height<1) return false;
    let n=el,op=1; while(n&&n!==document.documentElement){const cs=getComputedStyle(n); if(cs.display==='none'||cs.visibility==='hidden')return false; op*=parseFloat(cs.opacity||'1'); n=n.parentElement;} return op>0.01; };`;
export default async ({page}) => {
  const out={}; const writes=[];
  page.on('response', async r=>{ const u=r.url(); if(u.includes('/api/v1/')&&r.request().method()!=='GET'){
    let b=''; try{b=(await r.text()).slice(0,150);}catch(e){}
    writes.push(r.request().method()+' '+u.replace(/^https:\/\/[^/]+/,'').slice(0,48)+' -> '+r.status()+' '+b); }});
  await page.goto(BASE+'/w/'+WS+'/c/C4QEGENERAL0001', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(6500);
  out.click = await page.evaluate(`(() => { ${VISFN} ${CLICKDEEPEST}
    return clickDeepest(document.body, /^New direct message$/); })()`);
  await page.waitForTimeout(4500);
  out.landedUrl = page.url().replace(/^https:\/\/[^/]+/,'');
  out.screen = await page.evaluate(`(() => { ${VISFN}
    const m=document.querySelector('main');
    return {text:(m.innerText||'').replace(/\\n+/g,' | ').slice(0,240),
      ctrls: interactives(m).map(x=>x.label.slice(0,24)).join(' | ').slice(0,260)}; })()`);
  writes.length=0;
  out.clickMessage = await page.evaluate(`(() => { ${VISFN} ${CLICKDEEPEST}
    const m=document.querySelector('main');
    // find the row for QA Bob and click its Message action
    const rows=[...m.querySelectorAll('div')].filter(d=>String(d.className).includes('min-h-16')&&/QA Bob/.test(d.innerText||''));
    const row=rows[rows.length-1]; if(!row) return 'no QA Bob row';
    return clickDeepest(row, /^Message$/); })()`);
  await page.waitForTimeout(6000);
  out.writes = writes.slice(0,3);
  out.afterUrl = page.url().replace(/^https:\/\/[^/]+/,'');
  out.sidebarDMs = await page.evaluate(`(() => { ${VISFN}
    return [...document.querySelectorAll('a[href*="/d/"]')].filter(vis).map(a=>(a.textContent||'').replace(/\\s+/g,' ').trim().slice(0,24)); })()`);
  return out;
};
