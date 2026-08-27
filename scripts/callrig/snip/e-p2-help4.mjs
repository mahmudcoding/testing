import {WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  await page.goto(`${BASE}/w/${WS}/c/C4QEGENERAL0001`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4500);
  await page.locator('[aria-label="Help & resources"]').first().click();
  await page.waitForTimeout(3000);
  return await page.evaluate(()=>{
    const vis=e=>{let x=e,o=1;while(x&&x!==document.documentElement){const s=getComputedStyle(x);if(s.display==='none'||s.visibility==='hidden')return false;o*=parseFloat(s.opacity||'1');x=x.parentElement;}const r=e.getBoundingClientRect();return o>0.01&&r.width>0&&r.height>0;};
    const docs=[...document.querySelectorAll('a,button,[role=button]')].filter(vis)
      .find(e=>/^Open docs$/i.test((e.textContent||'').replace(/\s+/g,' ').trim()));
    let panel=docs; for(let i=0;i<8&&panel;i++){ if(/Help & shortcuts/.test(panel.textContent||'')) break; panel=panel.parentElement; }
    return {docsFound:!!docs,
      docs: docs? {tag:docs.tagName, href:docs.getAttribute('href')||null,
                   target:docs.getAttribute('target')||null,
                   disabled: docs.disabled===true||docs.getAttribute('aria-disabled')==='true'||/(^|\s)cursor-not-allowed(\s|$)/.test((docs.className||'').toString())} : null,
      panelText: panel? panel.innerText.replace(/\s+/g,' ').slice(0,420) : null,
      mentionsLicence: panel? /licen[cs]e/i.test(panel.innerText) : null};
  });
};
