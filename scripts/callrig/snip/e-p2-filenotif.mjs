import {VISFN, CLICKDEEPEST, WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  const out={};
  await page.goto(BASE+'/w/'+WS+'/chat/mentions', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(6000);
  out.api = await page.evaluate(`(async () => {
    const r=await fetch('/api/v1/notifications?limit=25',{credentials:'include'}); const t=await r.text();
    let d=null; try{d=JSON.parse(t);}catch(e){return {raw:t.slice(0,300)};}
    const a=(d.notifications||[]).filter(n=>/has_files/.test(n.payload||''));
    return { withFiles:a.length, rows:a.slice(0,3).map(n=>({title:n.title, body:n.body,
      payload:(n.payload||'').slice(0,150), event:n.event_type})) }; })()`);
  await page.locator('button[aria-label^="Notifications"]').first().click();
  await page.waitForTimeout(3500);
  out.bellRow = await page.evaluate(`(() => { ${VISFN}
    const rows=[...document.querySelectorAll('div,li,article')].filter(n=>vis(n)
      && /New channel message/.test(n.innerText||'') && (n.innerText||'').length<420);
    const inner=rows.filter(r=>!rows.some(o=>o!==r&&r.contains(o)));
    return inner.slice(0,3).map(r=>({ text:(r.innerText||'').replace(/\\s+/g,' ').slice(0,180),
      anchors:[...r.querySelectorAll('a[href]')].map(a=>a.getAttribute('href').slice(0,50)) })); })()`);
  // click the file notification and see where it lands
  out.click = await page.evaluate(`(() => { ${VISFN} ${CLICKDEEPEST}
    const rows=[...document.querySelectorAll('div,li,article')].filter(n=>vis(n)
      && /New channel message/.test(n.innerText||'') && /File/.test(n.innerText||'') && (n.innerText||'').length<420);
    const inner=rows.filter(r=>!rows.some(o=>o!==r&&r.contains(o)));
    if(!inner.length) return 'no file notification row';
    const el=inner[0]; el.click(); return 'clicked row: '+(el.innerText||'').replace(/\\s+/g,' ').slice(0,60); })()`);
  await page.waitForTimeout(7000);
  out.landedOn = page.url().replace(/^https:\/\/[^/]+/,'').slice(0,90);
  out.landedText = await page.evaluate(`(() => { ${VISFN}
     const m=document.querySelector('main'); const t=(m.innerText||'').replace(/\\s+/g,' ');
     const hl=[...m.querySelectorAll('[data-message-id]')].filter(vis).length;
     return {msgCount:hl, tail:t.slice(-220)}; })()`);
  return out;
};
