import {VISFN, WS, BASE} from './e-p2-helpers.mjs';
const boxVisFn = `const boxVis = el => { const r=el.getBoundingClientRect(); if(r.width<200||r.height<120) return false;
    let n=el,op=1; while(n&&n!==document.documentElement){const cs=getComputedStyle(n); if(cs.display==='none'||cs.visibility==='hidden')return false; op*=parseFloat(cs.opacity||'1'); n=n.parentElement;} return op>0.01; };`;
const mc = async (page, loc) => { try{ await loc.scrollIntoViewIfNeeded(); }catch(e){}
  await page.waitForTimeout(450); const b = await loc.boundingBox(); if(!b) return false;
  await page.mouse.move(b.x+b.width/2, b.y+b.height/2); await page.waitForTimeout(200);
  await page.mouse.down(); await page.waitForTimeout(110); await page.mouse.up(); return true; };
const TITLE='E2 series check 2258';
const LIST = `(async () => { const r = await fetch('/api/v1/calendar/meetings?workspace_id=${WS}&from=2026-08-24T00:00:00.000Z&to=2026-09-12T00:00:00.000Z',{credentials:'include'});
   const j = await r.json(); const arr = j.meetings||j.data||j.items||(Array.isArray(j)?j:[]);
   return arr.filter(m=>(m.title||'').indexOf('E2 series check')===0)
     .map(m=>({id:String(m.id).slice(-6), t:m.title, s:(m.starts_at||'').slice(0,16)}))
     .sort((a,b)=>a.s<b.s?-1:1).slice(0,9); })()`;
export default async ({page}) => {
  const out={}; const wire=[];
  page.on('request', r=>{ const u=r.url(); if(/\/api\/v1\/calendar\/meetings/.test(u)&&/PATCH|PUT|POST/.test(r.method()))
    wire.push(r.method()+' '+u.split('/api/v1/')[1].slice(0,58)+' :: '+((r.postData()||'').slice(0,200))); });
  await page.goto(BASE+'/w/'+WS+'/calendar', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(9000);
  out.before = await page.evaluate(LIST);
  if(!out.before.length) return out;
  // open the 2nd occurrence via its chip
  const target = out.before[1] || out.before[0];
  out.target = target;
  const day = target.s.slice(0,10);
  const chips = page.locator('button[data-testid="calendar-event-chip"]').filter({hasText:/E2 series check/});
  out.chipCount = await chips.count();
  await mc(page, chips.nth(Math.min(1, await chips.count()-1)));
  await page.waitForTimeout(3200);
  out.card = await page.evaluate(`(() => { ${boxVisFn}
     const d=[...document.querySelectorAll('[role=dialog]')].filter(boxVis).pop();
     return d?(d.innerText||'').replace(/\\s+/g,' ').slice(0,190):'(none)'; })()`);
  // click Edit
  await mc(page, page.locator('[role=dialog] button[aria-label="Edit"]').last());
  await page.waitForTimeout(3200);
  out.editDialog = await page.evaluate(`(() => { ${boxVisFn} ${VISFN}
     const d=[...document.querySelectorAll('[role=dialog]')].filter(boxVis).pop();
     if(!d) return {err:'no dialog'};
     const t=(d.innerText||'').replace(/\\s+/g,' ');
     const scope={};
     ['series','occurrence','repeat','this event','all events','only this','following'].forEach(k=>{scope[k]=new RegExp(k,'i').test(t);});
     const els=[...d.querySelectorAll('button,[role=combobox],input,label,textarea')]
       .map(x=>((x.getAttribute('aria-label')||x.textContent||'').trim().replace(/\\s+/g,' ').slice(0,26))).filter(Boolean);
     return {scope, els:[...new Set(els)].slice(0,16)}; })()`);
  // rename and save
  await page.evaluate(`(() => { ${boxVisFn}
     const d=[...document.querySelectorAll('[role=dialog]')].filter(boxVis).pop();
     const i=d.querySelector('input[data-field="event-title"]')||d.querySelector('input[type=text]');
     const s=Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype,'value').set;
     s.call(i,'E2 series RENAMED'); i.dispatchEvent(new Event('input',{bubbles:true})); })()`);
  await page.waitForTimeout(900); wire.length=0;
  await mc(page, page.locator('[role=dialog] button').filter({hasText:/^(Save|Save changes|Schedule meeting)$/}).last());
  await page.waitForTimeout(8000);
  out.saveWire = wire.slice(0,2);
  await page.keyboard.press('Escape'); await page.waitForTimeout(1500);
  await page.reload({waitUntil:'domcontentloaded'}); await page.waitForTimeout(9000);
  out.after = await page.evaluate(LIST);
  return out;
};
