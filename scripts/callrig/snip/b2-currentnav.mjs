export default async ({page}) => {
  const WS='W4QBF1XTURESO01', CH=process.env.QA_CHAN||'C4QBGENERAL0001';
  const cur = async () => await page.evaluate(async()=>{
    const r=await fetch('/api/v1/meetings/current',{credentials:'include'});
    const t=await r.text();
    const m=t.match(/"id":"([A-Za-z0-9]+)"/), s=t.match(/"status":"(\w+)"/);
    return {s:r.status, id:m?m[1]:null, status:s?s[1]:null, empty:t.trim()==='{}', wall:new Date().toISOString()};
  });
  const before = await cur();
  const urlBefore = page.url();
  await page.goto(`https://airion-cargo.store/w/${WS}/c/${CH}`, {waitUntil:'domcontentloaded'}).catch(e=>null);
  await page.waitForTimeout(6000);
  const urlAfter = page.url();
  const after = await cur();
  return {before, urlBefore: urlBefore.replace(/^https?:\/\/[^/]+/,''),
          urlAfter: urlAfter.replace(/^https?:\/\/[^/]+/,''),
          bouncedBack: /\/call\//.test(urlAfter), after};
};
