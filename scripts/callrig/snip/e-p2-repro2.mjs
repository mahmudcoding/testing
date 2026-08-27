import {WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  await page.goto(`${BASE}/w/${WS}/c/C4QEGENERAL0001`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(5000);
  await page.locator('button[aria-label^="Notifications"]').first().click();
  await page.waitForTimeout(3000);
  const rows = await page.evaluate(()=>{
    const vis=e=>{let x=e,o=1;while(x&&x!==document.documentElement){const s=getComputedStyle(x);if(s.display==='none'||s.visibility==='hidden')return false;o*=parseFloat(s.opacity||'1');x=x.parentElement;}const r=e.getBoundingClientRect();return o>0.01&&r.width>0&&r.height>0;};
    const d=[...document.querySelectorAll('[role=dialog]')].filter(vis)
      .find(e=>[...e.querySelectorAll('button')].some(b=>/Mark all as read/i.test(b.textContent||'')));
    if(!d) return {noPanel:true};
    return {labels:[...d.querySelectorAll('button')].filter(vis)
      .map(e=>(e.getAttribute('aria-label')||'').trim()).filter(Boolean).slice(0,14)};
  });
  const inviteLabel = (rows.labels||[]).find(l=>/invitation|invited|пригла/i.test(l));
  let after=null;
  if (inviteLabel) {
    await page.locator(`[aria-label="${inviteLabel.replace(/"/g,'\\"')}"]`).first().click();
    await page.waitForTimeout(5000);
    after = await page.evaluate(()=>{
      const vis=e=>{let x=e,o=1;while(x&&x!==document.documentElement){const s=getComputedStyle(x);if(s.display==='none'||s.visibility==='hidden')return false;o*=parseFloat(s.opacity||'1');x=x.parentElement;}const r=e.getBoundingClientRect();return o>0.01&&r.width>0&&r.height>0;};
      const ds=[...document.querySelectorAll('[role=dialog]')].filter(vis);
      const d=ds[ds.length-1];
      const rsvp=[...document.querySelectorAll('button')].filter(vis)
        .filter(e=>/^(Yes|No)$/.test((e.textContent||'').trim()))
        .map(e=>({t:e.textContent.trim(), disabled:e.disabled}));
      return {url:location.pathname, cardText:d? d.innerText.replace(/\s+/g,' ').slice(0,110):'(no card)', rsvp};
    });
  }
  return {notificationLabels:(rows.labels||[]).slice(0,8), invitationRow:inviteLabel||null, after};
};
