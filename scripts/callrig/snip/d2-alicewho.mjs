export default async ({ page }) => {
  const CO='O4QDF1XTURESO01', WS='W4QDF1XTURESO01';
  return await page.evaluate(async ({CO,WS}) => {
    const j = async u => { const r=await fetch(u,{credentials:'include'}); const t=await r.text(); try{return JSON.parse(t);}catch{return t.slice(0,200);} };
    const m = await j(`/api/v1/companies/${CO}/members?limit=50`);
    const arr = m?.members || m?.data || [];
    const pick = arr.filter(x => /alice|carol|dave/.test(JSON.stringify(x)));
    return pick.map(u => ({ email: u.email || u.user?.email, roles: (u.roles||u.role_ids||[]).map(r=>r.name||r.id||r) }));
  }, {CO,WS});
};
