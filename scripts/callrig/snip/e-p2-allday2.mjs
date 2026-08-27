import {WS, BASE} from './e-p2-helpers.mjs';
const snap = () => {
  const vis=e=>{let x=e,o=1;while(x&&x!==document.documentElement){const s=getComputedStyle(x);if(s.display==='none'||s.visibility==='hidden')return false;o*=parseFloat(s.opacity||'1');x=x.parentElement;}const r=e.getBoundingClientRect();return o>0.01&&r.width>0&&r.height>0;};
  const dialogs=[...document.querySelectorAll('[role=dialog]')].filter(vis);
  const d=dialogs.sort((a,b)=>b.innerText.length-a.innerText.length)[0];
  if(!d) return {noDialog:true, dialogCount:dialogs.length};
  return {dialogCount:dialogs.length,
    text:d.innerText.replace(/\s+/g,' ').slice(0,300),
    fields:[...d.querySelectorAll('input')].filter(vis)
      .map(e=>`${e.type}:${e.getAttribute('aria-label')||''}=${e.value}`.slice(0,44)),
    // the All-day control, however it is marked up
    allDay:[...d.querySelectorAll('*')].filter(e=>vis(e)&&/^All day$/i.test((e.textContent||'').trim()))
      .map(e=>{ const c=e.closest('button,label,[role=switch],[role=checkbox]')||e.parentElement;
        return {leafTag:e.tagName, ctrlTag:c?c.tagName:null, role:c?c.getAttribute('role'):null,
          checked:c?(c.getAttribute('aria-checked')??(c.querySelector('input')?c.querySelector('input').checked:null)):null,
          pressed:c?c.getAttribute('aria-pressed'):null};})};
};
export default async ({page}) => {
  await page.goto(`${BASE}/w/${WS}/calendar`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(6000);
  await page.locator('main button').filter({hasText:/^New meeting$/}).first().click();
  await page.waitForTimeout(3000);
  const before = await page.evaluate(snap);
  const ctrl = page.locator('[role=dialog]').last().getByText(/^All day$/).first();
  const found = await ctrl.count();
  if (found) await ctrl.click();
  await page.waitForTimeout(2500);
  const after = await page.evaluate(snap);
  // click again to toggle back
  if (found) { await ctrl.click(); await page.waitForTimeout(2000); }
  const back = await page.evaluate(snap);
  return {found, before, after, back};
};
