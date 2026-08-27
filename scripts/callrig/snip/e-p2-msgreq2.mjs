import {VISFN, WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  await page.goto(BASE+'/w/'+WS+'/c/C4QEGENERAL0001', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(7500);
  return await page.evaluate(`(() => { ${VISFN}
    const main=document.querySelector('main');
    const chrome=interactives(document).filter(d=>d.x<400).map(d=>'<'+d.tag+'> "'+d.label.slice(0,30)+'"');
    return {chrome,
      sidebarToggle:(()=>{const b=[...document.querySelectorAll('button')].find(x=>vis(x)&&/sidebar/i.test(x.getAttribute('aria-label')||'')); return b?b.getAttribute('aria-label'):null;})(),
      dmLinks:[...document.querySelectorAll('a[href*="/d/"]')].filter(vis).map(a=>(a.textContent||'').replace(/\\s+/g,' ').trim().slice(0,22)),
      anyRequests: [...document.querySelectorAll('*')].filter(n=>/request/i.test(n.textContent||'')&&(n.textContent||'').length<60).map(n=>(n.textContent||'').trim().slice(0,40)).slice(0,4)}; })()`);
};
