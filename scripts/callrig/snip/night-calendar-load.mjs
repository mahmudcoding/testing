export default async ({page}) => {
  const reqs=[];
  const onResp=async(r)=>{const u=r.url();
    if(/\/api\/v1\//.test(u) && !/\/rum/.test(u)){
      let b=''; try{ b=(await r.text()).slice(0,90);}catch(e){}
      reqs.push({u:u.replace(/^https:\/\/[^/]+/,'').slice(0,90),s:r.status(),len:b.length,body:b});}};
  page.on('response',onResp);
  await page.goto('https://airion-cargo.store/w/W4QAF1XTURESO01/calendar',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(9000);
  page.off('response',onResp);
  return {reqs: reqs.map(r=>({u:r.u,s:r.s})).slice(0,30)};
};
