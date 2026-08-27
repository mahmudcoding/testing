import {VISFN, WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  await page.goto(BASE+'/w/'+WS+'/files', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(9000);
  return await page.evaluate(`(() => { ${VISFN}
     // the sidebar's Direct messages section names the DMs that exist
     const links=[...document.querySelectorAll('a[href*="/d/"]')].filter(vis)
       .map(a=>({tx:(a.innerText||'').replace(/\\s+/g,' ').trim().slice(0,20),
                 id:(a.getAttribute('href')||'').split('/d/')[1]||''}));
     const t=(document.body.innerText||'').replace(/\\s+/g,' ');
     const i=t.indexOf('Direct messages');
     return {dmLinks:links, sidebarDmSection:i>=0?t.slice(i,i+90):'(not found)'}; })()`);
};
