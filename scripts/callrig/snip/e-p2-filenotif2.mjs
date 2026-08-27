import {VISFN, WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  const out={};
  await page.goto(BASE+'/w/'+WS+'/calendar', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(6500);
  await page.locator('button[aria-label^="Notifications"]').first().click();
  await page.waitForTimeout(3500);
  // find the actual BUTTON whose accessible name mentions the file notification
  const t = await page.evaluate(`(() => { ${VISFN}
    const btns=[...document.querySelectorAll('button')].filter(vis)
      .filter(b=>/qa-general/.test((b.getAttribute('aria-label')||'')+' '+(b.textContent||''))
              && /File/.test((b.getAttribute('aria-label')||'')+' '+(b.textContent||'')));
    if(!btns.length) return {none:true, sample:[...document.querySelectorAll('button')].filter(vis)
      .map(b=>(b.getAttribute('aria-label')||b.textContent||'').replace(/\\s+/g,' ').trim().slice(0,44)).slice(0,12)};
    // innermost
    const inner=btns.filter(b=>!btns.some(o=>o!==b&&b.contains(o)));
    const el=inner[0]||btns[0]; const r=el.getBoundingClientRect();
    return { name:(el.getAttribute('aria-label')||el.textContent||'').replace(/\\s+/g,' ').trim().slice(0,90),
             cx:Math.round(r.x+r.width/2), cy:Math.round(r.y+r.height/2) }; })()`);
  out.target=t;
  if(t.none) return out;
  out.urlBefore = page.url().replace(/^https:\/\/[^/]+/,'');
  await page.mouse.move(t.cx,t.cy); await page.waitForTimeout(400);
  await page.mouse.down(); await page.waitForTimeout(140); await page.mouse.up();
  const s=[]; for(let i=0;i<16;i++){ await page.waitForTimeout(400);
    s.push(page.url().replace(/^https:\/\/[^/]+/,'').slice(0,90)); }
  out.urlSamples = [...new Set(s)];
  out.urlAfter = s[s.length-1];
  out.landed = await page.evaluate(`(() => { ${VISFN}
     const m=document.querySelector('main');
     const msgs=[...m.querySelectorAll('[data-message-id]')].filter(vis);
     const hi=msgs.filter(n=>/ring|highlight|bg-(accent|amber|yellow)/.test(n.className||'')
        || /ring|highlight/.test((n.parentElement&&n.parentElement.className)||''));
     return { msgCount:msgs.length, highlighted:hi.length,
              lastMsg: msgs.length? (msgs[msgs.length-1].innerText||'').replace(/\\s+/g,' ').slice(0,110):null,
              hasAttachment: /\\.(png|txt|jpg|pdf)/i.test((m.innerText||'')) }; })()`);
  return out;
};
