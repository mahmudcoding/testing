import {VISFN, WS, BASE} from './e-p2-helpers.mjs';
const mc = async (page, loc) => { try{ await loc.scrollIntoViewIfNeeded(); }catch(e){}
  await page.waitForTimeout(400); const b=await loc.boundingBox(); if(!b) return false;
  await page.mouse.move(b.x+b.width/2,b.y+b.height/2); await page.waitForTimeout(200);
  await page.mouse.down(); await page.waitForTimeout(110); await page.mouse.up(); return true; };
const openSearch = async page => { await page.evaluate(`(() => { ${VISFN}
     const b=[...document.querySelectorAll('button')].filter(vis).find(x=>/^Search /.test(x.getAttribute('aria-label')||''));
     if(b) b.click(); })()`); await page.waitForTimeout(2600); };
const dumpDlg = page => page.evaluate(`(() => { ${VISFN}
   const d=[...document.querySelectorAll('[role=dialog]')].filter(e=>e.getBoundingClientRect().width>300).pop();
   if(!d) return {err:'no dialog'};
   const t=(d.innerText||'').replace(/\\s+/g,' ');
   const btns=[...d.querySelectorAll('button,[role=option],[role=listitem],li')].filter(vis)
     .map(x=>(x.getAttribute('aria-label')||x.textContent||'').trim().replace(/\\s+/g,' ')).filter(Boolean);
   return {text:t.slice(0,260), items:[...new Set(btns)].slice(0,18)}; })()`);
export default async ({page}) => {
  const out={};
  await page.goto(BASE+'/w/'+WS+'/c/C4QEGENERAL0001', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(9000);
  // three distinct searches
  const terms=['alpha-recent-one','beta-recent-two','gamma-recent-three'];
  for(const t of terms){
    await openSearch(page);
    await page.keyboard.type(t); await page.waitForTimeout(3500);
    await page.keyboard.press('Enter'); await page.waitForTimeout(3000);
    await page.keyboard.press('Escape'); await page.waitForTimeout(1600);
  }
  // reopen empty and look for a recents list
  await openSearch(page);
  out.freshOpen = await dumpDlg(page);
  out.hasRecents = /recent/i.test(out.freshOpen.text||'') ||
                   terms.some(t=>JSON.stringify(out.freshOpen.items||[]).indexOf(t)>=0);
  await page.keyboard.press('Escape'); await page.waitForTimeout(1500);
  // after a full reload
  await page.reload({waitUntil:'domcontentloaded'}); await page.waitForTimeout(9000);
  await openSearch(page);
  out.afterReload = await dumpDlg(page);
  out.hasRecentsAfterReload = /recent/i.test(out.afterReload.text||'') ||
                   terms.some(t=>JSON.stringify(out.afterReload.items||[]).indexOf(t)>=0);
  await page.keyboard.press('Escape');
  return out;
};
