import {WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  await page.goto(`${BASE}/w/${WS}/calendar`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(6000);
  await page.locator('main button').filter({hasText:/^New meeting$/}).first().click();
  await page.waitForTimeout(3500);
  return await page.evaluate(()=>{
    const now=new Date();
    const vis=e=>{let x=e,o=1;while(x&&x!==document.documentElement){const s=getComputedStyle(x);if(s.display==='none'||s.visibility==='hidden')return false;o*=parseFloat(s.opacity||'1');x=x.parentElement;}const r=e.getBoundingClientRect();return o>0.01&&r.width>0&&r.height>0;};
    const d=[...document.querySelectorAll('[role=dialog]')].filter(vis).pop();
    if(!d) return {noDialog:true};
    // enumerate EVERY interactive thing — dates may be buttons, not date inputs
    const ctrls=[...d.querySelectorAll('input,button,select,[role=button],[role=combobox]')].filter(vis)
      .map(e=>({t:e.tagName.toLowerCase()+(e.type?`[${e.type}]`:''),
                v:(e.value||'').slice(0,28),
                l:(e.getAttribute('aria-label')||e.placeholder||e.textContent||'').replace(/\s+/g,' ').trim().slice(0,34)}));
    return {localDate:now.toLocaleDateString('en-CA'), utcDate:now.toISOString().slice(0,10),
      localTime:now.toTimeString().slice(0,5),
      dialogText:d.innerText.replace(/\s+/g,' ').slice(0,420),
      controls:ctrls.slice(0,26)};
  });
};
