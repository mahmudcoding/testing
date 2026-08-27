import {VISFN, WS, BASE} from './e-p2-helpers.mjs';
const TOKEN = 'zqrx'+(process.env.QA_TAG||'0');
export default async ({page}) => {
  const out={TOKEN}; const reqs=[];
  page.on('response', r=>{ const u=r.url(); if(/\/api\/v1\/search/.test(u))
    reqs.push(decodeURIComponent(u.split('/api/v1/')[1]).slice(0,150)); });
  // post the unique token into qa-private (channel-2)
  await page.goto(BASE+'/w/'+WS+'/c/C4QEPRIVATE0001', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(9000);
  out.posted = await page.evaluate(`(async () => {
     const r=await fetch('/api/v1/messaging/messages',{method:'POST',credentials:'include',
       headers:{'Content-Type':'application/json'},
       body:JSON.stringify({channel_id:'C4QEPRIVATE0001', body:'full search control ${TOKEN}'})});
     return r.status; })()`);
  await page.waitForTimeout(4000);
  // now search from qa-general (channel-1)
  await page.goto(BASE+'/w/'+WS+'/c/C4QEGENERAL0001', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(9500);
  await page.evaluate(`(() => { ${VISFN}
     const b=[...document.querySelectorAll('button')].filter(vis).find(x=>/^Search /.test(x.getAttribute('aria-label')||''));
     if(b) b.click(); })()`);
  await page.waitForTimeout(2600); reqs.length=0;
  await page.keyboard.type(TOKEN); await page.waitForTimeout(6000);
  out.dialog = await page.evaluate(`(() => { ${VISFN}
     const d=[...document.querySelectorAll('[role=dialog]')].filter(e=>e.getBoundingClientRect().width>300).pop();
     const rows=[...d.querySelectorAll('[role=option]')].filter(vis)
       .map(e=>(e.innerText||'').replace(/\\s+/g,' ').trim().slice(0,52));
     return {tabs:[...d.querySelectorAll('[role=tab]')].filter(vis).map(e=>(e.innerText||'').replace(/\\s+/g,' ').trim()),
             rows}; })()`);
  out.reqInDialog = reqs.slice(-1);
  const t = await page.evaluate(`(() => { ${VISFN}
     const d=[...document.querySelectorAll('[role=dialog]')].filter(e=>e.getBoundingClientRect().width>300).pop();
     const b=[...d.querySelectorAll('button')].filter(vis).find(x=>/^Open full search$/.test((x.innerText||'').trim()));
     if(!b) return null; const r=b.getBoundingClientRect();
     return {cx:Math.round(r.x+r.width/2), cy:Math.round(r.y+r.height/2)}; })()`);
  if(t){ reqs.length=0;
    await page.mouse.move(t.cx,t.cy); await page.waitForTimeout(300);
    await page.mouse.down(); await page.waitForTimeout(110); await page.mouse.up();
    await page.waitForTimeout(6500);
    out.reqOnPage = reqs.slice(0,2);
    out.url = page.url().replace(BASE,'').slice(0,70);
    out.page = await page.evaluate(`(() => { ${VISFN}
       const m=document.querySelector('main'); const t=(m.innerText||'').replace(/\\s+/g,' ');
       return {tabs:(t.match(/All \\d+[^|]{0,60}/)||[''])[0],
               empty:(t.match(/No results[^.]*\\./)||[''])[0],
               rows:[...m.querySelectorAll('[role=option]')].filter(vis).length}; })()`); }
  return out;
};
