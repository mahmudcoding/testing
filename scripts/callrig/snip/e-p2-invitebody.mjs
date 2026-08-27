import {WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  const out={};
  await page.goto(BASE+'/w/'+WS+'/calendar', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(5000);
  const j = await page.evaluate(`(async () => {
    const r = await fetch('/api/v1/notifications?limit=12', {credentials:'include'});
    return {st:r.status, t:(await r.text()).slice(0,4000)};
  })()`);
  out.status = j.st;
  let d=null; try{ d=JSON.parse(j.t); }catch(e){ out.parse='partial'; }
  if (d) {
    const arr = d.notifications || d.data || d.items || [];
    out.count = arr.length;
    out.rows = arr.slice(0,6).map(n => ({
      type: n.type, title: n.title, body: (n.body||'').slice(0,300),
      actor: n.actor_name || n.actor?.name, created: n.created_at
    }));
  } else { out.raw = j.t.slice(0,1500); }
  return out;
};
