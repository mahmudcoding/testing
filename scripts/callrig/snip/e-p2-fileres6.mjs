import {WS, BASE} from './e-p2-helpers.mjs';
const card = () => {
  const vis=e=>{let x=e,o=1;while(x&&x!==document.documentElement){const s=getComputedStyle(x);if(s.display==='none'||s.visibility==='hidden')return false;o*=parseFloat(s.opacity||'1');x=x.parentElement;}const r=e.getBoundingClientRect();return o>0.01&&r.width>0&&r.height>0;};
  const ds=[...document.querySelectorAll('[role=dialog]')].filter(vis);
  const d=ds[ds.length-1]; if(!d) return {open:false};
  const img=d.querySelector('img'); const pre=d.querySelector('pre,code,textarea');
  return {open:true, saysNoPreview:/Preview is not available/i.test(d.innerText),
    hasImg:!!img, hasText:!!pre, text:d.innerText.replace(/\s+/g,' ').slice(0,130)};
};
async function fromSearch(page, q, name){
  await page.goto(`${BASE}/w/${WS}/c/C4QEGENERAL0001`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4500);
  await page.locator('button[aria-label="Search QA Workspace E"]').click();
  await page.waitForTimeout(2000);
  const inp=page.locator('[role=dialog] input').first(); await inp.waitFor({timeout:15000});
  await inp.click(); await inp.type(q,{delay:45});
  await page.waitForTimeout(4500);
  const ok = await page.evaluate((nm)=>{
    const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0;};
    const d=[...document.querySelectorAll('[role=dialog]')].filter(vis)[0];
    const o=[...d.querySelectorAll('[role=option]')].filter(vis).find(e=>e.textContent.includes(nm));
    if(!o) return false; o.click(); return true;
  }, name);
  if(!ok) return {name, notFound:true};
  await page.waitForTimeout(4000);
  return {name, ...(await page.evaluate(card))};
}
export default async ({page}) => ({
  png: await fromSearch(page,'viewer','viewer.png'),
  txt: await fromSearch(page,'normal','normal.txt'),
  zip: await fromSearch(page,'e2arch','e2arch.zip'),
});
