import {VISFN, WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  const out={};
  await page.goto(BASE+'/w/'+WS+'/calendar', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(9000);
  const list = `(async () => { const r=await fetch('/api/v1/notifications?limit=50',{credentials:'include'});
     const d=await r.json(); const a=d.notifications||[];
     return {n:a.length, total:d.total, unread_count:d.unread_count,
             ids:a.map(x=>x.id.slice(-6)+(x.read?'(read)':''))}; })()`;
  out.freshLoad = await page.evaluate(list);          // does the read one come back after a reload?
  // now the Mentions page, as the counter-example
  await page.goto(BASE+'/w/'+WS+'/chat/mentions', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(8000);
  out.mentionsBefore = await page.evaluate(`(() => { ${VISFN}
     const m=document.querySelector('main'); const t=(m.innerText||'').replace(/\\s+/g,' ');
     return {tabs:(t.match(/All \\(\\d+\\)\\s*Unread \\(\\d+\\)/)||['(no tabs)'])[0], head:t.slice(0,170)}; })()`);
  // mark mentions read the way the page offers
  out.markCtl = await page.evaluate(`(() => { ${VISFN}
     return [...new Set([...document.querySelector('main').querySelectorAll('button')].filter(vis)
       .map(b=>(b.getAttribute('aria-label')||b.textContent||'').trim()).filter(x=>x&&x.length<26))].slice(0,10); })()`);
  const t = await page.evaluate(`(() => { ${VISFN}
     const b=[...document.querySelector('main').querySelectorAll('button')].filter(vis)
       .find(x=>/^Mark all read$/i.test((x.textContent||'').trim()));
     if(!b) return {none:true}; const r=b.getBoundingClientRect();
     return {cx:Math.round(r.x+r.width/2), cy:Math.round(r.y+r.height/2)}; })()`);
  if(!t.none){ await page.mouse.move(t.cx,t.cy); await page.waitForTimeout(300);
    await page.mouse.down(); await page.waitForTimeout(130); await page.mouse.up(); await page.waitForTimeout(6000); }
  out.mentionsAfter = await page.evaluate(`(() => { ${VISFN}
     const m=document.querySelector('main'); const t=(m.innerText||'').replace(/\\s+/g,' ');
     return {tabs:(t.match(/All \\(\\d+\\)\\s*Unread \\(\\d+\\)/)||['(no tabs)'])[0], head:t.slice(0,190)}; })()`);
  return out;
};
