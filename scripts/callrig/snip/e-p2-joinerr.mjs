import {VISFN} from './e-p2-helpers.mjs';
export default async ({page}) => {
  const out={};
  const full = `(() => { ${VISFN}
    const all=[...document.querySelectorAll('button,a[href],[role=button],[role=link],[role=menuitem],input,[tabindex]:not([tabindex="-1"])')].filter(vis);
    return { docText:((document.body.innerText||'').replace(/\\s+/g,' ')).slice(0,300),
             count:all.length,
             items:all.map(n=>n.tagName.toLowerCase()+(n.getAttribute('href')?('[href='+n.getAttribute('href').slice(0,26)+']'):'')
                     +' "'+((n.getAttribute('aria-label')||n.textContent||'').replace(/\\s+/g,' ').trim().slice(0,32))+'"').slice(0,20),
             hasSidebar: !!document.querySelector('nav') || /qa-general/i.test(document.body.innerText||''),
             title: document.title }; })()`;
  // run 1
  await page.goto('https://airion-cargo.store/calendar/join/'+'0'.repeat(64), {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(9000);
  out.run1 = await page.evaluate(full);
  // run 2 — reproduce, different bogus token
  await page.goto('https://airion-cargo.store/calendar/join/'+'a1b2'.repeat(16), {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(9000);
  out.run2 = await page.evaluate(full);
  // is there anything below the fold?
  out.scroll = await page.evaluate(`(() => ({ sh:document.documentElement.scrollHeight, ch:document.documentElement.clientHeight }))()`);
  // what does the valid (not-started) page's "Leave" do?
  await page.goto('https://airion-cargo.store/calendar/join/'+process.env.QA_TOK, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(9000);
  out.validControls = await page.evaluate(full);
  await page.evaluate(`(() => { ${VISFN}
     const b=[...document.querySelectorAll('button')].filter(vis).find(x=>(x.textContent||'').trim()==='Leave'); if(b) b.click(); })()`);
  await page.waitForTimeout(7000);
  out.afterLeave = { url: page.url().replace(/^https:\/\/[^/]+/,'').slice(0,70),
                     text: await page.evaluate(`(() => ((document.querySelector('main')||document.body).innerText||'').replace(/\\s+/g,' ').slice(0,150))()`) };
  return out;
};
