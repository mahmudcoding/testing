import {VISFN, CLICKDEEPEST, WS, BASE} from './e-p2-helpers.mjs';
const sidebar = `(() => { ${VISFN}
  return [...document.querySelectorAll('a[href*="/c/"]')].filter(vis).map(a=>(a.textContent||'').replace(/\\s+/g,' ').trim().slice(0,22)); })()`;
export default async ({page}) => {
  const out={}; const writes=[];
  page.on('response', async r=>{ const u=r.url(); if(u.includes('/api/v1/')&&r.request().method()!=='GET'){
    let b=''; try{b=(await r.text()).slice(0,150);}catch(e){}
    writes.push(r.request().method()+' '+u.replace(/^https:\/\/[^/]+/,'').slice(0,55)+' -> '+r.status()+' '+b); }});
  await page.goto(BASE+'/w/'+WS+'/directories?tab=channels', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(6500);
  out.me = await page.evaluate(`(async()=>{const r=await fetch('/api/v1/auth/me',{credentials:'include'});const j=await r.json().catch(()=>({}));return j?.email||'?';})()`);
  out.sidebarBefore = await page.evaluate(sidebar);
  out.rowsBefore = await page.evaluate(`(() => { ${VISFN}
    const m=document.querySelector('main'); return (m.innerText||'').replace(/\\n+/g,' | ').slice(0,220); })()`);
  writes.length=0;
  out.clickJoin = await page.evaluate(`(() => { ${VISFN} ${CLICKDEEPEST}
    const m=document.querySelector('main');
    // the row for qa-empty
    const rows=[...m.querySelectorAll('*')].filter(n=>/qa-empty/.test(n.textContent||'')&&(n.textContent||'').length<90&&n.querySelectorAll('button').length);
    const row=rows[rows.length-1]; if(!row) return 'no qa-empty row';
    return clickDeepest(row, /^Join$/); })()`);
  await page.waitForTimeout(5000);
  out.writes = writes.slice(0,3);
  out.sidebarAfter = await page.evaluate(sidebar);
  out.rowsAfter = await page.evaluate(`(() => { ${VISFN}
    const m=document.querySelector('main'); return (m.innerText||'').replace(/\\n+/g,' | ').slice(0,220); })()`);
  await page.reload({waitUntil:'domcontentloaded'}); await page.waitForTimeout(6500);
  out.sidebarAfterReload = await page.evaluate(sidebar);
  return out;
};
