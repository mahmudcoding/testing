import {WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  await page.goto(`${BASE}/w/${WS}/files`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(5500);
  return await page.evaluate(async (ws)=>{
    const r=await fetch(`/api/v1/users/me/files?workspace_id=${ws}`,{credentials:'include'});
    const b=await r.json(); const arr=b.files||b.data||[];
    const names={};
    (Array.isArray(arr)?arr:[]).forEach(f=>{const n=f.name||f.filename; (names[n]=names[n]||[]).push({id:f.id, size:f.size, at:(f.created_at||'').slice(0,19)});});
    const dups=Object.entries(names).filter(([n,v])=>v.length>1);
    // what the UI shows for a duplicated name
    const vis=e=>{const r2=e.getBoundingClientRect();return r2.width>0&&r2.height>0;};
    const uiRows=[...document.querySelectorAll('*')].filter(e=>vis(e)&&e.children.length===0
      && dups.some(([n])=>((e.textContent||'').trim()===n)))
      .map(e=>{let row=e; for(let i=0;i<5&&row;i++){ if(row.tagName==='BUTTON') break; row=row.parentElement; }
        return row? row.textContent.replace(/\s+/g,' ').trim().slice(0,60) : null;}).filter(Boolean);
    return {totalFiles:(Array.isArray(arr)?arr:[]).length,
      duplicateNames:dups.map(([n,v])=>({name:n, copies:v.length, entries:v})),
      uiRowsForDuplicates:[...new Set(uiRows)]};
  }, WS);
};
