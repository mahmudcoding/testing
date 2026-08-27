import {VISFN, WS, BASE} from './e-p2-helpers.mjs';
const CO='O4QEF1XTURESO01';
export default async ({page}) => {
  await page.goto(BASE+'/w/'+WS+'/calendar', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(9000);
  const api = await page.evaluate(`(async () => {
     const g=async u=>{const r=await fetch(u,{credentials:'include'});return await r.json();};
     const a=await g('/api/v1/search?q=probe&company_id=${CO}&workspace_id=${WS}&limit=25');
     const b=await g('/api/v1/search?q=probe&company_id=${CO}&workspace_id=${WS}&limit=100');
     return {limit25:{total:a.total_messages, returned:(a.messages||[]).length},
             limit100:{total:b.total_messages, returned:(b.messages||[]).length}}; })()`);
  await page.evaluate(`(() => { ${VISFN}
     const b=[...document.querySelectorAll('button')].filter(vis).find(x=>/^Search /.test(x.getAttribute('aria-label')||''));
     if(b) b.click(); })()`);
  await page.waitForTimeout(2600);
  await page.keyboard.type('probe'); await page.waitForTimeout(5000);
  const t = await page.evaluate(`(() => { ${VISFN}
     const d=[...document.querySelectorAll('[role=dialog]')].filter(e=>e.getBoundingClientRect().width>300).pop();
     const b=[...d.querySelectorAll('[role=tab]')].filter(vis).find(x=>/^Messages/.test((x.innerText||'').trim()));
     const r=b.getBoundingClientRect(); return {cx:Math.round(r.x+r.width/2), cy:Math.round(r.y+r.height/2)}; })()`);
  await page.mouse.move(t.cx,t.cy); await page.waitForTimeout(300);
  await page.mouse.down(); await page.waitForTimeout(110); await page.mouse.up();
  await page.waitForTimeout(4000);
  const ui = await page.evaluate(`(() => { ${VISFN}
     const d=[...document.querySelectorAll('[role=dialog]')].filter(e=>e.getBoundingClientRect().width>300).pop();
     const tab=[...d.querySelectorAll('[role=tab]')].filter(vis).find(x=>/^Messages/.test((x.innerText||'').trim()));
     const opts=[...d.querySelectorAll('[role=option]')];
     const ids=opts.map(o=>(o.innerText||'').replace(/\\s+/g,' ').trim().slice(0,46));
     return {tabLabel:(tab.innerText||'').replace(/\\s+/g,' ').trim(),
             rowsRendered:opts.length, uniqueRows:[...new Set(ids)].length}; })()`);
  return {api, ui};
};
