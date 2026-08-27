import {WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  await page.goto(`${BASE}/w/${WS}/c/C4QEGENERAL0001`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(5000);
  const toolbar = await page.evaluate(()=>{
    const vis=e=>{let x=e,o=1;while(x&&x!==document.documentElement){const s=getComputedStyle(x);if(s.display==='none'||s.visibility==='hidden')return false;o*=parseFloat(s.opacity||'1');x=x.parentElement;}const r=e.getBoundingClientRect();return o>0.01&&r.width>0&&r.height>0;};
    const comp=document.querySelector('div[contenteditable="true"][aria-label="Compose message"]');
    if(!comp) return {noComposer:true};
    // walk up to the composer's container and list its controls
    let box=comp; for(let i=0;i<6&&box;i++){ if(box.querySelectorAll('button').length>=3) break; box=box.parentElement; }
    return {controls:[...box.querySelectorAll('button')].filter(vis)
      .map(e=>(e.getAttribute('aria-label')||e.getAttribute('title')||e.textContent||'').replace(/\s+/g,' ').trim().slice(0,26))
      .filter(Boolean)};
  });
  // Cmd+K with focus in the composer
  await page.locator('div[contenteditable="true"][aria-label="Compose message"]').click();
  await page.waitForTimeout(600);
  await page.keyboard.press('Meta+KeyK');
  await page.waitForTimeout(2200);
  const afterCmdK = await page.evaluate(()=>{
    const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0;};
    const d=[...document.querySelectorAll('[role=dialog]')].filter(vis).pop();
    const ae=document.activeElement;
    return {dialogText: d? d.innerText.replace(/\s+/g,' ').slice(0,80):'(none)',
      focus: ae? (ae.getAttribute('aria-label')||ae.getAttribute('placeholder')||ae.tagName):null};
  });
  await page.keyboard.press('Escape');
  return {composerToolbar:toolbar, afterCmdK};
};
