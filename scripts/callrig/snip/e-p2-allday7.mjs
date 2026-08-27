import {WS, BASE} from './e-p2-helpers.mjs';
async function run(page, i){
  await page.goto(`${BASE}/w/${WS}/calendar`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(5500);
  await page.locator('main button').filter({hasText:/^New meeting$/}).first().click();
  await page.waitForTimeout(2800);
  const dlg=page.locator('[role=dialog]').last();
  await dlg.locator('input[aria-label="Add title"]').fill(`QA-E allday repro ${i}`);
  await dlg.getByText(/^All day$/).first().click();
  await page.waitForTimeout(1600);
  const visible = await page.evaluate(()=>{
    const vis=e=>{let x=e,o=1;while(x&&x!==document.documentElement){const s=getComputedStyle(x);if(s.display==='none'||s.visibility==='hidden')return false;o*=parseFloat(s.opacity||'1');x=x.parentElement;}const r=e.getBoundingClientRect();return o>0.01&&r.width>0&&r.height>0;};
    const d=[...document.querySelectorAll('[role=dialog]')].filter(vis).pop();
    const t=[...d.querySelectorAll('input[type=time]')].filter(vis);
    return {timeInputsVisible:t.length, values:t.map(e=>e.value),
      hitTestIsSelf: t.map(e=>{const r=e.getBoundingClientRect();
        const h=document.elementFromPoint(Math.round(r.x+r.width/2),Math.round(r.y+r.height/2));
        return !!h && (e===h||e.contains(h)||h.contains(e));}),
      labelsShown:(d.innerText.match(/When[\s\S]{0,40}/)||[''])[0].replace(/\s+/g,' ')};
  });
  const posts=[]; const h=r=>{const rq=r.request(); if(rq.method()==='POST'&&/\/calendar\/meetings/.test(rq.url())) posts.push(r.status());};
  page.on('response',h);
  await dlg.locator('button[type=submit]').last().click();
  await page.waitForTimeout(5000);
  page.off('response',h);
  const res=await page.evaluate(()=>{
    const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0;};
    return {dialogOpen: !!([...document.querySelectorAll('[role=dialog]')].filter(vis).pop()),
      toast:[...document.querySelectorAll('[role=status],[role=alert]')].filter(vis)
        .map(e=>(e.textContent||'').trim()).filter(Boolean).slice(0,2)};
  });
  return {run:i, allDayFormState:visible, postsSent:posts.length, result:res};
}
export default async ({page}) => ({ r1: await run(page,1), r2: await run(page,2) });
