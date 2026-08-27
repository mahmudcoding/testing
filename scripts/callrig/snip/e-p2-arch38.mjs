import {WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  await page.goto(`${BASE}/w/${WS}/files`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(5000);
  const target = page.locator('button:has-text("qa-e-note.txt")').first();
  await target.scrollIntoViewIfNeeded();
  await target.click({button:'right'});
  await page.waitForTimeout(1600);
  const menu = await page.evaluate(()=>{
    const vis=e=>{let x=e,o=1;while(x&&x!==document.documentElement){const s=getComputedStyle(x);if(s.display==='none'||s.visibility==='hidden')return false;o*=parseFloat(s.opacity||'1');x=x.parentElement;}const r=e.getBoundingClientRect();return o>0.01&&r.width>0&&r.height>0;};
    return [...new Set([...document.querySelectorAll('[role=menuitem],[role=menu] button')].filter(vis)
      .map(e=>(e.getAttribute('aria-label')||e.textContent||'').replace(/\s+/g,' ').trim()))];
  });
  // click Share… if present
  let share=null;
  if (menu.some(m=>/^Share/i.test(m))) {
    await page.evaluate(()=>{
      const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0;};
      const it=[...document.querySelectorAll('[role=menuitem],[role=menu] button')].filter(vis)
        .find(e=>/^Share/i.test((e.getAttribute('aria-label')||e.textContent||'').trim()));
      it && it.click();
    });
    await page.waitForTimeout(2500);
    share = await page.evaluate(()=>{
      const vis=e=>{let x=e,o=1;while(x&&x!==document.documentElement){const s=getComputedStyle(x);if(s.display==='none'||s.visibility==='hidden')return false;o*=parseFloat(s.opacity||'1');x=x.parentElement;}const r=e.getBoundingClientRect();return o>0.01&&r.width>0&&r.height>0;};
      const d=[...document.querySelectorAll('[role=dialog]')].filter(vis).pop();
      if(!d) return {noDialog:true};
      return {text:d.innerText.replace(/\s+/g,' ').slice(0,400),
        options:[...d.querySelectorAll('button,[role=option],li')].filter(vis)
          .map(e=>(e.getAttribute('aria-label')||e.textContent||'').replace(/\s+/g,' ').trim()).filter(t=>t.length>1).slice(0,25)};
    });
  }
  return {menu, share};
};
