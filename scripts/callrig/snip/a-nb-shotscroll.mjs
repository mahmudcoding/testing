export default async ({page}) => {
  await page.goto(process.env.QA_URL2 || 'http://127.0.0.1:8899/', {waitUntil:'networkidle'});
  await page.waitForTimeout(1200);
  await page.evaluate(()=>{ const a=document.querySelectorAll('article')[1];
    if(a) a.scrollIntoView({block:'start'}); });
  await page.waitForTimeout(1200);
  await page.screenshot({path: process.env.QA_SHOT || '/tmp/scroll.png'});
  return await page.evaluate(()=>{
    const pres=[...document.querySelectorAll('pre')];
    return {pres:pres.length,
      overflowing: pres.filter(p=>p.scrollWidth>p.clientWidth).length,
      widest: Math.max(...pres.map(p=>p.scrollWidth)),
      client: pres[0]?pres[0].clientWidth:null};
  });
}
