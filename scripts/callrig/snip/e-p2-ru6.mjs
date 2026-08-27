import {WS, BASE} from './e-p2-helpers.mjs';
const latin = t => [...new Set((t.match(/[A-Za-z][A-Za-z-]{2,}/g)||[]))].slice(0,12);
async function setLang(page, wanted){
  await page.goto(`${BASE}/w/${WS}/settings/account`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(5000);
  await page.locator('main [aria-label="Language"], main [aria-label="Язык"]').first().click();
  await page.waitForTimeout(2200);
  await page.locator('[role=dialog] button').filter({hasText:wanted}).first().click();
  await page.waitForTimeout(5500);
}
export default async ({page}) => {
  const out={};
  try {
    await setLang(page, /^(Russian|Русский)$/);
    out.switched = true;
    // archived channels panel
    await page.goto(`${BASE}/w/${WS}/c/C4QEGENERAL0001`, {waitUntil:'domcontentloaded'});
    await page.waitForTimeout(5000);
    out.sidebarArchTrigger = await page.evaluate(()=>{
      const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0;};
      const b=[...document.querySelectorAll('button')].filter(vis)
        .find(e=>/archiv|архив/i.test((e.getAttribute('aria-label')||'')+(e.textContent||'')));
      if(!b) return null; const l=(b.getAttribute('aria-label')||b.textContent||'').trim(); b.click(); return l;
    });
    await page.waitForTimeout(2500);
    out.archivedPanel = await page.evaluate(()=>{
      const vis=e=>{let x=e,o=1;while(x&&x!==document.documentElement){const s=getComputedStyle(x);if(s.display==='none'||s.visibility==='hidden')return false;o*=parseFloat(s.opacity||'1');x=x.parentElement;}const r=e.getBoundingClientRect();return o>0.01&&r.width>0&&r.height>0;};
      const h=[...document.querySelectorAll('h1,h2,h3')].filter(vis).find(e=>/Archiv|Архив/i.test(e.textContent||''));
      let b=h; for(let i=0;i<6&&b;i++){ if(b.querySelectorAll('button').length>=3) break; b=b.parentElement; }
      return b? b.innerText.replace(/\s+/g,' ').slice(0,200) : '(not found)';
    });
    await page.keyboard.press('Escape'); await page.waitForTimeout(1200);
    // archived channel banner
    await page.goto(`${BASE}/w/${WS}/c/C4OX3463S8ECN8X`, {waitUntil:'domcontentloaded'});
    await page.waitForTimeout(5000);
    out.archivedBanner = await page.evaluate(()=>{
      const t=(document.querySelector('main')||document.body).innerText.replace(/\s+/g,' ');
      return (t.match(/[^.]{0,70}(archiv|архив)[^.]{0,90}/i)||[''])[0].trim().slice(0,170);
    });
    // preview card from search
    await page.goto(`${BASE}/w/${WS}/c/C4QEGENERAL0001`, {waitUntil:'domcontentloaded'});
    await page.waitForTimeout(4500);
    await page.evaluate(()=>{
      const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0;};
      const b=[...document.querySelectorAll('button')].filter(vis)
        .find(e=>/^(Search|Поиск)/i.test(e.getAttribute('aria-label')||'')); b&&b.click();
    });
    await page.waitForTimeout(2200);
    const inp=page.locator('[role=dialog] input').first(); await inp.waitFor({timeout:12000});
    await inp.click(); await inp.type('viewer',{delay:45});
    await page.waitForTimeout(4500);
    out.searchChrome = await page.evaluate(()=>{
      const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0;};
      const d=[...document.querySelectorAll('[role=dialog]')].filter(vis)[0];
      return d? d.innerText.replace(/\s+/g,' ').slice(0,220) : '(no dialog)';
    });
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
      return ds.length? ds[ds.length-1].innerText.replace(/\s+/g,' ').slice(0,180) : '(no card)';
    });
    out.latinLeftovers = {panel:latin(out.archivedPanel||''), banner:latin(out.archivedBanner||''),
      searchChrome:latin(out.searchChrome||''), card:latin(out.previewCard||'')};
  } catch (e) {
    out.error = (e.message||String(e)).slice(0,140);
  }
  // ALWAYS restore
  try {
    await setLang(page, /^(English|Английский)$/);
    out.restored = await page.evaluate(()=>{
      const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0;};
      const c=[...document.querySelector('main').querySelectorAll('button')].filter(vis)
        .find(e=>/Language|Язык/i.test(e.getAttribute('aria-label')||''));
      return c? (c.getAttribute('aria-label')+'='+(c.textContent||'').trim()) : '?';
    });
  } catch(e) { out.restoreError=(e.message||'').slice(0,120); }
  return out;
};
