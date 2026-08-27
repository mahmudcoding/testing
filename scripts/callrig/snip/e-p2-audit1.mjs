import {WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  const out={};
  // CLAIM A (finding 12): empty title gives "Title is required", field marked, focus moves to it
  await page.goto(`${BASE}/w/${WS}/calendar`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(5500);
  await page.locator('main button').filter({hasText:/^New meeting$/}).first().click();
  await page.waitForTimeout(3000);
  const dlg=page.locator('[role=dialog]').last();
  await dlg.locator('button[type=submit]').last().click();
  await page.waitForTimeout(3000);
  out.emptyTitle = await page.evaluate(()=>{
    const vis=e=>{let x=e,o=1;while(x&&x!==document.documentElement){const s=getComputedStyle(x);if(s.display==='none'||s.visibility==='hidden')return false;o*=parseFloat(s.opacity||'1');x=x.parentElement;}const r=e.getBoundingClientRect();return o>0.01&&r.width>0&&r.height>0;};
    const d=[...document.querySelectorAll('[role=dialog]')].filter(vis).pop();
    const t=d.innerText.replace(/\s+/g,' ');
    const ti=d.querySelector('input[aria-label="Add title"]');
    const ae=document.activeElement;
    return {exactString: /Title is required/.test(t),
      whatItSays: (t.match(/[A-Z][a-z][^.]{0,40}required[^.]{0,20}/)||[''])[0],
      toast:[...document.querySelectorAll('[role=status],[role=alert]')].filter(vis).map(e=>(e.textContent||'').trim()).slice(0,2),
      titleInvalid: ti? (ti.getAttribute('aria-invalid')||null) : 'no field',
      titleDescribedBy: ti? (ti.getAttribute('aria-describedby')||null) : null,
      focusIsTitle: !!ti && ae===ti,
      focusIs: ae? (ae.getAttribute('aria-label')||ae.tagName) : null};
  });
  await page.keyboard.press('Escape'); await page.waitForTimeout(1200);
  // CLAIM B (finding 19): a "Reset accent" control exists in Display settings
  await page.keyboard.press('Meta+Shift+KeyT').catch(()=>{});
  await page.waitForTimeout(2500);
  out.displaySettings = await page.evaluate(()=>{
    const vis=e=>{let x=e,o=1;while(x&&x!==document.documentElement){const s=getComputedStyle(x);if(s.display==='none'||s.visibility==='hidden')return false;o*=parseFloat(s.opacity||'1');x=x.parentElement;}const r=e.getBoundingClientRect();return o>0.01&&r.width>0&&r.height>0;};
    const all=[...document.querySelectorAll('button,[role=button]')].filter(vis)
      .map(e=>(e.getAttribute('aria-label')||e.textContent||'').replace(/\s+/g,' ').trim());
    return {resetControls: all.filter(x=>/reset/i.test(x)),
      accentMentioned: /accent/i.test(document.body.innerText)};
  });
  return out;
};
