import {VISFN, CLICKDEEPEST, WS, BASE} from './e-p2-helpers.mjs';
const CO='O4QEF1XTURESO01', GEN='C4QEGENERAL0001';
export default async ({page}) => {
  const out={};
  await page.goto(BASE+'/w/'+WS+'/c/'+GEN, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(9000);
  out.who = await page.evaluate(`(async () => { const r=await fetch('/api/v1/auth/me',{credentials:'include'});
     const j=await r.json().catch(()=>({})); return j.email||null; })()`);
  // F1: full search narrows to the current channel
  out.F1 = await page.evaluate(`(async () => {
    const q='qelanex7k2';
    const wide=await (await fetch('/api/v1/search?q='+q+'&company_id=${CO}&workspace_id=${WS}&limit=25',{credentials:'include'})).json();
    const scoped=await (await fetch('/api/v1/search?q='+q+'&company_id=${CO}&workspace_id=${WS}&channel_ids=${GEN}&limit=25',{credentials:'include'})).json();
    return {dialog:wide.total_messages, page:scoped.total_messages, holds:wide.total_messages>0&&scoped.total_messages===0}; })()`);
  // F9: everyone under OTHER, department absent from the payload
  await page.goto(BASE+'/w/'+WS+'/directories?tab=people', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(8500);
  out.F9 = await page.evaluate(`(async () => {
    const r=await fetch('/api/v1/workspaces/${WS}/members?limit=50',{credentials:'include'});
    const d=await r.json(); const a=d.members||[];
    const t=((document.querySelector('main')||document.body).innerText||'').replace(/\\s+/g,' ');
    return {members:a.length, anyDept:a.some(x=>x.department!==undefined),
            headings:(t.match(/OTHER \\d+/g)||[]), holds:!a.some(x=>x.department!==undefined) && /OTHER \\d+/.test(t)}; })()`);
  // F7: Cmd+K inside a channel opens Insert link
  await page.goto(BASE+'/w/'+WS+'/c/'+GEN, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(8500);
  await page.locator('div[contenteditable="true"][aria-label="Compose message"]').first().click();
  await page.waitForTimeout(900);
  await page.keyboard.press('Meta+k'); await page.waitForTimeout(3500);
  out.F7 = await page.evaluate(`(() => { ${VISFN}
     const dlgs=[...document.querySelectorAll('[role=dialog]')].filter(e=>e.getBoundingClientRect().width>120)
       .map(d=>(d.innerText||'').replace(/\\s+/g,' ').slice(0,40));
     const a=document.activeElement;
     return {dialogs:dlgs, active:a?a.tagName+'['+(a.getAttribute('aria-label')||a.getAttribute('placeholder')||'')+']':'-',
             holds: !dlgs.some(t=>/Global search/.test(t))}; })()`);
  await page.keyboard.press('Escape'); await page.waitForTimeout(1000); await page.keyboard.press('Escape');
  // F13: the recipient's shared_with is empty
  out.F13 = await page.evaluate(`(async () => {
    const r=await fetch('/api/v1/users/me/files?workspace_id=${WS}&scope=accessible&limit=50',{credentials:'include'});
    const d=await r.json(); const a=d.files||[];
    return {n:a.length, allEmpty:a.length>0 && a.every(f=>!(f.shared_with||[]).length),
            sample:a.slice(0,3).map(f=>(f.filename||'')+':'+((f.shared_with||[]).length))}; })()`);
  return out;
};
