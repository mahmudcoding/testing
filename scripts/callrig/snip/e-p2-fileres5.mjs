import {WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  await page.goto(`${BASE}/w/${WS}/files`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(5500);
  const t = page.locator('button:has-text("viewer.png")').first();
  await t.scrollIntoViewIfNeeded(); await t.click({button:'right'});
  await page.waitForTimeout(1600);
  await page.evaluate(()=>{
    const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0;};
    const it=[...document.querySelectorAll('[role=menuitem],[role=menu] button')].filter(vis)
      .find(e=>/View details/i.test(e.textContent||''));
    it && it.click();
  });
  await page.waitForTimeout(4000);
  return await page.evaluate(()=>{
    const vis=e=>{let x=e,o=1;while(x&&x!==document.documentElement){const s=getComputedStyle(x);if(s.display==='none'||s.visibility==='hidden')return false;o*=parseFloat(s.opacity||'1');x=x.parentElement;}const r=e.getBoundingClientRect();return o>0.01&&r.width>0&&r.height>0;};
    // do NOT filter to role=dialog — find any visible container mentioning Details
    const cands=[...document.querySelectorAll('[role=dialog],aside,section,div')].filter(vis)
      .filter(e=>/Details/i.test(e.innerText||'') && /viewer\.png/i.test(e.innerText||'') && e.innerText.length<600);
    const d=cands.sort((a,b)=>a.innerText.length-b.innerText.length)[0];
    if(!d) return {found:false, anyNoPreview:/Preview is not available/i.test(document.body.innerText)};
    const img=d.querySelector('img');
    return {found:true, tag:d.tagName, role:d.getAttribute('role'),
      saysNoPreview:/Preview is not available/i.test(d.innerText),
      hasImg:!!img, nat: img?`${img.naturalWidth}x${img.naturalHeight}`:null,
      imgVisible: img? vis(img):null,
      text:d.innerText.replace(/\s+/g,' ').slice(0,160)};
  });
};
