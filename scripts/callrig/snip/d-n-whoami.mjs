export default async ({page}) => {
  await page.goto('https://airion-cargo.store/',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4000);
  return await page.evaluate(async()=>{
    const r=await fetch('/api/v1/auth/me',{credentials:'include'});
    return {status:r.status, body:(await r.text()).slice(0,160), url:location.pathname};
  });
};
