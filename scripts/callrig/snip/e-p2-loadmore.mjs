import {VISFN, WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  const resp=[];
  page.on('response', async r=>{ const u=r.url();
    if(/\/api\/v1\/search/.test(u)){ let j=null; try{j=await r.json();}catch(e){}
      resp.push({url:decodeURIComponent(u.split('/api/v1/')[1]).slice(0,100),
                 total:j&&j.total_messages, got:j&&(j.messages||[]).length}); }});
  await page.goto(BASE+'/w/'+WS+'/calendar', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(9000);
  await page.evaluate(`(() => { ${VISFN}
     const b=[...document.querySelectorAll('button')].filter(vis).find(x=>/^Search /.test(x.getAttribute('aria-label')||''));
     if(b) b.click(); })()`);
  await page.waitForTimeout(2600);
  resp.length=0;
  await page.keyboard.type('probe'); await page.waitForTimeout(5500);
  const state = `(() => { ${VISFN}
     const d=[...document.querySelectorAll('[role=dialog]')].filter(e=>e.getBoundingClientRect().width>300).pop();
     const t=(d.innerText||'').replace(/\\s+/g,' ');
     const m=t.match(/Showing \\d+ results[^.]*\\.\\s*\\d+ total[^↑]*/);
     return {rows:[...d.querySelectorAll('[role=option]')].length,
             footer:m?m[0].trim().slice(0,70):null,
             hasLoadMore:[...d.querySelectorAll('button')].some(b=>/^Load more$/.test((b.innerText||'').trim()))}; })()`;
  // switch to the Messages tab first — Load more lives there, not on All
  const tb = await page.evaluate(`(() => { ${VISFN}
     const d=[...document.querySelectorAll('[role=dialog]')].filter(e=>e.getBoundingClientRect().width>300).pop();
     const b=[...d.querySelectorAll('[role=tab]')].filter(vis).find(x=>/^Messages/.test((x.innerText||'').trim()));
     if(!b) return null; const r=b.getBoundingClientRect();
     return {cx:Math.round(r.x+r.width/2), cy:Math.round(r.y+r.height/2)}; })()`);
  if(tb){ await page.mouse.move(tb.cx,tb.cy); await page.waitForTimeout(300);
    await page.mouse.down(); await page.waitForTimeout(110); await page.mouse.up();
    await page.waitForTimeout(4000); }
  const steps=[await page.evaluate(state)];
  for(let i=0;i<4;i++){
    const lm = page.locator('[role=dialog] button').filter({hasText:/^Load more$/}).last();
    if(!(await lm.count())) break;
    try{ await lm.scrollIntoViewIfNeeded(); }catch(e){}
    await page.waitForTimeout(500);
    const b=await lm.boundingBox(); if(!b) break;
    await page.mouse.move(b.x+b.width/2,b.y+b.height/2); await page.waitForTimeout(250);
    await page.mouse.down(); await page.waitForTimeout(110); await page.mouse.up();
    await page.waitForTimeout(3500);
    steps.push(await page.evaluate(state));
  }
  return {steps, searchResponses:resp.slice(0,5)};
};
