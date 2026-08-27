import {VISFN, CLICKDEEPEST, BASE} from './e-p2-helpers.mjs';
const WS2='W4OWJSPNXQJYZ5R';
const boxVisFn = `const boxVis = el => { const r=el.getBoundingClientRect(); if(r.width<120||r.height<80) return false;
    let n=el,op=1; while(n&&n!==document.documentElement){const cs=getComputedStyle(n); if(cs.display==='none'||cs.visibility==='hidden')return false; op*=parseFloat(cs.opacity||'1'); n=n.parentElement;} return op>0.01; };`;
export default async ({page}) => {
  const out={}; const errs=[], http=[];
  page.on('pageerror', e=>errs.push(String(e).slice(0,120)));
  page.on('response', r=>{ if(r.url().includes('/api/v1/')&&r.status()>=400)
    http.push(r.status()+' '+r.request().method()+' '+r.url().split('/api/v1/')[1].slice(0,46)); });
  const look = async (path,label) => { await page.goto(BASE+path,{waitUntil:'domcontentloaded'});
    await page.waitForTimeout(8500);
    return {label, text: await page.evaluate(`(() => ((document.querySelector('main')||document.body).innerText||'').replace(/\\s+/g,' ').slice(0,170))()`)}; };
  out.people   = await look('/w/'+WS2+'/directories?tab=people','people');
  out.channels = await look('/w/'+WS2+'/directories?tab=channels','channels');
  out.files    = await look('/w/'+WS2+'/files','files');
  out.calendar = await look('/w/'+WS2+'/calendar','calendar');
  // create a meeting in the fresh workspace
  await page.getByRole('button',{name:'New meeting'}).first().click();
  await page.waitForTimeout(3400);
  await page.locator('input[data-field="event-title"]').first().fill('QA-E ws2 smoke');
  await page.locator('input[data-field="event-start"]').first().fill('2026-09-15'); await page.waitForTimeout(350);
  await page.locator('input[data-field="event-start-time"]').first().fill('10:00'); await page.waitForTimeout(350);
  await page.locator('input[data-field="event-end"]').first().fill('2026-09-15'); await page.waitForTimeout(350);
  await page.locator('input[data-field="event-end-time"]').first().fill('10:30'); await page.waitForTimeout(800);
  const posts=[];
  page.on('response', async r=>{ if(r.url().includes('/api/v1/calendar/meetings')&&r.request().method()==='POST')
    posts.push(r.status()); });
  await page.evaluate(`(() => { ${VISFN} ${CLICKDEEPEST} ${boxVisFn}
     const d=[...document.querySelectorAll('[role=dialog]')].filter(boxVis).pop();
     clickDeepest(d, /^Schedule meeting$/); })()`);
  await page.waitForTimeout(8000);
  out.created = {status:posts[0]||'(none)'};
  // verify it lands in the right workspace and NOT the other
  out.inWs2 = await page.evaluate(`(async () => {
     const r=await fetch('/api/v1/calendar/meetings?workspace_id=${WS2}&from=2026-09-01T00:00:00Z&to=2026-09-30T00:00:00Z',{credentials:'include'});
     const d=await r.json(); const a=d.meetings||[];
     return {n:a.length, mine:a.filter(m=>/ws2 smoke/.test(m.title||'')).length}; })()`);
  out.inWs1 = await page.evaluate(`(async () => {
     const r=await fetch('/api/v1/calendar/meetings?workspace_id=W4QEF1XTURESO01&from=2026-09-01T00:00:00Z&to=2026-09-30T00:00:00Z',{credentials:'include'});
     const d=await r.json(); const a=d.meetings||[];
     return {n:a.length, leaked:a.filter(m=>/ws2 smoke/.test(m.title||'')).length}; })()`);
  out.pageErrors=[...new Set(errs)].slice(0,3);
  out.httpErrors=[...new Set(http)].slice(0,4);
  return out;
};
