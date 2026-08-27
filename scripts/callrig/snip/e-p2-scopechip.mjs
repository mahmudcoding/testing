import {VISFN, WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  const out={};
  await page.goto(BASE+'/w/'+WS+'/c/C4QEGENERAL0001', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(8500);
  await page.evaluate(`(() => { ${VISFN}
     const b=[...document.querySelectorAll('button')].filter(vis).find(x=>/^Search /.test(x.getAttribute('aria-label')||''));
     if(b) b.click(); })()`);
  await page.waitForTimeout(2600);
  await page.keyboard.type(':in #qa-general probe');
  await page.waitForTimeout(4500);
  out.dialogButtons = await page.evaluate(`(() => { ${VISFN}
     const d=[...document.querySelectorAll('[role=dialog]')].filter(e=>e.getBoundingClientRect().width>150).pop();
     return [...d.querySelectorAll('button')].filter(vis)
       .map(b=>'aria="'+((b.getAttribute('aria-label')||'').slice(0,34))+'" txt="'+((b.textContent||'').replace(/\\s+/g,' ').trim().slice(0,26))+'"')
       .filter(x=>!/Open (message|file|channel)/.test(x)).slice(0,16); })()`);
  out.removableChip = await page.evaluate(`(() => { ${VISFN}
     const d=[...document.querySelectorAll('[role=dialog]')].filter(e=>e.getBoundingClientRect().width>150).pop();
     const b=[...d.querySelectorAll('button')].filter(vis)
       .filter(x=>/Remove/i.test(x.getAttribute('aria-label')||''));
     return b.map(x=>({aria:x.getAttribute('aria-label'), txt:(x.textContent||'').trim().slice(0,30)})); })()`);
  // and does removing it widen the result set?
  const reqs=[];
  page.on('response', r=>{ if(r.url().includes('/api/v1/search')) reqs.push(decodeURIComponent(r.url()).split('/api/v1/')[1].slice(0,140)); });
  const before = await page.evaluate(`(() => { const d=[...document.querySelectorAll('[role=dialog]')].filter(e=>e.getBoundingClientRect().width>150).pop();
     const t=(d.innerText||'').replace(/\\s+/g,' '); const i=t.indexOf('Relevance'); return t.slice(i,i+60); })()`);
  out.before=before;
  const t = await page.evaluate(`(() => { ${VISFN}
     const d=[...document.querySelectorAll('[role=dialog]')].filter(e=>e.getBoundingClientRect().width>150).pop();
     const b=[...d.querySelectorAll('button')].filter(vis).find(x=>/Remove/i.test(x.getAttribute('aria-label')||''));
     if(!b) return {none:true}; const r=b.getBoundingClientRect();
     return {cx:Math.round(r.x+r.width/2), cy:Math.round(r.y+r.height/2)}; })()`);
  if(!t.none){ reqs.length=0;
    await page.mouse.move(t.cx,t.cy); await page.waitForTimeout(280);
    await page.mouse.down(); await page.waitForTimeout(130); await page.mouse.up();
    await page.waitForTimeout(4200);
    out.afterRemove = {req:reqs[reqs.length-1]||'(none)',
      tabs: await page.evaluate(`(() => { const d=[...document.querySelectorAll('[role=dialog]')].filter(e=>e.getBoundingClientRect().width>150).pop();
        const t=(d.innerText||'').replace(/\\s+/g,' '); const i=t.indexOf('Relevance'); return t.slice(i,i+60); })()`)}; }
  await page.keyboard.press('Escape');
  return out;
};
