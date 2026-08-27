import {WS, BASE} from './e-p2-helpers.mjs';
const latin = t => { const m=(t.match(/[A-Za-z]{3,}/g)||[]); return [...new Set(m)].slice(0,14); };
async function setLang(page, name){
  await page.goto(`${BASE}/w/${WS}/settings/account`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(5000);
  await page.locator('main [aria-label="Language"]').first().click();
  await page.waitForTimeout(1800);
  await page.locator('[role=dialog] button').filter({hasText:new RegExp('^'+name+'$')}).first().click();
  await page.waitForTimeout(5000);
  return await page.evaluate(()=>{
    const e=[...document.querySelectorAll('[aria-label="Language"]')][0];
    return e? (e.textContent||'').trim() : '?';
  });
}
export default async ({page}) => {
  const out={};
  out.switchedTo = await setLang(page,'Russian');
  // 1) archived channels panel
  await page.goto(`${BASE}/w/${WS}/c/C4QEGENERAL0001`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(5000);
  const openArch = await page.evaluate(()=>{
    const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0;};
    const b=[...document.querySelectorAll('button')].filter(vis)
      .find(e=>/archiv|архив/i.test((e.getAttribute('aria-label')||'')+' '+(e.textContent||'')));
    if(!b) return null; b.click(); return (b.getAttribute('aria-label')||b.textContent||'').trim();
  });
  await page.waitForTimeout(2500);
  out.archivedPanel = await page.evaluate(()=>{
    const vis=e=>{let x=e,o=1;while(x&&x!==document.documentElement){const s=getComputedStyle(x);if(s.display==='none'||s.visibility==='hidden')return false;o*=parseFloat(s.opacity||'1');x=x.parentElement;}const r=e.getBoundingClientRect();return o>0.01&&r.width>0&&r.height>0;};
    const h=[...document.querySelectorAll('h1,h2,h3')].filter(vis).find(e=>/Archiv|Архив/i.test(e.textContent||''));
    let box=h; for(let i=0;i<6&&box;i++){ if(box.querySelectorAll('button').length>=3) break; box=box.parentElement; }
    return box? box.innerText.replace(/\s+/g,' ').slice(0,220) : '(panel not found)';
  });
  out.archivedPanelTrigger = openArch;
  await page.keyboard.press('Escape'); await page.waitForTimeout(1200);
  // 2) archived channel banner
  await page.goto(`${BASE}/w/${WS}/c/C4OX3463S8ECN8X`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(5000);
  out.archivedBanner = await page.evaluate(()=>{
    const t=(document.querySelector('main')||document.body).innerText.replace(/\s+/g,' ');
    return (t.match(/[^.]{0,80}(archived|архив)[^.]{0,80}/i)||[''])[0].trim().slice(0,160);
  });
  // 3) file preview card from search
  await page.goto(`${BASE}/w/${WS}/c/C4QEGENERAL0001`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4500);
  await page.locator('button[aria-label^="Search"]').first().click();
  await page.waitForTimeout(2000);
  const inp=page.locator('[role=dialog] input').first(); await inp.waitFor({timeout:15000});
  await inp.click(); await inp.type('viewer',{delay:45});
  await page.waitForTimeout(4500);
  await page.evaluate(()=>{
    const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0;};
    const d=[...document.querySelectorAll('[role=dialog]')].filter(vis)[0];
    const o=[...d.querySelectorAll('[role=option]')].filter(vis).find(e=>/viewer\.png/i.test(e.textContent||''));
    o&&o.click();
  });
  await page.waitForTimeout(3500);
  out.previewCard = await page.evaluate(()=>{
    const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0;};
    const ds=[...document.querySelectorAll('[role=dialog]')].filter(vis);
    const d=ds[ds.length-1];
    return d? d.innerText.replace(/\s+/g,' ').slice(0,180) : '(no card)';
  });
  out.latinLeftovers = {panel:latin(out.archivedPanel), banner:latin(out.archivedBanner), card:latin(out.previewCard)};
  // restore
  out.restoredTo = await setLang(page,'English');
  return out;
};
