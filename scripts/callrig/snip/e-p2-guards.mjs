import {VISFN, WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  const out={};
  // guard from finding 1: search opened OUTSIDE a channel still searches the whole workspace
  const reqs=[];
  page.on('response', r=>{ const u=r.url(); if(/\/api\/v1\/search/.test(u))
    reqs.push(decodeURIComponent(u.split('/api/v1/')[1]).slice(0,120)); });
  await page.goto(BASE+'/w/'+WS+'/files', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(9000);
  await page.evaluate(`(() => { ${VISFN}
     const b=[...document.querySelectorAll('button')].filter(vis).find(x=>/^Search /.test(x.getAttribute('aria-label')||''));
     if(b) b.click(); })()`);
  await page.waitForTimeout(2600); reqs.length=0;
  await page.keyboard.type('unread'); await page.waitForTimeout(4800);
  out.searchOutsideChannel = {req:reqs[reqs.length-1]||'(none)',
    noChannelScope: !/channel_ids=/.test(reqs[reqs.length-1]||'')};
  await page.keyboard.press('Escape'); await page.waitForTimeout(1200);
  // guard from finding 14: week and month still open on a period containing today
  await page.goto(BASE+'/w/'+WS+'/calendar', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(9500);
  out.weekOnLoad = await page.evaluate(`(() => {
     const t=(document.querySelector('main').innerText||'').replace(/\\s+/g,' ');
     const n=new Date();
     return {header:(t.match(/\\d{1,2}\\s*–\\s*\\d{1,2}\\s+\\w+\\s+\\d{4}/)||[''])[0],
             localDay:n.getDate()}; })()`);
  // guard from finding 12: Display settings still persist
  await page.keyboard.press('Meta+Shift+T'); await page.waitForTimeout(2600);
  out.displayPanel = await page.evaluate(`(() => { ${VISFN}
     const d=[...document.querySelectorAll('aside,[role=dialog]')]
       .filter(e=>/Display settings/i.test(e.innerText||'')).pop();
     return d?{open:true, density:document.documentElement.getAttribute('data-density'),
               theme:document.documentElement.getAttribute('data-theme')}:{open:false}; })()`);
  return out;
};
