export default async ({page}) => {
  await page.goto('https://airion-cargo.store/', {waitUntil:'domcontentloaded'});
  const me = await page.evaluate(async () => {
    const r = await fetch('/api/v1/auth/me', {credentials:'include'});
    if (!r.ok) return {status:r.status};
    const j = await r.json();
    return {status:r.status, email:j.email||j.user?.email, id:j.id||j.user?.id, username:j.username||j.user?.username};
  });
  return {url: page.url(), me, vis: await page.evaluate(()=>document.visibilityState)};
}
