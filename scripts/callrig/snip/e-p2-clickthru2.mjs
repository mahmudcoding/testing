import {VISFN, WS, BASE} from './e-p2-helpers.mjs';
const mc = async (page, loc) => { try{ await loc.scrollIntoViewIfNeeded(); }catch(e){}
  await page.waitForTimeout(400); const b=await loc.boundingBox(); if(!b) return false;
  await page.mouse.move(b.x+b.width/2,b.y+b.height/2); await page.waitForTimeout(200);
  await page.mouse.down(); await page.waitForTimeout(110); await page.mouse.up(); return true; };
const openSearch = async page => { await page.evaluate(`(() => { ${VISFN}
     const b=[...document.querySelectorAll('button')].filter(vis).find(x=>/^Search /.test(x.getAttribute('aria-label')||''));
     if(b) b.click(); })()`); await page.waitForTimeout(2600); };
export default async ({page}) => {
  const out={};
  for(const [tab, q] of [['Messages','unread'],['People','Bob'],['Channels','general'],['Files','normal']]){
    await page.goto(BASE+'/w/'+WS+'/c/C4QEGENERAL0001', {waitUntil:'domcontentloaded'});
    await page.waitForTimeout(7500);
    await openSearch(page);
    await page.keyboard.type(q); await page.waitForTimeout(4500);
    const t = page.locator('[role=dialog] [role=tab]').filter({hasText:new RegExp('^'+tab+'\\\\d*$')}).last();
    out[tab]={q, tabFound: await t.count()};
    if(out[tab].tabFound){ await mc(page, t); await page.waitForTimeout(2800); }
    const opts = page.locator('[role=dialog] [role=option]');
    out[tab].nOptions = await opts.count();
    if(!out[tab].nOptions){ out[tab].note='no result rows'; await page.keyboard.press('Escape'); continue; }
    out[tab].firstText = (await opts.nth(0).textContent()).trim().replace(/\s+/g,' ').slice(0,58);
    const urlBefore = page.url();
    await mc(page, opts.nth(0));
    await page.waitForTimeout(5500);
    out[tab].urlAfter = page.url().replace(BASE,'').slice(0,80);
    out[tab].navigated = page.url()!==urlBefore;
    out[tab].dialogClosed = await page.evaluate(`[...document.querySelectorAll('[role=dialog]')].filter(e=>e.getBoundingClientRect().width>300).length===0`);
    out[tab].mainNow = (await page.evaluate(`(document.querySelector('main').innerText||'').replace(/\\s+/g,' ').slice(0,110)`));
    await page.keyboard.press('Escape'); await page.waitForTimeout(1200);
  }
  return out;
};
