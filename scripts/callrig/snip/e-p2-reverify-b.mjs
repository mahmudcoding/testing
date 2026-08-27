import {VISFN, WS, BASE} from './e-p2-helpers.mjs';
const GEN='C4QEGENERAL0001';
export default async ({page}) => {
  const out={}; const searches=[];
  page.on('response', r => { const u=r.url();
    if(u.includes('/api/v1/search')) searches.push(decodeURIComponent(u.split('/api/v1/')[1]).slice(0,150)); });
  await page.goto(BASE+'/w/'+WS+'/c/'+GEN, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(9000);
  const openDlg = async () => { await page.evaluate(`(() => { ${VISFN}
     const b=[...document.querySelectorAll('button')].filter(vis).find(x=>/^Search /.test(x.getAttribute('aria-label')||''));
     if(b) b.click(); })()`); await page.waitForTimeout(2600); };

  // F5 — typed :@ filter
  await openDlg(); searches.length=0;
  await page.keyboard.type(':@ QA Bob probe'); await page.waitForTimeout(4500);
  out.F5 = { requests: searches.slice(-2),
             hasAuthorParam: searches.some(s=>/author|user_id|sender|from=/.test(s)),
             qSent: (searches[searches.length-1]||'').match(/q=([^&]*)/)?.[1] };
  out.F5.holds = !out.F5.hasAuthorParam;
  await page.keyboard.press('Escape'); await page.waitForTimeout(1500);

  // F7 — Cmd+K inside a channel with the composer focused
  await page.locator('div[contenteditable="true"][aria-label="Compose message"]').first().click();
  await page.waitForTimeout(900);
  const before = await page.evaluate(`(() => document.body.children.length)()`);
  await page.keyboard.press('Meta+k'); await page.waitForTimeout(3500);
  out.F7 = await page.evaluate(`(() => { ${VISFN}
     const active=document.activeElement;
     const dlgs=[...document.querySelectorAll('[role=dialog]')].filter(e=>e.getBoundingClientRect().width>120)
       .map(d=>(d.innerText||'').replace(/\\s+/g,' ').slice(0,60));
     return { bodyKids:document.body.children.length, activeEl: active? active.tagName+'['+(active.getAttribute('aria-label')||active.getAttribute('placeholder')||'')+']':'(none)',
              dialogs:dlgs,
              globalSearchOpen: dlgs.some(t=>/Global search/.test(t)),
              insertLinkOpen: dlgs.some(t=>/Insert link|Add link|URL/i.test(t)) }; })()`);
  out.F7.holds = out.F7.globalSearchOpen===false;
  await page.keyboard.press('Escape'); await page.waitForTimeout(1200);
  await page.keyboard.press('Escape'); await page.waitForTimeout(800);

  // F11 — join landing with a bad token: zero controls in the whole document
  await page.goto('https://airion-cargo.store/calendar/join/'+'b7'.repeat(32), {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(9000);
  out.F11 = await page.evaluate(`(() => { ${VISFN}
     const all=[...document.querySelectorAll('button,a[href],[role=button],input,[tabindex]:not([tabindex="-1"])')].filter(vis);
     return { bodyText:(document.body.innerText||'').replace(/\\s+/g,' ').slice(0,80),
              interactive:all.length,
              scrollEqual: document.documentElement.scrollHeight===document.documentElement.clientHeight }; })()`);
  out.F11.holds = out.F11.interactive===0;
  return out;
};
