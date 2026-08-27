import {VISFN, WS, BASE} from './e-p2-helpers.mjs';
const boxVisFn = `const boxVis = el => { const r=el.getBoundingClientRect(); if(r.width<180||r.height<90) return false;
    let n=el,op=1; while(n&&n!==document.documentElement){const cs=getComputedStyle(n); if(cs.display==='none'||cs.visibility==='hidden')return false; op*=parseFloat(cs.opacity||'1'); n=n.parentElement;} return op>0.01; };`;
const mc = async (page, loc) => { try{ await loc.scrollIntoViewIfNeeded(); }catch(e){}
  await page.waitForTimeout(450); const b = await loc.boundingBox(); if(!b) return false;
  await page.mouse.move(b.x+b.width/2, b.y+b.height/2); await page.waitForTimeout(200);
  await page.mouse.down(); await page.waitForTimeout(110); await page.mouse.up(); return true; };
export default async ({page}) => {
  const out={};
  await page.goto(BASE+'/w/'+WS+'/calendar', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(9000);
  const chips = page.locator('button[data-testid="calendar-event-chip"]').filter({hasText:/E2 series check/});
  out.chipCount = await chips.count();
  if(!out.chipCount) return out;
  out.clicked = await mc(page, chips.nth(0));
  await page.waitForTimeout(3500);
  out.card = await page.evaluate(`(() => { ${boxVisFn} ${VISFN}
     const ds=[...document.querySelectorAll('[role=dialog]')].filter(boxVis);
     const d=ds.pop(); if(!d) return {err:'no dialog', nAll:document.querySelectorAll('[role=dialog]').length};
     const els=[...d.querySelectorAll('button,a,[role=menuitem]')].map(x=>{const b=x.getBoundingClientRect();
       return {al:(x.getAttribute('aria-label')||'').slice(0,30), tx:(x.textContent||'').trim().replace(/\\s+/g,' ').slice(0,30),
               vis:vis(x)?1:0, w:Math.round(b.width)};});
     return {text:(d.innerText||'').replace(/\\s+/g,' ').slice(0,200), n:els.length, els}; })()`);
  return out;
};
