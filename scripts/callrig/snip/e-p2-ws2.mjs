import {VISFN, CLICKDEEPEST, WS, BASE} from './e-p2-helpers.mjs';
const W2='W4OWJSPNXQJYZ5R';
const boxVisFn = `const boxVis = el => { const r=el.getBoundingClientRect(); if(r.width<1||r.height<1) return false;
    let n=el,op=1; while(n&&n!==document.documentElement){const cs=getComputedStyle(n); if(cs.display==='none'||cs.visibility==='hidden')return false; op*=parseFloat(cs.opacity||'1'); n=n.parentElement;} return op>0.01; };`;
export default async ({page}) => {
  const out={}; const writes=[];
  page.on('response', async r=>{ const u=r.url(); if(u.includes('/api/v1/')&&r.request().method()!=='GET'){
    let b=''; try{b=(await r.text()).slice(0,150);}catch(e){}
    writes.push(r.request().method()+' '+u.replace(/^https:\/\/[^/]+/,'').slice(0,46)+' -> '+r.status()+' '+b); }});
  await page.goto(BASE+'/w/'+W2+'/directories', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(7000);
  out.ws2Before = await page.evaluate(`(() => { ${VISFN}
    return {channels:[...document.querySelectorAll('a[href*="/c/"]')].filter(vis).map(a=>(a.textContent||'').trim().slice(0,20)),
      main:(document.querySelector('main')?.innerText||'').replace(/\\n+/g,' | ').slice(0,200)}; })()`);
  // create a channel in workspace 2
  await page.getByRole('button',{name:'Add channel'}).first().click();
  await page.waitForTimeout(2500);
  await page.locator('[role=dialog] input').first().fill('second-ws-channel');
  await page.waitForTimeout(900);
  writes.length=0;
  out.create = await page.evaluate(`(() => { ${VISFN} ${CLICKDEEPEST} ${boxVisFn}
    const d=[...document.querySelectorAll('[role=dialog]')].filter(boxVis).pop();
    return clickDeepest(d, /^Create$/); })()`);
  await page.waitForTimeout(6000);
  out.writes = writes.slice(0,2);
  out.ws2After = await page.evaluate(`(() => { ${VISFN}
    return {channels:[...document.querySelectorAll('a[href*="/c/"]')].filter(vis).map(a=>(a.textContent||'').trim().slice(0,22)),
      url: location.pathname}; })()`);
  // switch back to workspace 1 and confirm its sidebar is not polluted
  await page.goto(BASE+'/w/'+WS+'/c/C4QEGENERAL0001', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(7000);
  out.ws1After = await page.evaluate(`(() => { ${VISFN}
    return {channels:[...document.querySelectorAll('a[href*="/c/"]')].filter(vis).map(a=>(a.textContent||'').trim().slice(0,22)),
      searchLabel:(()=>{const b=[...document.querySelectorAll('button')].find(b=>vis(b)&&/^Search /.test(b.getAttribute('aria-label')||'')); return b?b.getAttribute('aria-label'):null;})()}; })()`);
  return out;
};
