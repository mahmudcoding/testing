import {VISFN, WS, BASE} from './e-p2-helpers.mjs';
const api = `async () => {
  const g = async (u) => { const r = await fetch(u, {credentials:'include'}); let j=null; try{j=await r.json();}catch(e){}
    return {s:r.status, j}; };
  const act = await g('/api/v1/workspaces/${WS}/channels');
  const arc = await g('/api/v1/users/me/channels/archived?workspace_id=${WS}');
  const pick = o => { const d = o.j?.data ?? o.j; const arr = Array.isArray(d)? d : (d?.channels||d?.items||[]); return arr.map(c=>c.name||c.id); };
  return {activeStatus: act.s, active: pick(act), archivedStatus: arc.s, archived: pick(arc)};
}`;
export default async ({page}) => {
  const out={};
  await page.goto(BASE+'/w/'+WS+'/c/C4QEGENERAL0001', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4500);
  out.before = await page.evaluate(api);
  await page.locator('button[aria-label="Open archived channels"]').first().click();
  await page.waitForTimeout(1800);
  // click the "Open" control inside the dialog
  const dlg = page.locator('[role=dialog]').last();
  out.openBtnCount = await dlg.locator('button:has-text("Open")').count();
  await dlg.locator('button:has-text("Open")').first().click();
  await page.waitForTimeout(3000);
  out.urlAfter = page.url().replace(/^https:\/\/[^/]+/,'');
  out.after = await page.evaluate(api);
  out.screenText = await page.evaluate(`(() => (document.querySelector('main')?.innerText||'').replace(/\\n+/g,' | ').slice(0,500))()`);
  out.sidebarChannels = await page.evaluate(`(() => [...document.querySelectorAll('a[href*="/c/"]')].map(a=>(a.textContent||'').trim().slice(0,16)).join(' '))()`);
  return out;
};
