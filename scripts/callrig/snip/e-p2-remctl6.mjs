import {VISFN, WS, BASE} from './e-p2-helpers.mjs';
const boxVisFn = `const boxVis = el => { const r=el.getBoundingClientRect(); if(r.width<120||r.height<80) return false;
    let n=el,op=1; while(n&&n!==document.documentElement){const cs=getComputedStyle(n); if(cs.display==='none'||cs.visibility==='hidden')return false; op*=parseFloat(cs.opacity||'1'); n=n.parentElement;} return op>0.01; };`;
export default async ({page}) => {
  const out={}; const posts=[];
  page.on('response', r => { if(r.url().includes('/api/v1/calendar/meetings')&&r.request().method()==='POST')
    posts.push((r.request().postData()||'').slice(0,420)); });
  await page.goto(BASE+'/w/'+WS+'/calendar', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(8500);
  await page.getByRole('button',{name:'New meeting'}).first().click();
  await page.waitForTimeout(3400);
  await page.locator('input[data-field="event-title"]').first().fill('QA-E rem check');
  const findSpan = `(() => { ${boxVisFn}
     const d=[...document.querySelectorAll('[role=dialog]')].filter(boxVis).pop();
     const els=[...d.querySelectorAll('span')].filter(x=>/^(No reminder|\\d+ minutes? before|1 hour before)$/.test((x.textContent||'').trim()));
     if(!els.length) return null; const e=els[0]; e.scrollIntoView({block:'center'}); return (e.textContent||'').trim(); })()`;
  out.shownBefore = await page.evaluate(findSpan);
  await page.waitForTimeout(1200);
  const box = await page.evaluate(`(() => { ${boxVisFn}
     const d=[...document.querySelectorAll('[role=dialog]')].filter(boxVis).pop();
     const e=[...d.querySelectorAll('span')].filter(x=>/^(No reminder|\\d+ minutes? before|1 hour before)$/.test((x.textContent||'').trim()))[0];
     const trig=e.closest('button')||e.closest('[role=combobox]')||e.parentElement;
     const r=trig.getBoundingClientRect();
     return {trigTag:trig.tagName, trigRole:trig.getAttribute('role'), expanded:trig.getAttribute('aria-expanded'),
             cx:Math.round(r.x+r.width/2), cy:Math.round(r.y+r.height/2)}; })()`);
  out.trigger=box;
  await page.mouse.move(box.cx, box.cy); await page.waitForTimeout(400);
  await page.mouse.down(); await page.waitForTimeout(140); await page.mouse.up();
  await page.waitForTimeout(3000);
  out.menu = await page.evaluate(`(() => { ${VISFN}
     return [...new Set([...document.querySelectorAll('*')].filter(vis)
       .map(n=>(n.textContent||'').replace(/\\s+/g,' ').trim())
       .filter(t=>/^(\\d+ minutes? before|1 hour before|No reminder)$/.test(t)))].slice(0,8); })()`);
  // pick "15 minutes before"
  const opt = await page.evaluate(`(() => { ${VISFN}
     const els=[...document.querySelectorAll('*')].filter(vis)
       .filter(x=>/^15 minutes before$/.test((x.textContent||'').trim()));
     const inner=els.filter(c=>!els.some(o=>o!==c&&c.contains(o)));
     if(!inner.length) return {none:true}; const r=inner[0].getBoundingClientRect();
     return {cx:Math.round(r.x+r.width/2), cy:Math.round(r.y+r.height/2)}; })()`);
  out.optTarget=opt;
  if(!opt.none){ await page.mouse.move(opt.cx,opt.cy); await page.waitForTimeout(300);
    await page.mouse.down(); await page.waitForTimeout(130); await page.mouse.up(); await page.waitForTimeout(2500); }
  out.shownAfter = await page.evaluate(findSpan);
  return out;
};
