import {VISFN, WS, BASE} from './e-p2-helpers.mjs';
const boxVisFn = `const boxVis = el => { const r=el.getBoundingClientRect(); if(r.width<1||r.height<1) return false;
    let n=el,op=1; while(n&&n!==document.documentElement){const cs=getComputedStyle(n); if(cs.display==='none'||cs.visibility==='hidden')return false; op*=parseFloat(cs.opacity||'1'); n=n.parentElement;} return op>0.01; };`;
export default async ({page}) => {
  const out={};
  await page.goto(BASE+'/w/'+WS+'/calendar', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(7000);
  out.view = await page.evaluate(`(() => { ${VISFN}
    const m=document.querySelector('main');
    const chips=[...document.querySelectorAll('[data-testid*="event-chip"],[data-testid*="chip"]')];
    return { header:(m.innerText||'').replace(/\\n+/g,' | ').slice(0,160),
      chipTestids:[...new Set(chips.map(c=>c.getAttribute('data-testid')))],
      chipsAll: chips.map(c=>(vis(c)?'V':'x')+' '+(c.innerText||'').replace(/\\s+/g,' ').slice(0,30)),
      activeView: [...document.querySelectorAll('button')].filter(b=>vis(b)&&/^(Day|Week|Month)$/.test((b.textContent||'').trim())).map(b=>(b.textContent||'').trim()+'='+(b.getAttribute('aria-pressed')||b.getAttribute('data-state')||'?')).join(' ') }; })()`);
  out.apiMeetings = await page.evaluate(`(async()=>{ const r=await fetch('/api/v1/calendar/meetings?workspace_id=${WS}',{credentials:'include'}); let j=null; try{j=await r.json()}catch(e){}
    const d=j?.meetings??j?.data??j; const a=Array.isArray(d)?d:[];
    return {s:r.status, n:a.length, rows:a.map(m=>m.title+' @'+m.starts_at+' id='+m.id).slice(0,8)}; })()`);
  // member picker structure
  await page.evaluate(`(() => { ${VISFN}
    const n=[...document.querySelectorAll('button,a')].filter(vis).find(b=>/new meeting/i.test(b.getAttribute('aria-label')||b.textContent||'')); n&&n.click(); })()`);
  await page.waitForTimeout(3000);
  out.memberRows = await page.evaluate(`(() => { ${VISFN} ${boxVisFn}
    const d=[...document.querySelectorAll('[role=dialog]')].filter(boxVis).pop();
    const cands=[...d.querySelectorAll('*')].filter(n=>vis(n)&&/QA Bob/.test(n.textContent||'')&&(n.textContent||'').length<60);
    return cands.slice(0,6).map(n=>'<'+n.tagName+(n.getAttribute('role')?' role='+n.getAttribute('role'):'')+'> nodes='+n.querySelectorAll('*').length+' text="'+(n.innerText||'').replace(/\\s+/g,' ').trim().slice(0,30)+'"'); })()`);
  return out;
};
