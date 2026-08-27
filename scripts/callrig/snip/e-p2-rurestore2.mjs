import {WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  await page.goto(`${BASE}/w/${WS}/settings/account`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(5500);
  const state = await page.evaluate(()=>{
    const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0;};
    const m=document.querySelector('main');
    const ctrl=[...m.querySelectorAll('button')].filter(vis)
      .find(e=>/Language|Язык/i.test(e.getAttribute('aria-label')||''));
    return {found:!!ctrl, label:ctrl?ctrl.getAttribute('aria-label'):null,
      value:ctrl?(ctrl.textContent||'').trim():null,
      mainHead:m.innerText.replace(/\s+/g,' ').slice(0,80)};
  });
  if(!state.found) return {state, note:'no language control'};
  await page.locator('main button').filter({hasText:new RegExp('^'+state.value+'$')}).first().click().catch(async()=>{
    await page.evaluate(()=>{
      const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0;};
      const c=[...document.querySelector('main').querySelectorAll('button')].filter(vis)
        .find(e=>/Language|Язык/i.test(e.getAttribute('aria-label')||'')); c&&c.click();
    });
  });
  await page.waitForTimeout(2500);
  const opts = await page.evaluate(()=>{
    const vis=e=>{let x=e,o=1;while(x&&x!==document.documentElement){const s=getComputedStyle(x);if(s.display==='none'||s.visibility==='hidden')return false;o*=parseFloat(s.opacity||'1');x=x.parentElement;}const r=e.getBoundingClientRect();return o>0.01&&r.width>0&&r.height>0;};
    const d=[...document.querySelectorAll('[role=dialog]')].filter(vis).pop();
    if(!d) return {noDialog:true};
    return {options:[...d.querySelectorAll('button')].filter(vis).map(e=>(e.textContent||'').replace(/\s+/g,' ').trim()).filter(Boolean).slice(0,10)};
  });
  return {state, opts};
};
