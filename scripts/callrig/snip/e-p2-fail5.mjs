import {WS, BASE} from './e-p2-helpers.mjs';
const view = () => {
  const vis=e=>{let x=e,o=1;while(x&&x!==document.documentElement){const s=getComputedStyle(x);if(s.display==='none'||s.visibility==='hidden')return false;o*=parseFloat(s.opacity||'1');x=x.parentElement;}const r=e.getBoundingClientRect();return o>0.01&&r.width>0&&r.height>0;};
  // anchor on the panel's OWN control, not on the word "notification" (channel text contains it)
  const d=[...document.querySelectorAll('[role=dialog]')].filter(vis)
    .find(e=>[...e.querySelectorAll('button')].some(b=>/Mark all as read/i.test(b.textContent||''))
             || /^Notifications/.test((e.innerText||'').trim()));
  if(!d) return {panel:false, dialogsVisible:[...document.querySelectorAll('[role=dialog]')].filter(vis).length};
  const t=d.innerText.replace(/\s+/g,' ');
  const btns=[...d.querySelectorAll('button')].filter(vis).map(e=>(e.textContent||'').trim()).filter(Boolean);
  return {panel:true, chars:t.length,
    rows:[...d.querySelectorAll('button,[role=listitem],li')].filter(vis)
      .map(e=>(e.getAttribute('aria-label')||'')).filter(x=>/:/.test(x)).length,
    saysError:/(error|wrong|failed|try again|retry|ошибк|повтор)/i.test(t),
    hasRetry:btns.some(x=>/retry|try again|повтор/i.test(x)),
    stuckSpinner: !!d.querySelector('[role=progressbar],[class*=spinner i],[class*=skeleton i]'),
    head:t.slice(0,180), buttons:[...new Set(btns)].slice(0,6)};
};
export default async ({page}) => {
  const out={};
  await page.route('**/api/v1/notifications**', r => r.abort('failed'));
  await page.goto(`${BASE}/w/${WS}/c/C4QEGENERAL0001`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4500);
  const attempted=[], failed=[];
  page.on('request', r=>{ if(/\/api\/v1\/notifications/.test(r.url())) attempted.push(1); });
  page.on('requestfailed', r=>{ if(/\/api\/v1\/notifications/.test(r.url())) failed.push(1); });
  await page.locator('button[aria-label^="Notifications"]').first().click();
  await page.waitForTimeout(7000);
  out.aborted = await page.evaluate(view);
  out.net = {attempted:attempted.length, failed:failed.length};
  await page.unroute('**/api/v1/notifications**');
  // 500 on a cold load
  await page.route('**/api/v1/notifications**', r => r.fulfill({status:500,contentType:'application/json',
    body:JSON.stringify({code:500,key:"COMMON_INTERNAL",message:"boom",trace_id:"t"})}));
  await page.goto(`${BASE}/w/${WS}/c/C4QEGENERAL0001`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4500);
  await page.locator('button[aria-label^="Notifications"]').first().click();
  await page.waitForTimeout(7000);
  out.http500 = await page.evaluate(view);
  await page.unroute('**/api/v1/notifications**');
  return out;
};
