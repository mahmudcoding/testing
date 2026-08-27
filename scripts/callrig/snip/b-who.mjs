export default async ({page}) => {
  const r = await page.evaluate(async () => {
    const me = await fetch('/api/v1/auth/me', {credentials:'include'}).then(r=>r.json()).catch(e=>({err:String(e)}));
    return {url: location.href, vis: document.visibilityState,
            me: me?.data?.email || me?.email || JSON.stringify(me).slice(0,200)};
  });
  return r;
};
