export default async ({ page }) => {
  const CO='O4QDF1XTURESO01';
  return await page.evaluate(async (CO) => {
    const j=async u=>{const r=await fetch(u,{credentials:'include'});return {s:r.status,t:(await r.text()).slice(0,180)};};
    const me=await (await fetch('/api/v1/auth/me',{credentials:'include'})).json();
    return { who: me.email,
      privacy: await j(`/api/v1/users/me/privacy/${CO}`),
      roles: await j(`/api/v1/companies/${CO}/roles`) };
  }, CO);
};
