import {WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  await page.goto(`${BASE}/w/${WS}/directories?tab=people`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(5000);
  const api = await page.evaluate(async (ws)=>{
    const g=async u=>{const x=await fetch(u,{credentials:'include'});let b=null;try{b=await x.json()}catch{}return{s:x.status,b}};
    const p=await g(`/api/v1/workspaces/${ws}/presence`);
    const arr=p.b?.presence||p.b?.users||p.b?.data||(Array.isArray(p.b)?p.b:[]);
    return {status:p.s, shape: p.b? Object.keys(p.b).slice(0,6):[],
      entries:(Array.isArray(arr)?arr:[]).map(e=>({u:e.user_id||e.id, st:e.status||e.presence||e.state,
        last:e.last_seen_at||e.last_active_at||null})).slice(0,10)};
  }, WS);
  // what the People rows show, and what a profile popup shows
  const ui = await page.evaluate(()=>{
    const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0;};
    const m=document.querySelector('main');
    const rows=[...m.querySelectorAll('button')].filter(vis)
      .filter(e=>/^Open .*'s profile$/.test(e.getAttribute('aria-label')||''));
    return {rowCount:rows.length,
      anyPresenceWord: /online|offline|away|active|busy|в сети|не в сети/i.test(m.innerText),
      rowText: rows.slice(0,3).map(e=>{
        let n=e; for(let i=0;i<4&&n;i++){ if((n.textContent||'').length>25) break; n=n.parentElement; }
        return (n?n.textContent:'').replace(/\s+/g,' ').slice(0,60);})};
  });
  // open Bob's profile popup and look for presence there
  await page.locator('main button[aria-label="Open QA Bob\'s profile"]').first().click();
  await page.waitForTimeout(2500);
  const popup = await page.evaluate(()=>{
    const vis=e=>{let x=e,o=1;while(x&&x!==document.documentElement){const s=getComputedStyle(x);if(s.display==='none'||s.visibility==='hidden')return false;o*=parseFloat(s.opacity||'1');x=x.parentElement;}const r=e.getBoundingClientRect();return o>0.01&&r.width>0&&r.height>0;};
    const d=[...document.querySelectorAll('[role=dialog],[data-state=open]')].filter(vis)
      .filter(e=>/Bob/i.test(e.innerText||'')).sort((a,b)=>a.innerText.length-b.innerText.length)[0];
    if(!d) return {found:false};
    const t=d.innerText.replace(/\s+/g,' ');
    return {found:true, text:t.slice(0,240),
      presenceWord:(t.match(/online|offline|away|active|busy|last seen[^.]*/i)||[''])[0]};
  });
  return {api, ui, popup};
};
