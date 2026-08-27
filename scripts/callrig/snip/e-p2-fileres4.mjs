import {WS, BASE} from './e-p2-helpers.mjs';
const panel = () => {
  const vis=e=>{let x=e,o=1;while(x&&x!==document.documentElement){const s=getComputedStyle(x);if(s.display==='none'||s.visibility==='hidden')return false;o*=parseFloat(s.opacity||'1');x=x.parentElement;}const r=e.getBoundingClientRect();return o>0.01&&r.width>0&&r.height>0;};
  const ds=[...document.querySelectorAll('[role=dialog]')].filter(vis);
  const d=ds[ds.length-1]; if(!d) return {open:false};
  const img=d.querySelector('img');
  return {open:true, saysNoPreview:/Preview is not available/i.test(d.innerText),
    hasImg:!!img, nat: img?`${img.naturalWidth}x${img.naturalHeight}`:null,
    text:d.innerText.replace(/\s+/g,' ').slice(0,110)};
};
export default async ({page}) => {
  await page.goto(`${BASE}/w/${WS}/files`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(5500);
  const target = page.locator('button:has-text("viewer.png")').first();
  await target.scrollIntoViewIfNeeded();
  await target.click({button:'right'});
  await page.waitForTimeout(1600);
  await page.evaluate(()=>{
    const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0;};
    const it=[...document.querySelectorAll('[role=menuitem],[role=menu] button')].filter(vis)
      .find(e=>/View details/i.test(e.textContent||''));
    it && it.click();
  });
  await page.waitForTimeout(4000);
  return {fileDetailsFromFiles: await page.evaluate(panel)};
};
