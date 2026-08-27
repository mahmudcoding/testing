import {WS, BASE} from './e-p2-helpers.mjs';
const cards = () => {
  const vis=e=>{let x=e,o=1;while(x&&x!==document.documentElement){const s=getComputedStyle(x);if(s.display==='none'||s.visibility==='hidden')return false;o*=parseFloat(s.opacity||'1');x=x.parentElement;}const r=e.getBoundingClientRect();return o>0.01&&r.width>0&&r.height>0;};
  const ds=[...document.querySelectorAll('[role=dialog]')].filter(vis);
  const d=ds[ds.length-1];
  return {n:ds.length, text:d? d.innerText.replace(/\s+/g,' ').slice(0,160):null,
    buttons:d? [...d.querySelectorAll('button')].filter(vis).map(e=>(e.getAttribute('aria-label')||e.textContent||'').trim().slice(0,20)).filter(Boolean):[]};
};
export default async ({page}) => {
  await page.goto(`${BASE}/w/${WS}/calendar`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(6000);
  const chip = page.locator('main button').filter({hasText:/standup/i}).first();
  await chip.scrollIntoViewIfNeeded();
  await chip.click();                       // REAL click
  await page.waitForTimeout(4500);
  const card = await page.evaluate(cards);
  if(!card.n) return {card, note:'card did not open even with a real click'};
  const delBtn = page.locator('[role=dialog] [aria-label="Delete"], [role=dialog] [aria-label="Удалить"]').first();
  const hasDel = await delBtn.count();
  let confirm=null;
  if(hasDel){ await delBtn.click(); await page.waitForTimeout(2500); confirm = await page.evaluate(cards); }
  return {card, hasDeleteControl:hasDel>0, confirm,
    mentionsScope: confirm? /occurrence|вхожден|series|серии/i.test(confirm.text||'') : null};
};
