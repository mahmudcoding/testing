import {WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  const out={};
  // finding 9's step names "Job title" and "Department" in Settings -> Profile
  await page.goto(`${BASE}/w/${WS}/settings/profile`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(5000);
  out.profileLabels = await page.evaluate(()=>{
    const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0;};
    const m=document.querySelector('main');
    return [...m.querySelectorAll('input')].filter(vis).map(e=>{
      let lab=null;
      if(e.id){const l=document.querySelector('label[for="'+CSS.escape(e.id)+'"]'); if(l) lab=l.textContent.trim();}
      if(!lab){const w=e.closest('label'); if(w) lab=w.textContent.trim();}
      if(!lab){let n=e.parentElement; for(let i=0;i<3&&n;i++){const t=(n.innerText||'').split('\n')[0].trim(); if(t&&t.length<30){lab=t;break;} n=n.parentElement;}}
      return {label:(lab||'(none)').slice(0,26), value:(e.value||'').slice(0,20)};
    });
  });
  // finding 2's step names "Selected (1)" in the attendee picker
  await page.goto(`${BASE}/w/${WS}/calendar`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(5500);
  await page.locator('main button').filter({hasText:/^New meeting$/}).first().click();
  await page.waitForTimeout(3000);
  const pick = page.locator('[role=dialog] button').filter({hasText:/^QA Bob$/}).first();
  if (await pick.count()) { await pick.click(); await page.waitForTimeout(1800); }
  out.attendeePicker = await page.evaluate(()=>{
    const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0;};
    const d=[...document.querySelectorAll('[role=dialog]')].filter(vis).pop();
    const t=d.innerText.replace(/\s+/g,' ');
    return {hasSelectedN:/Selected \(\d+\)/.test(t),
      selectedText:(t.match(/Selected \([^)]*\)/)||[''])[0],
      nearby:(t.match(/[^.]{0,40}Selected[^.]{0,40}/)||[''])[0].slice(0,90)};
  });
  await page.keyboard.press('Escape');
  return out;
};
