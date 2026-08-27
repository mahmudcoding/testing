import {VISFN, CLICKDEEPEST, WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  const out={}; const api=[];
  page.on('response', async r => { const u=r.url(); const m=r.request().method();
    if(u.includes('/notification')&&m!=='GET') api.push(r.status()+' '+m+' '+u.split('/api/v1/')[1].slice(0,44)+' | '+(r.request().postData()||'(no body)').slice(0,70)); });
  await page.goto(BASE+'/w/'+WS+'/calendar', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(8000);
  const counts = `(async () => {
     const r=await fetch('/api/v1/notifications?limit=50',{credentials:'include'});
     const d=await r.json(); const a=d.notifications||[];
     return {total:a.length, unread:a.filter(n=>!n.read).length}; })()`;
  out.before = await page.evaluate(counts);
  await page.locator('button[aria-label^="Notifications"]').first().click();
  await page.waitForTimeout(3200);
  out.panel = await page.evaluate(`(() => { ${VISFN}
     const c=[...document.querySelectorAll('[role=dialog],[data-state=open],aside')]
       .filter(e=>{const r=e.getBoundingClientRect(); return r.width>200&&r.height>150;});
     const d=c.pop(); if(!d) return {none:true};
     const t=(d.innerText||'').replace(/\\s+/g,' ');
     return { head:t.slice(0,150),
              controls:[...new Set([...d.querySelectorAll('button')].filter(vis)
                .map(b=>(b.getAttribute('aria-label')||b.textContent||'').replace(/\\s+/g,' ').trim())
                .filter(x=>x && x.length<26))].slice(0,10) }; })()`);
  api.length=0;
  out.markAll = await page.evaluate(`(() => { ${VISFN} ${CLICKDEEPEST}
     const c=[...document.querySelectorAll('[role=dialog],[data-state=open],aside')]
       .filter(e=>{const r=e.getBoundingClientRect(); return r.width>200&&r.height>150;});
     return clickDeepest(c.pop()||document.body, /Mark all read/i); })()`);
  await page.waitForTimeout(6000);
  out.api = api.slice(0,3);
  out.after = await page.evaluate(counts);
  out.bell = await page.evaluate(`(() => { ${VISFN}
     const b=[...document.querySelectorAll('button')].filter(vis).find(x=>/^Notifications/.test(x.getAttribute('aria-label')||''));
     return b? b.getAttribute('aria-label'):'(none)'; })()`);
  return out;
};
