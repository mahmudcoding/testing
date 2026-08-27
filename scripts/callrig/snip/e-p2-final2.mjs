import {VISFN, WS, BASE} from './e-p2-helpers.mjs';
const mc = async (page, loc) => { try{ await loc.scrollIntoViewIfNeeded(); }catch(e){}
  await page.waitForTimeout(400); const b=await loc.boundingBox(); if(!b) return false;
  await page.mouse.move(b.x+b.width/2,b.y+b.height/2); await page.waitForTimeout(220);
  await page.mouse.down(); await page.waitForTimeout(110); await page.mouse.up(); return true; };
export default async ({page}) => {
  const out={};
  // ---- Finding 8: invalid join link -> page with no controls ----
  await page.goto(BASE+'/w/'+WS+'/call/INVALIDMEETING01', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(10000);
  out.F8 = await page.evaluate(`(() => { ${VISFN}
     const t=(document.body.innerText||'').replace(/\\s+/g,' ');
     // enumerate EVERY interactive node, no text filter
     const all=[...document.querySelectorAll('button,a,input,select,textarea,[role=button],[role=link],[tabindex]')]
       .filter(vis).map(e=>({tag:e.tagName, role:e.getAttribute('role')||'',
         tx:(e.innerText||'').replace(/\\s+/g,' ').trim().slice(0,24),
         al:(e.getAttribute('aria-label')||'').slice(0,24)}));
     return {url:location.pathname, text:t.slice(0,180), nInteractive:all.length, controls:all.slice(0,8)}; })()`);
  // ---- Finding 12: Reset all does not reset the theme ----
  await page.goto(BASE+'/w/'+WS+'/settings/appearance', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(9500);
  const read = `(() => { ${VISFN}
     const m=document.querySelector('main');
     const btns=[...m.querySelectorAll('button')].filter(vis)
       .filter(b=>/^(Light|Dark|System|Compact|Cozy|Comfortable)$/.test((b.textContent||'').trim()))
       .map(b=>({tx:(b.textContent||'').trim(), pressed:b.getAttribute('aria-pressed'),
                 sel:b.getAttribute('data-state')||b.getAttribute('aria-selected')}));
     return {theme:document.documentElement.getAttribute('data-theme'),
             cls:(document.documentElement.className||'').slice(0,40), btns}; })()`;
  out.F12_initial = await page.evaluate(read);
  // set Dark
  await mc(page, page.locator('main button').filter({hasText:/^Dark$/}).last());
  await page.waitForTimeout(2500);
  out.F12_afterDark = await page.evaluate(read);
  // click Reset all
  const reset = page.locator('button').filter({hasText:/^Reset all$/}).last();
  out.F12_resetFound = await reset.count();
  if(out.F12_resetFound){ await mc(page, reset); await page.waitForTimeout(4000);
    out.F12_afterReset = await page.evaluate(read); }
  // restore light
  await mc(page, page.locator('main button').filter({hasText:/^Light$/}).last());
  await page.waitForTimeout(1800);
  out.F12_restored = await page.evaluate(read);
  return out;
};
