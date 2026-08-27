import {VISFN, WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  const out={};
  // restore theme to light via the Display settings panel
  await page.goto(BASE+'/w/'+WS+'/files', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(9000);
  await page.keyboard.press('Meta+Shift+T'); await page.waitForTimeout(2600);
  const t = await page.evaluate(`(() => { ${VISFN}
     const d=[...document.querySelectorAll('aside,[role=dialog]')]
       .filter(e=>/Display settings/i.test(e.innerText||'')).pop();
     if(!d) return null;
     const b=[...d.querySelectorAll('button')].filter(vis).find(x=>(x.textContent||'').trim()==='Light');
     if(!b) return null; const r=b.getBoundingClientRect();
     return {cx:Math.round(r.x+r.width/2), cy:Math.round(r.y+r.height/2)}; })()`);
  if(t){ await page.mouse.move(t.cx,t.cy); await page.waitForTimeout(220);
    await page.mouse.down(); await page.waitForTimeout(110); await page.mouse.up(); await page.waitForTimeout(2000); }
  await page.keyboard.press('Meta+Shift+T'); await page.waitForTimeout(1200);
  out.themeRestored = await page.evaluate(`document.documentElement.getAttribute('data-theme')`);
  // ---- Finding 8: invalid join link -> zero controls ----
  await page.goto(BASE+'/w/'+WS+'/call/INVALIDMEETING01', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(11000);
  out.F8 = await page.evaluate(`(() => { ${VISFN}
     const t=(document.body.innerText||'').replace(/\\s+/g,' ');
     const all=[...document.querySelectorAll('button,a,input,select,textarea,[role=button],[role=link],[role=menuitem],[tabindex]')]
       .filter(vis).map(e=>({tag:e.tagName, role:e.getAttribute('role')||'',
         tx:(e.innerText||'').replace(/\\s+/g,' ').trim().slice(0,22),
         al:(e.getAttribute('aria-label')||'').slice(0,22)}));
     return {url:location.pathname, textLen:t.length, text:t.slice(0,160),
             nInteractive:all.length, controls:all.slice(0,10)}; })()`);
  return out;
};
