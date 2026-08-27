export default async ({page}) => {
  await page.goto('https://airion-cargo.store/', {waitUntil:'domcontentloaded'});
  const me = await page.evaluate(async () => {
    const r = await fetch('/api/v1/auth/me', {credentials:'include'});
    if (!r.ok) return {status:r.status};
    const j = await r.json();
    return {status:r.status, email:j.email||j.data?.email, id:j.id||j.data?.id, name:j.display_name||j.data?.display_name};
  });
  return {url: page.url(), me};
};
