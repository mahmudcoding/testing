export default async ({page}) => {
  const r = await page.evaluate(async () => {
    let me = null;
    try {
      const res = await fetch('/api/v1/auth/me', {credentials:'include'});
      me = res.ok ? await res.json() : {status: res.status};
    } catch (e) { me = {err: String(e).slice(0,80)}; }
    return {url: location.href, vis: document.visibilityState, me};
  });
  return r;
};
