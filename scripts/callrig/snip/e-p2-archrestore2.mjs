import {VISFN, WS, BASE} from './e-p2-helpers.mjs';
const api = `(async () => {
  const g = async (u) => { const r = await fetch(u, {credentials:'include'}); let j=null; try{j=await r.json();}catch(e){}
    return {s:r.status, j}; };
  const act = await g('/api/v1/workspaces/${WS}/channels');
  const arc = await g('/api/v1/users/me/channels/archived?workspace_id=${WS}');
  const pick = o => { const d = o.j?.data ?? o.j; const arr = Array.isArray(d)? d : (d?.channels||d?.items||[]); return arr.map(c=>(c.name||c.id)+(c.is_archived?'[ARC]':'')); };
  return {activeStatus: act.s, active: pick(act), archivedStatus: arc.s, archived: pick(arc)};
})()`;
export default async ({page}) => {
  const out={}; const reqs=[];
  page.on('request', r=>{ const u=r.url(); if(u.includes('/api/v1/')) reqs.push(r.method()+' '+u.replace(/^https:\/\/[^/]+/,'').slice(0,80)); });
  await page.goto(BASE+'/w/'+WS+'/c/C4QEGENERAL0001', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4500);
  out.before = await page.evaluate(api);
  await page.locator('button[aria-label="Open archived channels"]').first().click();
  await page.waitForTimeout(1800);
  reqs.length=0;
  await page.getByRole('button', {name:'Open', exact:true}).first().click();
  await page.waitForTimeout(3500);
  out.urlAfter = page.url().replace(/^https:\/\/[^/]+/,'');
  out.reqsOnOpen = reqs.slice(0,10);
  out.after = await page.evaluate(api);
  out.mainText = await page.evaluate(`(() => (document.querySelector('main')?.innerText||'').replace(/\\n+/g,' | ').slice(0,450))()`);
  out.sidebar = await page.evaluate(`(() => [...document.querySelectorAll('a[href*="/c/"]')].map(a=>(a.textContent||'').trim().slice(0,16)).join(' '))()`);
  out.composer = await page.evaluate(`(() => { const c=document.querySelector('div[contenteditable="true"][aria-label="Compose message"]'); return c? 'present editable='+c.getAttribute('contenteditable') : 'ABSENT'; })()`);
  return out;
};
