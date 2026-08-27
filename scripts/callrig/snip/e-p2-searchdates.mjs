import {VISFN, WS, BASE} from './e-p2-helpers.mjs';
const CO='O4QEF1XTURESO01';
export default async ({page}) => {
  await page.goto(BASE+'/w/'+WS+'/calendar', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(9000);
  // Does the client-side date-window filter use local or UTC? Probe with a synthetic cutoff:
  // search results carry created_at; check whether anything created "today local / yesterday UTC"
  // survives a Last-7-days filter, and confirm the chip state actually changes.
  const out = {};
  await page.evaluate(`(() => { ${VISFN}
     const b=[...document.querySelectorAll('button')].filter(vis).find(x=>/^Search /.test(x.getAttribute('aria-label')||''));
     if(b) b.click(); })()`);
  await page.waitForTimeout(2600);
  await page.keyboard.type('probe'); await page.waitForTimeout(5000);
  out.chips = await page.evaluate(`(() => { ${VISFN}
     const d=[...document.querySelectorAll('[role=dialog]')].filter(e=>e.getBoundingClientRect().width>300).pop();
     return [...d.querySelectorAll('button')].filter(vis)
       .filter(b=>/Last 7 days|Last 30 days|All time/.test((b.innerText||'').trim()))
       .map(b=>({tx:(b.innerText||'').trim(), pressed:b.getAttribute('aria-pressed'),
                 sel:b.getAttribute('aria-selected'), cls:(b.className||'').toString().slice(-40)})); })()`);
  out.counts = {};
  for(const chip of ['All time','Last 7 days','Last 30 days']){
    const t = await page.evaluate(`(() => { ${VISFN}
       const d=[...document.querySelectorAll('[role=dialog]')].filter(e=>e.getBoundingClientRect().width>300).pop();
       const b=[...d.querySelectorAll('button')].filter(vis).find(x=>(x.innerText||'').trim()===${JSON.stringify(chip)});
       if(!b) return null; const r=b.getBoundingClientRect();
       return {cx:Math.round(r.x+r.width/2), cy:Math.round(r.y+r.height/2)}; })()`);
    if(!t) { out.counts[chip]='chip not found'; continue; }
    await page.mouse.move(t.cx,t.cy); await page.waitForTimeout(250);
    await page.mouse.down(); await page.waitForTimeout(110); await page.mouse.up();
    await page.waitForTimeout(3200);
    out.counts[chip] = await page.evaluate(`(() => { ${VISFN}
       const d=[...document.querySelectorAll('[role=dialog]')].filter(e=>e.getBoundingClientRect().width>300).pop();
       const tabs=[...d.querySelectorAll('[role=tab]')].filter(vis).map(e=>(e.innerText||'').replace(/\\s+/g,' ').trim());
       const b=[...d.querySelectorAll('button')].filter(vis).find(x=>(x.innerText||'').trim()===${JSON.stringify(chip)});
       return {tabs, chipPressed:b?b.getAttribute('aria-pressed'):null}; })()`);
  }
  return out;
};
