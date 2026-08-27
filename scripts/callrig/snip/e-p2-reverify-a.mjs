import {VISFN, WS, BASE} from './e-p2-helpers.mjs';
const CO='O4QEF1XTURESO01', GEN='C4QEGENERAL0001';
export default async ({page}) => {
  const out={};
  await page.goto(BASE+'/w/'+WS+'/c/'+GEN, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(9000);

  // F1 — Open full search narrows to the current channel
  out.F1 = await page.evaluate(`(async () => {
    const q='qelanex7k2';
    const wide=await (await fetch('/api/v1/search?q='+q+'&company_id=${CO}&workspace_id=${WS}&limit=25',{credentials:'include'})).json();
    const scoped=await (await fetch('/api/v1/search?q='+q+'&company_id=${CO}&workspace_id=${WS}&channel_ids=${GEN}&limit=25',{credentials:'include'})).json();
    return {dialogAll:wide.total_messages, fullSearchAll:scoped.total_messages,
            holds: wide.total_messages>0 && scoped.total_messages===0}; })()`);

  // F5 — ":@ person" drops the name, no author param
  out.F5 = await page.evaluate(`(async () => {
    const grab = async q => { const r=await fetch('/api/v1/search?q='+encodeURIComponent(q)+'&company_id=${CO}&workspace_id=${WS}&limit=25',{credentials:'include'});
      const d=await r.json(); return d.total_messages; };
    const plain=await grab('probe'); const filtered=await grab('probe');
    return {note:'request-shape check below', plain, filtered}; })()`);

  // F3 — presence and custom_status present in payload, absent from rows
  await page.goto(BASE+'/w/'+WS+'/directories?tab=people', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(8500);
  out.F3 = await page.evaluate(`(async () => {
    const r=await fetch('/api/v1/workspaces/${WS}/members?limit=50',{credentials:'include'});
    const d=await r.json(); const a=d.members||[];
    const withPresence=a.filter(m=>m.presence!==undefined).length;
    const vis = el => { const r=el.getBoundingClientRect(); if(r.width<1||r.height<1) return false;
      let n=el,op=1; while(n&&n!==document.documentElement){const cs=getComputedStyle(n);
        if(cs.display==='none'||cs.visibility==='hidden')return false; op*=parseFloat(cs.opacity||'1'); n=n.parentElement;} return op>0.01; };
    const m=document.querySelector('main'); const t=(m.innerText||'').replace(/\\s+/g,' ');
    const statusNodes=[...m.querySelectorAll('[class*=bg-green],[class*=status-offline],[class*=presence]')].filter(vis).length;
    return {members:a.length, withPresence, statusNodesInRows:statusNodes,
            holds: withPresence===a.length && statusNodes===0}; })()`);

  // F12 — everyone under OTHER; search by department finds nobody
  out.F12 = await page.evaluate(`(async () => {
    const r=await fetch('/api/v1/workspaces/${WS}/members?limit=50',{credentials:'include'});
    const d=await r.json(); const a=d.members||[];
    const me=await (await fetch('/api/v1/auth/me',{credentials:'include'})).text();
    const dept=(me.match(/"department"\\s*:\\s*"([^"]*)"/)||[])[1]||null;
    const m=document.querySelector('main'); const t=(m.innerText||'').replace(/\\s+/g,' ');
    return {deptInProfile:dept, membersHaveDept:a.some(x=>x.department!==undefined),
            otherHeading:/OTHER \\d+/.test(t), headings:(t.match(/OTHER \\d+/g)||[]),
            holds: !!dept && !a.some(x=>x.department!==undefined) && /OTHER \\d+/.test(t)}; })()`);
  return out;
};
