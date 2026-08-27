export default async ({page}) => {
  await page.goto(process.env.QA_URL2 || 'http://127.0.0.1:8899/', {waitUntil:'networkidle'});
  await page.evaluate(()=>document.documentElement.setAttribute('data-theme','dark'));
  await page.waitForTimeout(1200);
  await page.screenshot({path: process.env.QA_SHOT || '/tmp/dark.png'});
  return await page.evaluate(()=>{
    const cs=getComputedStyle(document.body);
    const art=document.querySelector('article');
    const pre=document.querySelector('pre');
    const chip=document.querySelector('.chip.sev');
    return {bodyBg:cs.backgroundColor, ink:cs.color,
      articleBg: art?getComputedStyle(art).backgroundColor:null,
      preBg: pre?getComputedStyle(pre).backgroundColor:null,
      preInk: pre?getComputedStyle(pre).color:null,
      chipBg: chip?getComputedStyle(chip).backgroundColor:null,
      chipInk: chip?getComputedStyle(chip).color:null};
  });
}
