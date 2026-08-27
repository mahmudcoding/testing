import {VISFN, WS, BASE} from './e-p2-helpers.mjs';
const mc = async (page, loc) => { try{ await loc.scrollIntoViewIfNeeded(); }catch(e){}
  await page.waitForTimeout(400); const b=await loc.boundingBox(); if(!b) return false;
  await page.mouse.move(b.x+b.width/2,b.y+b.height/2); await page.waitForTimeout(200);
  await page.mouse.down(); await page.waitForTimeout(110); await page.mouse.up(); return true; };
export default async ({page}) => {
  const net=[];
  page.on('response', r=>{ const u=r.url(); if(/\/api\/v1\/(users\/me\/files|files)/.test(u))
    net.push(r.status()+' '+decodeURIComponent(u.split('/api/v1/')[1]).slice(0,120)); });
  await page.goto(BASE+'/w/'+WS+'/files', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(9000);
  const out={};
  net.length=0;
  const tab = page.locator('button,[role=tab],a').filter({hasText:/^Shared with me$/}).last();
  out.tabFound = await tab.count();
  out.clicked = await mc(page, tab);
  await page.waitForTimeout(6000);
  out.net = net.slice(0,4);
  out.screen = await page.evaluate(`(() => { ${VISFN}
     const m=document.querySelector('main');
     const t=(m.innerText||'').replace(/\\s+/g,' ');
     const btns=[...m.querySelectorAll('button')].filter(vis).map(b=>(b.getAttribute('aria-label')||b.textContent||'').trim().slice(0,24)).filter(Boolean);
     return {text:t.slice(0,300), nBtns:btns.length, btns:[...new Set(btns)].slice(0,14)}; })()`);
  return out;
};
