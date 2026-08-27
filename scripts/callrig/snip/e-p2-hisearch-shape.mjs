export default async ({page}) => {
  return await page.evaluate(async () => {
    const me = await (await fetch('/api/v1/auth/me',{credentials:'include'})).json();
    const d = me.data || me;
    const co = d.company_id, ws = d.workspace_id;
    const u = `/api/v1/search?q=${encodeURIComponent('qa')}&company_id=${co}&workspace_id=${ws}&limit=25`;
    const r = await fetch(u,{credentials:'include'});
    const t = await r.text();
    return { me_keys: Object.keys(d).slice(0,12), co, ws, status: r.status, body: t.slice(0,700) };
  });
};
