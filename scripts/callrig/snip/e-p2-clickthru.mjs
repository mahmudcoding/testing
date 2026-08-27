import {VISFN, WS, BASE} from './e-p2-helpers.mjs';
const mc = async (page, loc) => { try{ await loc.scrollIntoViewIfNeeded(); }catch(e){}
  await page.waitForTimeout(400); const b=await loc.boundingBox(); if(!b) return false;
  await page.mouse.move(b.x+b.width/2,b.y+b.height/2); await page.waitForTimeout(200);
  await page.mouse.down(); await page.waitForTimeout(110); await page.mouse.up(); return true; };
const openSearch = async page => { await page.evaluate(`(() => { ${VISFN}
     const b=[...document.querySelectorAll('button')].filter(vis).find(x=>/^Search /.test(x.getAttribute('aria-label')||''));
     if(b) b.click(); })()`); await page.waitForTimeout(2600); };
const results = page => page.evaluate(`(() => { ${VISFN}
   const d=[...document.querySelectorAll('[role=dialog]')].filter(e=>e.getBoundingClientRect().width>300).pop();
   if(!d) return [];
   const tabs=['All','Messages','Channels','People','Files','Relevance','Last 7 days','Last 30 days','All time','Open full search'];
   return [...d.querySelectorAll('button,[role=option],a,li')].filter(vis)
     .map(x=>({tx:(x.textContent||'').trim().replace(/\\s+/g,' ').slice(0,60)}))
     .filter(x=>x.tx && !tabs.includes(x.tx)).slice(0,10); })()`);
export default async ({page}) => {
  const out={};
  for(const [tab, q] of [['Messages','unread'],['People','QA Bob'],['Channels','qa-general'],['Files','normal']]){
    await page.goto(BASE+'/w/'+WS+'/c/C4QEGENERAL0001', {waitUntil:'domcontentloaded'});
    await page.waitForTimeout(7500);
    await openSearch(page);
    await page.keyboard.type(q); await page.waitForTimeout(4200);
    const t = page.locator('[role=dialog] button').filter({hasText:new RegExp('^'+tab+'$')}).last();
    if(await t.count()) { await mc(page, t); await page.waitForTimeout(2600); }
    const before = await results(page);
    const urlBefore = page.url();
    const first = page.locator('[role=dialog] button,[role=dialog] [role=option],[role=dialog] a')
      .filter({hasText:/\S/}).nth(0);
    // pick the first result-looking row rather than a chrome control
    const rows = await page.evaluate(`(() => { ${VISFN}
       const d=[...document.querySelectorAll('[role=dialog]')].filter(e=>e.getBoundingClientRect().width>300).pop();
       const tabs=['All','Messages','Channels','People','Files','Relevance','Last 7 days','Last 30 days','All time','Open full search','ESC'];
       const c=[...d.querySelectorAll('button,[role=option],a,li')].filter(vis)
         .filter(x=>{const tx=(x.textContent||'').trim().replace(/\\s+/g,' '); return tx && !tabs.includes(tx) && tx.length>3;});
       if(!c.length) return null; const r=c[0].getBoundingClientRect();
       return {tx:(c[0].textContent||'').trim().replace(/\\s+/g,' ').slice(0,60), cx:Math.round(r.x+r.width/2), cy:Math.round(r.y+r.height/2)}; })()`);
    if(rows){
      await page.mouse.move(rows.cx,rows.cy); await page.waitForTimeout(220);
      await page.mouse.down(); await page.waitForTimeout(110); await page.mouse.up();
      await page.waitForTimeout(5000);
    }
    out[tab]={q, nResults:before.length, firstResult:rows?rows.tx:'(none)',
      urlBefore:urlBefore.replace(BASE,'').slice(0,60), urlAfter:page.url().replace(BASE,'').slice(0,70),
      navigated: rows ? page.url()!==urlBefore : null,
      dialogClosed: await page.evaluate(`[...document.querySelectorAll('[role=dialog]')].filter(e=>e.getBoundingClientRect().width>300).length===0`)};
    await page.keyboard.press('Escape'); await page.waitForTimeout(1200);
  }
  return out;
};
