import {VISFN, CLICKDEEPEST, WS, BASE} from './e-p2-helpers.mjs';
const boxVisFn = `const boxVis = el => { const r=el.getBoundingClientRect(); if(r.width<120||r.height<80) return false;
    let n=el,op=1; while(n&&n!==document.documentElement){const cs=getComputedStyle(n); if(cs.display==='none'||cs.visibility==='hidden')return false; op*=parseFloat(cs.opacity||'1'); n=n.parentElement;} return op>0.01; };`;
export default async ({page}) => {
  const out={}; const api=[];
  page.on('response', async r => { const u=r.url(); const m=r.request().method();
    if(u.includes('/api/v1/')&&m!=='GET') api.push(r.status()+' '+m+' '+u.split('/api/v1/')[1].slice(0,40)+' | req='+(r.request().postData()||'').slice(0,120)); });
  const openEdit = async () => {
    await page.goto(BASE+'/w/'+WS+'/calendar', {waitUntil:'domcontentloaded'});
    await page.waitForTimeout(8000);
    const chip = page.locator('[data-testid="calendar-event-chip"]').filter({hasText:'RESCHEDULED'}).first();
    await chip.scrollIntoViewIfNeeded(); await page.waitForTimeout(1000);
    await chip.click(); await page.waitForTimeout(4500);
    await page.evaluate(`(() => { ${VISFN} ${CLICKDEEPEST} ${boxVisFn}
       const d=[...document.querySelectorAll('[role=dialog]')].filter(boxVis).pop(); clickDeepest(d, /^Edit/); })()`);
    await page.waitForTimeout(4500);
  };
  const radios = `(() => { ${boxVisFn}
     const d=[...document.querySelectorAll('[role=dialog]')].filter(boxVis).pop();
     return [...d.querySelectorAll('input[type=radio]')].map(r=>r.value+'='+r.checked); })()`;
  const clickRadio = async (val) => {
    const t = await page.evaluate(`(() => { ${boxVisFn}
       const d=[...document.querySelectorAll('[role=dialog]')].filter(boxVis).pop();
       const inp=[...d.querySelectorAll('input[type=radio]')].find(r=>r.value==='${val}');
       const lab=inp.closest('label')||inp.parentElement; const r=lab.getBoundingClientRect();
       return {cx:Math.round(r.x+r.width/2), cy:Math.round(r.y+r.height/2)}; })()`);
    await page.mouse.move(t.cx,t.cy); await page.waitForTimeout(250);
    await page.mouse.down(); await page.waitForTimeout(120); await page.mouse.up();
    await page.waitForTimeout(1800);
  };
  await openEdit();
  out.persisted = await page.evaluate(radios);
  out.apiState = await page.evaluate(`(async () => {
     const r=await fetch('/api/v1/calendar/meetings/S4OWSESS9KOG8BT',{credentials:'include'});
     const t=await r.text(); const m=t.match(/"is_private"\\s*:\\s*(true|false)/);
     return {st:r.status, is_private:m?m[1]:'(field absent)'}; })()`);
  // restore to Public
  await clickRadio('public');
  out.afterRestoreClick = await page.evaluate(radios);
  api.length=0;
  await page.evaluate(`(() => { ${VISFN} ${CLICKDEEPEST} ${boxVisFn}
     const d=[...document.querySelectorAll('[role=dialog]')].filter(boxVis).pop(); clickDeepest(d, /^Save$/); })()`);
  await page.waitForTimeout(9000);
  out.restoreReq = api.slice(0,2);
  return out;
};
