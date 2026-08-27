import {WS, BASE} from './e-p2-helpers.mjs';
async function setStatus(page, preset){
  await page.goto(`${BASE}/w/${WS}/c/C4QEGENERAL0001`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4500);
  await page.locator('[aria-label="Profile"]').first().click();
  await page.waitForTimeout(2200);
  const b=page.locator('button').filter({hasText:new RegExp(preset)}).first();
  const n=await b.count();
  if(n) await b.click();
  await page.waitForTimeout(3000);
  await page.keyboard.press('Escape'); await page.waitForTimeout(1000);
  return n>0;
}
export default async ({page}) => {
  const out={};
  out.set = await setStatus(page,'Vacation');
  // 1) People row
  await page.goto(`${BASE}/w/${WS}/directories?tab=people`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(5000);
  out.peopleRow = await page.evaluate(()=>{
    const m=document.querySelector('main');
    return {mentionsVacation:/Vacation|Отпуск/i.test(m.innerText),
            head:m.innerText.replace(/\s+/g,' ').slice(0,120)};
  });
  // 2) profile popup for self
  const self = await page.locator('main [aria-label="Open QA Alice\'s profile"]').first();
  if (await self.count()) { await self.click(); await page.waitForTimeout(2500); }
  out.popup = await page.evaluate(()=>{
    const vis=e=>{let x=e,o=1;while(x&&x!==document.documentElement){const s=getComputedStyle(x);if(s.display==='none'||s.visibility==='hidden')return false;o*=parseFloat(s.opacity||'1');x=x.parentElement;}const r=e.getBoundingClientRect();return o>0.01&&r.width>0&&r.height>0;};
    const d=[...document.querySelectorAll('[role=dialog],[data-state=open]')].filter(vis)
      .filter(e=>/Alice/i.test(e.innerText||'')).sort((a,b)=>a.innerText.length-b.innerText.length)[0];
    return d? {text:d.innerText.replace(/\s+/g,' ').slice(0,140), mentionsVacation:/Vacation|Отпуск/i.test(d.innerText)} : {none:true};
  });
  await page.keyboard.press('Escape'); await page.waitForTimeout(1000);
  // 3) channel members panel
  await page.goto(`${BASE}/w/${WS}/c/C4QEGENERAL0001`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4500);
  await page.locator('button[aria-label="2 members"], button[aria-label$="members"]').first().click().catch(()=>{});
  await page.waitForTimeout(3000);
  out.membersPanel = await page.evaluate(()=>{
    const t=document.body.innerText.replace(/\s+/g,' ');
    return {mentionsVacation:/Vacation|Отпуск/i.test(t)};
  });
  return out;
};
