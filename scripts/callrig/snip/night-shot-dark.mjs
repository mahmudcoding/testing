export default async ({page}) => {
  await page.goto(process.env.QA_URL,{waitUntil:'networkidle'});
  await page.waitForTimeout(2000);
  await page.evaluate(()=>document.documentElement.setAttribute('data-theme','dark'));
  await page.waitForTimeout(1500);
  await page.screenshot({path: process.env.QA_SHOT, fullPage:false});
  return await page.evaluate(()=>{
    const cs=getComputedStyle(document.body);
    const chip=document.querySelector('.chip');
    const pre=document.querySelector('pre');
    return {bodyBg:cs.backgroundColor, bodyColor:cs.color,
      chipColor:chip?getComputedStyle(chip).color:null, chipBg:chip?getComputedStyle(chip).backgroundColor:null,
      preBg:pre?getComputedStyle(pre).backgroundColor:null, preColor:pre?getComputedStyle(pre).color:null};
  });
};
