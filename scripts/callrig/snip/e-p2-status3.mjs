import {WS, BASE} from './e-p2-helpers.mjs';
const ids = () => {
  const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0;};
  return [...document.querySelectorAll('button,a,[role],li')].filter(vis)
    .map(e=>(e.getAttribute('aria-label')||e.textContent||'').replace(/\s+/g,' ').trim().slice(0,50));
};
export default async ({page}) => {
  await page.goto(`${BASE}/w/${WS}/c/C4QEGENERAL0001`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(5000);
  const before = await page.evaluate(ids);
  await page.locator('[aria-label="6 members"]').first().click();
  await page.waitForTimeout(3500);
  const after = await page.evaluate(ids);
  const b=new Set(before);
  const appeared=[...new Set(after.filter(x=>!b.has(x)))];
  const full = await page.evaluate(()=>{
    const t=document.body.innerText.replace(/\s+/g,' ');
    return {mentionsVacation:/Vacation/i.test(t), hasPalm:t.includes('🌴'),
      aliceContext:(t.match(/[^|]{0,40}QA Alice[^|]{0,60}/)||[''])[0].slice(0,110)};
  });
  return {appearedCount:appeared.length, appeared:appeared.slice(0,16), page:full};
};
