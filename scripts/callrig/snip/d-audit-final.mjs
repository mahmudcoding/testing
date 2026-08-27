export default async ({page}) => {
  const WS='W4QDF1XTURESO01', CO='O4QDF1XTURESO01';
  const reqs=[];
  page.on('response', r=>{ if(/audit/i.test(r.url())) reqs.push({s:r.status(), m:r.request().method(), u:r.url().replace('https://airion-cargo.store','')}); });
  await page.goto(`https://airion-cargo.store/w/${WS}/settings/admin/audit-log`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(5000);
  const shown = await page.evaluate(()=>{const m=document.querySelector('main');return (m.innerText||'').replace(/\s+/g,' ').slice(230,700);});
  const api = await page.evaluate(async(a)=>{
    const p=async u=>{const r=await fetch(u,{credentials:'include'});const t=await r.text();let n=null;try{const j=JSON.parse(t);n=Array.isArray(j)?j.length:(j.entries||[]).length;}catch(e){}
      return {s:r.status, count:n, sample:t.slice(0,200)};};
    return {company:await p(`/api/v1/companies/${a.CO}/admin/audit-log?limit=100`), workspace:await p(`/api/v1/workspaces/${a.WS}/admin/audit-log?limit=100`)};
  },{WS,CO});
  return {pageRequests:reqs, pageShows:shown, api};
};
