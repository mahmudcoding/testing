import {WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  await page.goto(`${BASE}/w/${WS}/c/C4QEGENERAL0001`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4000);
  return await page.evaluate(async ()=>{
    const r=await fetch('/api/v1/notifications?limit=60',{credentials:'include'});
    const b=await r.json();
    const arr=b.notifications||b.data||(Array.isArray(b)?b:[]);
    const rows=(Array.isArray(arr)?arr:[]).map(n=>({
      t:(n.title||n.title_key||'').slice(0,30), body:(n.body||'').slice(0,52),
      ev:n.event_type||n.type, at:(n.created_at||'').slice(11,19)}));
    return {total:rows.length,
      remindersForTonight: rows.filter(x=>/QA-E (pwd|allday)/.test(x.body)),
      allReminderEvents: [...new Set(rows.map(x=>x.ev))].slice(0,10),
      newest: rows.slice(0,8)};
  });
};
