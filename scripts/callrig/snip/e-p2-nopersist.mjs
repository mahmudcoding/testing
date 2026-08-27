import {VISFN, WS, BASE} from './e-p2-helpers.mjs';
const clickLabel = async (page, label) => {
  const t = await page.evaluate(`(() => { ${VISFN}
     const b=[...document.querySelector('main').querySelectorAll('button')].filter(vis)
       .find(x=>(x.innerText||'').trim()===${JSON.stringify(label)});
     if(!b) return null; const r=b.getBoundingClientRect();
     return {cx:Math.round(r.x+r.width/2), cy:Math.round(r.y+r.height/2)}; })()`);
  if(!t) return false;
  await page.mouse.move(t.cx,t.cy); await page.waitForTimeout(200);
  await page.mouse.down(); await page.waitForTimeout(100); await page.mouse.up();
  await page.waitForTimeout(3000); return true;
};
const heading = `(() => ((document.querySelector('main').innerText||'').replace(/\\s+/g,' ')
   .match(/(MONDAY|TUESDAY|WEDNESDAY|THURSDAY|FRIDAY|SATURDAY|SUNDAY)\\s+\\d{1,2}\\s+\\w+\\s+\\d{4}/i)||[''])[0])()`;
export default async ({page}) => {
  const out={};
  // first: what is actually in storage that mentions a date or focus?
  await page.goto(BASE+'/w/'+WS+'/calendar', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(9000);
  out.storageBefore = await page.evaluate(`(() => {
     const dump=(s)=>Object.keys(s).map(k=>({k, v:String(s.getItem(k)).slice(0,90)}))
        .filter(x=>/focus|date|calendar|2026-08/i.test(x.k+x.v));
     return {local:dump(localStorage).slice(0,5), session:dump(sessionStorage).slice(0,5),
             nLocal:localStorage.length, nSession:sessionStorage.length}; })()`);
  // clear everything and cold-load
  await page.evaluate(`(() => { localStorage.clear(); sessionStorage.clear(); })()`);
  await page.goto('about:blank'); await page.waitForTimeout(1200);
  await page.goto(BASE+'/w/'+WS+'/calendar', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(11000);
  out.clock = await page.evaluate(`(() => { const n=new Date();
     return {local:n.toDateString(), utc:n.toISOString().slice(0,10)}; })()`);
  await clickLabel(page,'Day');
  out.dayAfterStorageCleared = await page.evaluate(heading);
  out.storageAfter = await page.evaluate(`(() => ({nLocal:localStorage.length, nSession:sessionStorage.length}))()`);
  return out;
};
