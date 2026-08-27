// Export the audit log and measure how many rows the produced file actually holds,
// by intercepting the Blob the page creates.
export default async ({page}) => {
  await page.goto('https://airion-cargo.store/w/W4QDF1XTURESO01/settings/admin/audit-log',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(8000);
  await page.evaluate(()=>{
    window.__blobs=[];
    const orig=URL.createObjectURL;
    URL.createObjectURL=function(b){
      try{ if(b instanceof Blob){ const r=new FileReader();
        r.onload=()=>window.__blobs.push({type:b.type,size:b.size,text:String(r.result)});
        r.readAsText(b); } }catch(e){}
      return orig.apply(this,arguments);
    };
  });
  const out={};
  out.serverTotal = await page.evaluate(async()=>{
    const r=await fetch('/api/v1/workspaces/W4QDF1XTURESO01/admin/audit-log?limit=100',{credentials:'include'});
    const j=await r.json(); return (Array.isArray(j)?j:(j.entries||[])).length;});
  const reqs=[]; const on=r=>{try{const u=new URL(r.url()); if(u.pathname.includes('audit-log')) reqs.push(u.pathname+u.search+' -> '+r.status());}catch{}};
  page.on('response', on);
  let dl=null; const grab=d=>{dl={name:d.suggestedFilename()}; d.cancel().catch(()=>{});};
  page.on('download', grab);
  await page.locator('main button').filter({hasText:new RegExp('^'+(process.env.QA_EXPORT||'Export JSON')+'$')}).first().click();
  await page.waitForTimeout(8000);
  page.off('response', on); page.off('download', grab);
  out.requests=reqs; out.download=dl;
  out.blob = await page.evaluate(()=>{
    const b=(window.__blobs||[])[0]; if(!b) return null;
    let n=null;
    try{const j=JSON.parse(b.text); n=Array.isArray(j)?j.length:(j.entries?j.entries.length:null);}
    catch(e){ const lines=b.text.trim().split('\n'); n='csv:'+(lines.length-1)+' data rows (+1 header)'; }
    return {type:b.type, size:b.size, rows:n, head:b.text.slice(0,90)};
  });
  return out;
};
