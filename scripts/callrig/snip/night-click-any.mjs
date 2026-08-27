export default async ({page}) => {
  const want=process.env.QA_LBL;
  const btns=await page.$$('button');
  let clicked=null;
  for(const b of btns){ const l=((await b.getAttribute('aria-label'))||(await b.innerText())||'').trim();
    if(l===want){ await b.click(); clicked=l; break; } }
  await page.waitForTimeout(Number(process.env.QA_WAIT||3000));
  return {clicked, ringStillUp: await page.evaluate(()=>/is calling/.test(document.body.innerText))};
};
