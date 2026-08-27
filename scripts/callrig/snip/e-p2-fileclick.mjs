import {VISFN, WS, BASE} from './e-p2-helpers.mjs';
const openSearch = async page => { await page.evaluate(`(() => { ${VISFN}
     const b=[...document.querySelectorAll('button')].filter(vis).find(x=>/^Search /.test(x.getAttribute('aria-label')||''));
     if(b) b.click(); })()`); await page.waitForTimeout(2600); };
export default async ({page}) => {
  const out={};
  for(const q of ['bob-shared','viewer','normal','tall']){
    const net=[]; const onResp = r=>{ const u=r.url(); if(/\/api\/v1\//.test(u)) net.push(r.request().method()+' '+r.status()+' '+decodeURIComponent(u.split('/api/v1/')[1]).slice(0,70)); };
    await page.goto(BASE+'/w/'+WS+'/calendar', {waitUntil:'domcontentloaded'});
    await page.waitForTimeout(7000);
    await openSearch(page);
    await page.keyboard.type(q); await page.waitForTimeout(4500);
    // locate the file row precisely
    const row = await page.evaluate(`(() => { ${VISFN}
       const d=[...document.querySelectorAll('[role=dialog]')].filter(e=>e.getBoundingClientRect().width>300).pop();
       const o=[...d.querySelectorAll('[role=option]')].filter(vis)
         .find(x=>/Open channel with file/.test(x.textContent||''));
       if(!o) return null; const r=o.getBoundingClientRect();
       return {tx:(o.textContent||'').trim().replace(/\\s+/g,' ').slice(0,54),
               cx:Math.round(r.x+r.width/2), cy:Math.round(r.y+r.height/2),
               sel:o.getAttribute('aria-selected'), cls:(o.className||'').slice(0,60)}; })()`);
    if(!row){ out[q]={note:'no file row'}; await page.keyboard.press('Escape'); continue; }
    // hover first: read the row's own hover/selected state to prove the pointer is on it
    await page.mouse.move(row.cx,row.cy); await page.waitForTimeout(700);
    const onHover = await page.evaluate(`(() => {
       const el=document.elementFromPoint(${row.cx},${row.cy});
       const o=el&&el.closest('[role=option]');
       return {hit:!!o, selNow:o?o.getAttribute('aria-selected'):null,
               same:o?/Open channel with file/.test(o.textContent||''):false}; })()`);
    const urlBefore = page.url();
    page.on('response', onResp); net.length=0;
    await page.mouse.down(); await page.waitForTimeout(120); await page.mouse.up();
    await page.waitForTimeout(5000);
    page.off('response', onResp);
    out[q]={row:row.tx, pointerOnRow:onHover, selBefore:row.sel,
      urlBefore:urlBefore.replace(BASE,'').slice(0,45), urlAfter:page.url().replace(BASE,'').slice(0,60),
      navigated: page.url()!==urlBefore,
      dialogStillOpen: await page.evaluate(`[...document.querySelectorAll('[role=dialog]')].filter(e=>e.getBoundingClientRect().width>300).length>0`),
      netAfterClick: net.slice(0,4)};
    await page.keyboard.press('Escape'); await page.waitForTimeout(1200);
  }
  return out;
};
