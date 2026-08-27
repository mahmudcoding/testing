export default async ({ page }) => {
  const r = await page.evaluate(async () => {
    const me = await fetch('/api/v1/auth/me', {credentials:'include'}).then(r=>r.json()).catch(e=>({err:String(e)}));
    return { email: me?.email ?? me?.data?.email ?? null, lang: me?.language ?? me?.data?.language ?? null,
             keys: Object.keys(me||{}).slice(0,12), url: location.href };
  });
  return r;
};
