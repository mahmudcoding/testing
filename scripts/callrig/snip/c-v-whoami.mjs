export default async ({page}) => {
  await page.goto('https://airion-cargo.store/', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4000);
  return await page.evaluate(async () => {
    const r = await fetch('/api/v1/auth/me', {credentials:'include'});
    const t = await r.text();
    let who = t.slice(0,300);
    try { const j = JSON.parse(t); who = {id:j.id||j.user?.id, email:j.email||j.user?.email, name:j.name||j.user?.name}; } catch(e){}
    return {status:r.status, who, url: location.href.replace(/^https:\/\/[^/]+/,''), vis: document.visibilityState};
  });
};
