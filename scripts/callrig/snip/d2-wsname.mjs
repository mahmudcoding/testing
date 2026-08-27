export default async ({ page }) => {
  const WS='W4QDF1XTURESO01';
  return await page.evaluate(async (WS) => {
    const r=await fetch(`/api/v1/users/me/workspaces`,{credentials:'include'}); const t=await r.text();
    let ws=null; try{ const p=JSON.parse(t); const arr=p.workspaces||p.data||p; ws=(Array.isArray(arr)?arr:[]).find(x=>x.id===WS);}catch{}
    return { name: ws?.name, raw: ws? JSON.stringify(ws).slice(0,180) : t.slice(0,180) };
  }, WS);
};
