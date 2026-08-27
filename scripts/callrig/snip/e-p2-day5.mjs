import {WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  await page.goto(`${BASE}/w/${WS}/files`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(5500);
  return await page.evaluate(async (ws)=>{
    const now=new Date();
    const todayLocal=now.toLocaleDateString('en-CA');
    const r=await fetch(`/api/v1/users/me/files?workspace_id=${ws}`,{credentials:'include'});
    const b=await r.json(); const arr=b.files||b.data||[];
    const truth={}; (Array.isArray(arr)?arr:[]).forEach(f=>{
      const d=new Date(f.created_at||f.uploaded_at);
      const localDay=d.toLocaleDateString('en-CA');
      const diff=Math.round((new Date(todayLocal)-new Date(localDay))/86400000);
      truth[(f.name||f.filename)]={utc:d.toISOString().slice(0,16), localDay,
        expected: diff===0?'Today':diff===1?'Yesterday':'older'};
    });
    const vis=e=>{const rr=e.getBoundingClientRect();return rr.width>0&&rr.height>0;};
    const leaves=[...document.querySelectorAll('*')].filter(e=>vis(e)&&e.children.length===0
      && /·\s*(Today|Yesterday|\d)/.test((e.textContent||'').trim()));
    const shown=leaves.map(e=>{
      let row=e; for(let i=0;i<6&&row;i++){ if(row.tagName==='BUTTON') break; row=row.parentElement; }
      const nm=row? [...row.querySelectorAll('*')].filter(x=>vis(x)&&x.children.length===0)
        .map(x=>x.textContent.trim()).find(t=>/\.(txt|png|zip|wav|mp4|y4m)$/i.test(t)) : null;
      return {name:nm, label:(e.textContent.trim().split('·').pop()||'').trim()};
    }).filter(o=>o.name);
    const cmp=shown.map(s=>({name:s.name.slice(0,26), shown:s.label,
      expected: (truth[s.name]||{}).expected||'?', utc:(truth[s.name]||{}).utc||'?',
      ok: (truth[s.name]||{}).expected===s.label}));
    return {localNow: todayLocal+' '+now.toTimeString().slice(0,5), utcNow: now.toISOString().slice(0,16),
      comparison: cmp, mismatches: cmp.filter(c=>!c.ok)};
  }, WS);
};
