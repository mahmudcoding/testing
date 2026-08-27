export default async ({ page }) => {
  return await page.evaluate(async()=>{
    const r=await fetch('/api/v1/security/sessions',{credentials:'include'});
    const t=await r.text(); let n=null;
    try{const p=JSON.parse(t); const a=p.sessions||p.data||(Array.isArray(p)?p:[]); n=a.length;}catch{}
    return {s:r.status, count:n, head:t.slice(0,180)};
  });
};
