import {WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  await page.goto(`${BASE}/w/${WS}/files`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(5500);
  return await page.evaluate(async (ws)=>{
    const now=new Date();
    // truth from the API
    const r=await fetch(`/api/v1/users/me/files?workspace_id=${ws}`,{credentials:'include'});
    const b=await r.json(); const arr=b.files||b.data||[];
    const truth=(Array.isArray(arr)?arr:[]).map(f=>{
      const d=new Date(f.created_at||f.uploaded_at);
      return {name:f.name||f.filename, utc:d.toISOString().slice(0,16),
              localDay:d.toLocaleDateString('en-CA'),
              expected: d.toLocaleDateString('en-CA')===now.toLocaleDateString('en-CA') ? 'Today'
                      : (Math.floor((new Date(now.toLocaleDateString('en-CA'))-new Date(d.toLocaleDateString('en-CA')))/86400000)===1 ? 'Yesterday' : 'older')};
    });
    // what the screen says, per row
    const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0;};
    const rows=[...document.querySelectorAll('*')].filter(e=>vis(e)&&e.children.length===0
      && /\.(txt|png|pdf|jpg|y4m|wav|zip|mp4|mp3)$/i.test((e.textContent||'').trim()));
    const shown=rows.map(e=>{
      let n=e; for(let i=0;i<5&&n;i++){ if((n.textContent||'').length>40) break; n=n.parentElement; }
      const t=(n?n.textContent:'').replace(/\s+/g,' ');
      return {name:e.textContent.trim().slice(0,28),
              label:(t.match(/Today|Yesterday|\b\d{1,2}\s+\w{3,}\s+\d{4}\b|\w{3}\s+\d{1,2},\s+\d{4}/)||[''])[0]};
    });
    return {localNow: now.toLocaleDateString('en-CA')+' '+now.toTimeString().slice(0,5),
      utcNow: now.toISOString().slice(0,16), truth:truth.slice(0,6), shown:shown.slice(0,8)};
  }, WS);
};
