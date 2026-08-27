import {VISFN, WS, BASE} from './e-p2-helpers.mjs';
const boxVisFn = `const boxVis = el => { const r=el.getBoundingClientRect(); if(r.width<1||r.height<1) return false;
    let n=el,op=1; while(n&&n!==document.documentElement){const cs=getComputedStyle(n); if(cs.display==='none'||cs.visibility==='hidden')return false; op*=parseFloat(cs.opacity||'1'); n=n.parentElement;} return op>0.01; };`;
export default async ({page}) => {
  const out={};
  out.me = await page.evaluate(`(async()=>{const r=await fetch('/api/v1/auth/me',{credentials:'include'});const j=await r.json().catch(()=>({}));return j?.email||'?';})()`);
  out.build = await page.evaluate(`(async()=>{ const r=await fetch('/',{credentials:'include'}); const t=await r.text();
    return (t.match(/data-dpl-id="[^"]*"/)||['(not in this response)'])[0]; })()`);

  // ---- BUG-1: presence absent from Directories People
  await page.goto(BASE+'/w/'+WS+'/directories?tab=people', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(8000);
  out.bug1 = await page.evaluate(`(async()=>{
    const pr=await (await fetch('/api/v1/workspaces/${WS}/presence',{credentials:'include'})).json();
    const online=(pr.presences||[]).filter(p=>p.online).length, total=(pr.presences||[]).length;
    const mem=await (await fetch('/api/v1/workspaces/${WS}/members',{credentials:'include'})).json();
    const withPresence=(mem.members||[]).filter(m=>m.presence!==undefined).length;
    const main=document.querySelector('main');
    const rows=[...main.querySelectorAll('div')].filter(d=>String(d.className).includes('min-h-16')&&/QA /.test(d.innerText||''));
    const statusNodes=rows.reduce((n,r)=>n+[...r.querySelectorAll('span')].filter(s=>/bg-green|bg-status|status/i.test(String(s.className||''))).length,0);
    return {apiOnline:online+'/'+total+' online', membersCarryingPresence:withPresence, personRows:rows.length, statusNodesInRows:statusNodes}; })()`);

  // ---- BUG-3: full search scope
  out.bug3 = {};
  for (const [tag, ch] of [['fromGeneral','C4QEGENERAL0001'],['fromPrivate','C4QEPRIVATE0001']]) {
    await page.goto(BASE+'/w/'+WS+'/c/'+ch+'/search?q=qelanex7k2', {waitUntil:'domcontentloaded'});
    await page.waitForTimeout(7000);
    out.bug3[tag] = await page.evaluate(`(() => { const m=document.querySelector('main');
      const t=(m.innerText||'').replace(/\\n+/g,' ');
      const c=t.match(/All\\s+(\\d+)\\s+Messages\\s+(\\d+)/);
      return (c? 'All='+c[1]+' Msg='+c[2] : 'unparsed') + (/No results/.test(t)?' | NO-RESULTS':' | has results')
        + (/in this workspace/.test(t)?' | promises workspace scope':''); })()`);
  }
  return out;
};
