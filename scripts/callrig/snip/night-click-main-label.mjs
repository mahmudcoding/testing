export default async ({page}) => {
  const want=process.env.QA_LBL;
  const btns=await page.$$('main button');
  let clicked=null;
  for(const b of btns){ const l=((await b.getAttribute('aria-label'))||(await b.innerText())||'').trim();
    if(l===want || l.startsWith(want)){ await b.click(); clicked=l; break; } }
  await page.waitForTimeout(Number(process.env.QA_WAIT||6000));
  return {clicked, url:page.url().slice(-40),
    dialog: await page.evaluate(()=>{const d=[...document.querySelectorAll('[role="dialog"]')].pop();
      return d?d.innerText.replace(/\n+/g,' | ').slice(0,220):null;}),
    topBar: await page.evaluate(()=>{const t=document.querySelector('[data-testid="call-top-bar"]');
      return t?t.innerText.replace(/\n+/g,' | ').slice(0,60):null;})};
};
