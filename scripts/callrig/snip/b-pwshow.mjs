export default async ({page}) => {
  const out={};
  out.beforeType = await page.evaluate(()=>{ const i=[...document.querySelectorAll('input')].find(x=>/password/i.test(x.placeholder||'')); return i? {type:i.type, val:String(i.value), len:i.value.length}:null; });
  out.clickedShow = await page.evaluate(()=>{ const b=[...document.querySelectorAll('button')].find(x=>/show password/i.test((x.getAttribute('aria-label')||x.innerText||''))); if(b){b.click(); return true;} return false; });
  await page.waitForTimeout(1500);
  out.afterShow = await page.evaluate(()=>{ const i=[...document.querySelectorAll('input')].find(x=>/password/i.test(x.placeholder||'')); return i? {type:i.type, val:String(i.value), len:i.value.length}:null; });
  // now Save with the field left empty, toggle still on
  out.toggleBefore = await page.evaluate(()=>{ const b=[...document.querySelectorAll('button')].find(x=>(x.getAttribute('aria-label')||'')==='Password protection'); return b? b.getAttribute('aria-checked'):null; });
  out.savedClick = await page.evaluate(()=>{ const b=[...document.querySelectorAll('[role=dialog] button')].find(x=>(x.innerText||'').trim()==='Save'); if(b){b.click(); return true;} return false; });
  await page.waitForTimeout(4500);
  out.afterSave = await page.evaluate(async()=>{
    const vis = el => { const r=el.getBoundingClientRect(); return r.width>0&&r.height>0; };
    const j=await (await fetch('/api/v1/meetings/current',{credentials:'include'})).json().catch(()=>null); const m=j&&j.meeting;
    return { pw: m&&m.password_protected,
      toggle: (()=>{const b=[...document.querySelectorAll('button')].find(x=>(x.getAttribute('aria-label')||'')==='Password protection'); return b? b.getAttribute('aria-checked'):null;})(),
      alerts: [...document.querySelectorAll('[role=alert],[class*="toast"],[class*="error"]')].filter(vis).map(x=>x.innerText.replace(/\s+/g,' ').trim().slice(0,120)).filter(Boolean).slice(0,5),
      stillOpen: !!document.querySelector('button[aria-label="Close meeting settings"]')
    };
  });
  return out;
};
