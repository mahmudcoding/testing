// Capture the BODY of every audit-log request the export makes, and count rows in each.
export default async ({page}) => {
  await page.goto('https://airion-cargo.store/w/W4QDF1XTURESO01/settings/admin/audit-log',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(8000);
  const pages=[];
  const on=async r=>{
    try{ const u=new URL(r.url());
      if(!u.pathname.includes('admin/audit-log')) return;
      const t=await r.text();
      let n=null, first=null, last=null;
      try{const j=JSON.parse(t); const arr=Array.isArray(j)?j:(j.entries||[]);
        n=arr.length; first=arr[0]&&arr[0].created_at; last=arr[arr.length-1]&&arr[arr.length-1].created_at;}catch(e){n='unparsed';}
      pages.push({q:u.search||'(none)', status:r.status(), rows:n, firstAt:first, lastAt:last});
    }catch(e){}
  };
  page.on('response', on);
  await page.evaluate(()=>{ window.__blobs=[]; const orig=URL.createObjectURL;
    URL.createObjectURL=function(b){ try{ if(b instanceof Blob){const rd=new FileReader();
      rd.onload=()=>window.__blobs.push(String(rd.result)); rd.readAsText(b);} }catch(e){} return orig.apply(this,arguments); }; });
  await page.locator('main button').filter({hasText:/^Export JSON$/}).first().click();
  await page.waitForTimeout(9000);
  page.off('response', on);
  const file = await page.evaluate(()=>{
    const b=(window.__blobs||[])[0]; if(!b) return null;
    try{const j=JSON.parse(b); const a=Array.isArray(j)?j:(j.entries||[]);
      const ids=a.map(x=>x.id); return {rows:a.length, uniqueIds:new Set(ids).size};}catch(e){return {raw:b.length};}
  });
  return {requests:pages, file};
};
