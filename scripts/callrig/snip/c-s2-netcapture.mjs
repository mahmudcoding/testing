export default async ({page}) => {
  const gen='C4QCGENERAL0001';
  const seen=[];
  page.on('request', r=>{
    const u=r.url();
    if(/\/api\//.test(u)) seen.push({m:r.method(), u:u.replace(/^https?:\/\/[^/]+/,'')});
  });
  await page.goto('about:blank'); await page.waitForTimeout(800);
  await page.goto('https://airion-cargo.store/w/W4QCF1XTURESO01/c/'+gen);
  await page.waitForTimeout(12000);
  const msgReqs=seen.filter(r=>/message/i.test(r.u));
  return {totalApiRequests:seen.length,
    messageRequests: msgReqs.slice(0,12),
    otherSample: seen.filter(r=>!/message/i.test(r.u)).slice(0,10).map(r=>r.m+' '+r.u.slice(0,70))};
};
