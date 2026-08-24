export default async ({page}) => {
  await page.goto('https://airion-cargo.store/', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(2500);
  return await page.evaluate(async(mid)=>{
    const r = await fetch(`/api/v1/meeting/${mid}/events?limit=3`,{credentials:'include'});
    return {status:r.status, body:(await r.text()).slice(0,140)};
  }, process.env.QA_MID);
};
