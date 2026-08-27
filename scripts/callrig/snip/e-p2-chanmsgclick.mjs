import {VISFN, WS, BASE} from './e-p2-helpers.mjs';
const boxVisFn = `const boxVis = el => { const r=el.getBoundingClientRect(); if(r.width<1||r.height<1) return false;
    let n=el,op=1; while(n&&n!==document.documentElement){const cs=getComputedStyle(n); if(cs.display==='none'||cs.visibility==='hidden')return false; op*=parseFloat(cs.opacity||'1'); n=n.parentElement;} return op>0.01; };`;
const bell = `(()=>{const b=[...document.querySelectorAll('button')].find(b=>/^Notifications/i.test(b.getAttribute('aria-label')||'')); return b?b.getAttribute('aria-label'):null;})()`;
export default async ({page}) => {
  const out={};
  await page.goto(BASE+'/w/'+WS+'/calendar', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(6500);
  out.startUrl = page.url().replace(/^https:\/\/[^/]+/,'');
  out.bellBefore = await page.evaluate(bell);
  await page.locator('button[aria-label^="Notifications"]').first().click();
  await page.waitForTimeout(2500);
  const row = page.locator('li button').filter({hasText:/New channel message/i}).first();
  out.rowFound = await page.locator('li button').filter({hasText:/New channel message/i}).count();
  if (!out.rowFound) return out;
  await row.click();
  const t=[]; for(let i=0;i<14;i++){ await page.waitForTimeout(500); t.push(page.url().replace(/^https:\/\/[^/]+\/w\/[^/]+/,'')); }
  out.urlTrace=[...new Set(t)].join('  ->  ');
  out.finalUrl = page.url().replace(/^https:\/\/[^/]+/,'');
  out.bellAfter = await page.evaluate(bell);
  out.landed = await page.evaluate(`(() => { ${VISFN}
    const m=document.querySelector('main');
    const msgs=[...document.querySelectorAll('[data-message-id]')];
    const target=msgs.find(x=>x.getAttribute('data-message-id')==='M4OWQ8K9SNKHQPD');
    return {header:(m.innerText||'').split('\\n')[0].slice(0,30),
      messageCount: msgs.length,
      targetPresent: !!target,
      targetVisible: target? vis(target):null,
      targetHighlighted: target? (String(target.className||'').match(/highlight|ring|accent|flash/i)||['no'])[0] : null,
      targetText: target? (target.innerText||'').replace(/\\s+/g,' ').slice(0,60):null}; })()`);
  return out;
};
