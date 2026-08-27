import {WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  await page.goto(`${BASE}/w/${WS}/settings/account`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(5000);
  const before = await page.evaluate(()=>{
    const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0;};
    const m=document.querySelector('main');
    const sels=[...m.querySelectorAll('select,button,[role=combobox]')].filter(vis)
      .map(e=>({tag:e.tagName, l:(e.getAttribute('aria-label')||e.textContent||'').replace(/\s+/g,' ').trim().slice(0,30)}))
      .filter(o=>/lang|english|русск|язык/i.test(o.l));
    return {langControls:sels, hasLanguageWord:/Language/i.test(m.innerText)};
  });
  return before;
};
