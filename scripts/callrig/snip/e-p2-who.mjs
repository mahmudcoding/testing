export default async ({page}) => {
  const me = await page.evaluate(async () => {
    try {
      const r = await fetch('/api/v1/auth/me', {credentials:'include'});
      const j = await r.json().catch(()=>({}));
      return {status: r.status, email: j?.email || j?.data?.email || null, id: j?.id || j?.data?.id || null, name: j?.display_name || j?.data?.display_name || null};
    } catch (e) { return {err: String(e).slice(0,120)}; }
  });
  return {url: page.url(), vis: await page.evaluate(()=>document.visibilityState), me};
};
