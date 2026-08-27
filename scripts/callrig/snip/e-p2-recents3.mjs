import {WS, BASE} from './e-p2-helpers.mjs';
const recents = () => {
  const vis=e=>{let x=e,o=1;while(x&&x!==document.documentElement){const s=getComputedStyle(x);if(s.display==='none'||s.visibility==='hidden')return false;o*=parseFloat(s.opacity||'1');x=x.parentElement;}const r=e.getBoundingClientRect();return o>0.01&&r.width>0&&r.height>0;};
  const d=[...document.querySelectorAll('[role=dialog]')].filter(vis)[0];
  if(!d) return null;
  const t=d.innerText.replace(/\s+/g,' ');
  const m=t.match(/RECENT SEARCHES (.*?)(?:↑↓|$)/);
  return m? m[1].trim().split(/\s+/).filter(Boolean).slice(0,10) : [];
};
async function run(page, q, thenEnter){
  await page.goto(`${BASE}/w/${WS}/c/C4QEGENERAL0001`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4500);
  await page.locator('[aria-label="Search QA Workspace E"]').first().click();
  await page.waitForTimeout(2200);
  const inp=page.locator('[role=dialog] input').first();
  await inp.click(); await inp.type(q,{delay:40});
  await page.waitForTimeout(4500);
  const hits = await page.evaluate(()=>{
    const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0;};
    const d=[...document.querySelectorAll('[role=dialog]')].filter(vis)[0];
    return (d.innerText.replace(/\s+/g,' ').match(/All (\d+)/)||[0,'?'])[1];
  });
  if (thenEnter) { await page.keyboard.press('Enter'); await page.waitForTimeout(3500);
    await page.goto(`${BASE}/w/${WS}/c/C4QEGENERAL0001`, {waitUntil:'domcontentloaded'});
    await page.waitForTimeout(4000);
    await page.locator('[aria-label="Search QA Workspace E"]').first().click();
    await page.waitForTimeout(2200); }
  else { await inp.fill(''); await page.waitForTimeout(1500); }
  return {q, results:hits, thenEnter, recents: await page.evaluate(recents)};
}
export default async ({page}) => ({
  withResults_noEnter: await run(page,'badge',false),
  withResults_enter:   await run(page,'muted',true),
});
