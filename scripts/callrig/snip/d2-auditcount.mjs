export default async ({page}) => {
  await page.goto('https://airion-cargo.store/w/W4QDF1XTURESO01/settings/admin/audit-log',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(6000);
  const dom = await page.evaluate(()=>({rows: document.querySelectorAll('tbody tr').length,
    prev: (()=>{const b=[...document.querySelectorAll('button')].find(x=>/^Previous$/.test(x.innerText.trim())); return b?b.disabled:null;})(),
    next: (()=>{const b=[...document.querySelectorAll('button')].find(x=>/^Next$/.test(x.innerText.trim())); return b?b.disabled:null;})()}));
  const api = await page.evaluate(async()=>{
    const g=async u=>{const r=await fetch(u,{credentials:'include'}); const j=await r.json(); return Array.isArray(j)?j.length:(j.entries?j.entries.length:JSON.stringify(j).slice(0,80));};
    return {ws: await g('/api/v1/workspaces/W4QDF1XTURESO01/admin/audit-log?limit=100'),
            co: await g('/api/v1/companies/O4QDF1XTURESO01/admin/audit-log?limit=100')};
  });
  return {dom, api};
};
