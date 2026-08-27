import {VISFN, WS, BASE} from './e-p2-helpers.mjs';
const boxVisFn = `const boxVis = el => { const r=el.getBoundingClientRect(); if(r.width<200||r.height<120) return false;
    let n=el,op=1; while(n&&n!==document.documentElement){const cs=getComputedStyle(n); if(cs.display==='none'||cs.visibility==='hidden')return false; op*=parseFloat(cs.opacity||'1'); n=n.parentElement;} return op>0.01; };`;
const mc = async (page, loc) => { try{ await loc.scrollIntoViewIfNeeded(); }catch(e){}
  await page.waitForTimeout(450); const b = await loc.boundingBox(); if(!b) return false;
  await page.mouse.move(b.x+b.width/2, b.y+b.height/2); await page.waitForTimeout(200);
  await page.mouse.down(); await page.waitForTimeout(110); await page.mouse.up(); return true; };
const TITLE='E2 series check '+process.env.QA_TAG;
export default async ({page}) => {
  const out={}; const wire=[];
  page.on('request', r=>{ const u=r.url();
    if(/\/api\/v1\/calendar\/meetings/.test(u)&&/POST|PATCH|PUT/.test(r.method()))
      wire.push(r.method()+' '+u.split('/api/v1/')[1].slice(0,55)+' :: '+((r.postData()||'').slice(0,260))); });
  await page.goto(BASE+'/w/'+WS+'/calendar', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(8500);
  // create a daily recurring meeting
  await page.getByRole('button',{name:'New meeting'}).first().click();
  await page.waitForTimeout(3800);
  await page.evaluate(`(() => { ${boxVisFn}
     const d=[...document.querySelectorAll('[role=dialog]')].filter(boxVis).pop();
     const i=d.querySelector('input[data-field="event-title"]')||d.querySelector('input[type=text]');
     const s=Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype,'value').set;
     s.call(i, ${JSON.stringify(TITLE)}); i.dispatchEvent(new Event('input',{bubbles:true})); })()`);
  await page.waitForTimeout(900);
  const rep = page.locator('button[role="combobox"]').filter({hasText:/Repeat|Does not repeat|Every/}).last();
  out.repFound = await rep.count();
  await mc(page, rep); await page.waitForTimeout(1800);
  out.repOpts = await page.evaluate(`(() => { ${VISFN}
     return [...document.querySelectorAll('[role=option],[role=menuitem],[role=menuitemradio]')].filter(vis)
       .map(x=>(x.textContent||'').trim().slice(0,26)).slice(0,10); })()`);
  await mc(page, page.locator('[role=option],[role=menuitem],[role=menuitemradio]').filter({hasText:/^\s*Every day/}).first());
  await page.waitForTimeout(1800);
  out.repAfter = (await rep.textContent()).trim();
  wire.length=0;
  await mc(page, page.locator('button').filter({hasText:/^Schedule meeting$/}).last());
  await page.waitForTimeout(8000);
  out.created = wire.slice(0,1);
  // list occurrences via API
  const list = `(async () => { const r = await fetch('/api/v1/calendar/meetings?workspace_id=${WS}&limit=100',{credentials:'include'});
     const j = await r.json(); const arr = j.meetings||j.data||j.items||[];
     return arr.filter(m=>(m.title||'').indexOf(${JSON.stringify(TITLE)})===0)
       .map(m=>({id:m.id, t:m.title, s:(m.starts_at||'').slice(0,16)}))
       .sort((a,b)=>a.s<b.s?-1:1).slice(0,8); })()`;
  out.before = await page.evaluate(list);
  return out;
};
