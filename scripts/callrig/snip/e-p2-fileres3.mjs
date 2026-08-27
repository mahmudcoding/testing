import {WS, BASE} from './e-p2-helpers.mjs';
const viewer = () => {
  const vis=e=>{let x=e,o=1;while(x&&x!==document.documentElement){const s=getComputedStyle(x);if(s.display==='none'||s.visibility==='hidden')return false;o*=parseFloat(s.opacity||'1');x=x.parentElement;}const r=e.getBoundingClientRect();return o>0.01&&r.width>0&&r.height>0;};
  const ds=[...document.querySelectorAll('[role=dialog]')].filter(vis);
  const d=ds[ds.length-1];
  if(!d) return {open:false};
  const img=d.querySelector('img');
  return {open:true, text:d.innerText.replace(/\s+/g,' ').slice(0,120),
    hasImg:!!img, imgNatural: img? `${img.naturalWidth}x${img.naturalHeight}` : null,
    imgComplete: img? img.complete : null,
    saysNoPreview:/Preview is not available/i.test(d.innerText)};
};
export default async ({page}) => {
  const out={};
  // A) from Files browser
  await page.goto(`${BASE}/w/${WS}/files`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(5500);
  await page.locator('button:has-text("viewer.png")').first().click();
  await page.waitForTimeout(4000);
  out.fromFiles = await page.evaluate(viewer);
  await page.keyboard.press('Escape'); await page.waitForTimeout(1200);
  // B) from a search result
  await page.goto(`${BASE}/w/${WS}/c/C4QEGENERAL0001`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4500);
  await page.locator('button[aria-label="Search QA Workspace E"]').click();
  await page.waitForTimeout(2000);
  const inp=page.locator('[role=dialog] input').first(); await inp.waitFor({timeout:15000});
  await inp.click(); await inp.type('viewer',{delay:45});
  await page.waitForTimeout(4500);
  await page.evaluate(()=>{
    const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0;};
    const d=[...document.querySelectorAll('[role=dialog]')].filter(vis)[0];
    const o=[...d.querySelectorAll('[role=option]')].filter(vis).find(e=>/viewer\.png/i.test(e.textContent||''));
    o && o.click();
  });
  await page.waitForTimeout(4000);
  out.fromSearch = await page.evaluate(viewer);
  return out;
};
