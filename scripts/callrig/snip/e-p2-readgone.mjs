import {VISFN, WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  const out={};
  await page.goto(BASE+'/w/'+WS+'/calendar', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(8000);
  out.variants = await page.evaluate(`(async () => {
    const qs=['?limit=50','?limit=50&read=true','?limit=50&status=read','?limit=50&filter=all',
              '?limit=50&include_read=true','?limit=50&unread_only=false',''];
    const o={};
    for(const q of qs){
      const r=await fetch('/api/v1/notifications'+q,{credentials:'include'});
      const t=await r.text(); let d=null; try{d=JSON.parse(t);}catch(e){ o[q||'(bare)']='status '+r.status+' '+t.slice(0,60); continue; }
      const a=d.notifications||[];
      o[q||'(bare)']={st:r.status, n:a.length, keys:Object.keys(d).join(','), unread:a.filter(x=>!x.read).length};
    }
    return o; })()`);
  await page.locator('button[aria-label^="Notifications"]').first().click();
  await page.waitForTimeout(3500);
  out.panel = await page.evaluate(`(() => { ${VISFN}
     const c=[...document.querySelectorAll('[role=dialog],[data-state=open],aside')]
       .filter(e=>{const r=e.getBoundingClientRect(); return r.width>200&&r.height>150;});
     const d=c.pop(); if(!d) return {none:true};
     return { text:(d.innerText||'').replace(/\\s+/g,' ').slice(0,220),
              controls:[...new Set([...d.querySelectorAll('button,[role=tab]')].filter(vis)
                .map(b=>(b.getAttribute('aria-label')||b.textContent||'').replace(/\\s+/g,' ').trim())
                .filter(x=>x&&x.length<30))].slice(0,10) }; })()`);
  await page.keyboard.press('Escape'); await page.waitForTimeout(1200);
  // and the mentions page, which had All/Unread tabs
  await page.goto(BASE+'/w/'+WS+'/chat/mentions', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(7000);
  out.mentions = await page.evaluate(`(() => { ${VISFN}
     const m=document.querySelector('main');
     return (m.innerText||'').replace(/\\s+/g,' ').slice(0,220); })()`);
  return out;
};
