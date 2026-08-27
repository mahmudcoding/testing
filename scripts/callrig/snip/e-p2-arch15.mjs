import {WS, BASE} from './e-p2-helpers.mjs';
const probe = () => {
  const vis = e => { let x=e,o=1; while(x&&x!==document.documentElement){const s=getComputedStyle(x); if(s.display==='none'||s.visibility==='hidden')return false; o*=parseFloat(s.opacity||'1'); x=x.parentElement;} const r=e.getBoundingClientRect(); return o>0.01&&r.width>0&&r.height>0; };
  const inputs=[...document.querySelectorAll('input,[contenteditable="true"]')].filter(vis);
  return { inputs: inputs.map(i=>({t:i.tagName, ph:i.placeholder||i.getAttribute('aria-label')||'', v:(i.value||i.innerText||'').slice(0,40)})),
           dialogs: [...document.querySelectorAll('[role=dialog]')].filter(vis).length };
};
export default async ({page}) => {
  await page.goto(`${BASE}/w/${WS}/c/C4QEGENERAL0001`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(3500);
  const before = await page.evaluate(probe);
  await page.locator('button[aria-label="Search QA Workspace E"]').click();
  await page.waitForTimeout(2000);
  const afterClick = await page.evaluate(probe);
  return {before, afterClick};
};
