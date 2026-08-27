import {WS, BASE} from './e-p2-helpers.mjs';
const read = () => {
  const vis=e=>{let x=e,o=1;while(x&&x!==document.documentElement){const s=getComputedStyle(x);if(s.display==='none'||s.visibility==='hidden')return false;o*=parseFloat(s.opacity||'1');x=x.parentElement;}const r=e.getBoundingClientRect();return o>0.01&&r.width>0&&r.height>0;};
  const btns=[...document.querySelectorAll('button')].filter(vis)
    .filter(e=>/^(Yes|No)$/.test((e.textContent||'').trim()))
    .map(e=>({t:e.textContent.trim(), pressed:e.getAttribute('aria-pressed'), disabled:e.disabled}));
  return {rsvp:btns};
};
export default async ({page}) => {
  // open the invitee meeting from the calendar GRID (not by its own link)
  await page.goto(`${BASE}/w/${WS}/calendar`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(6000);
  const opened = await page.evaluate(()=>{
    const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0;};
    const c=[...document.querySelectorAll('button')].filter(vis)
      .find(e=>/Invite seam 2334/.test(e.textContent||''));
    if(!c) return false; c.scrollIntoView({block:'center'}); c.click(); return true;
  });
  await page.waitForTimeout(4000);
  const before = await page.evaluate(read);
  let afterClick=null, afterReload=null;
  if (before.rsvp.length) {
    const yes = page.locator('button').filter({hasText:/^Yes$/}).first();
    if (!(await yes.isDisabled())) {
      await yes.click(); await page.waitForTimeout(3500);
      afterClick = await page.evaluate(read);
      await page.reload({waitUntil:'domcontentloaded'}); await page.waitForTimeout(6000);
      await page.evaluate(()=>{
        const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0;};
        const c=[...document.querySelectorAll('button')].filter(vis)
          .find(e=>/Invite seam 2334/.test(e.textContent||''));
        c&&c.scrollIntoView({block:'center'}); c&&c.click();
      });
      await page.waitForTimeout(4000);
      afterReload = await page.evaluate(read);
    }
  }
  return {openedFromGrid:opened, before, afterClick, afterReload};
};
