export default async ({page}) => {
  // NO navigation — fetch only, from whatever page is already loaded
  return await page.evaluate(async ()=>{
    const r=await fetch('/api/v1/auth/me',{credentials:'include'});
    const b=await r.json();
    return {url:location.pathname,
      email: b?.email || b?.user?.email,
      language: b?.language || b?.user?.language || '(absent)',
      timezone: b?.timezone || b?.user?.timezone || '(absent)'};
  });
};
