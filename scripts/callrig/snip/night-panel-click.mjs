export default async ({page}) => {
  const want=process.env.QA_LBL;
  const panel=await page.$('[data-testid="participants-list-panel"]');
  if(!panel) return {err:'no panel'};
  const btns=await panel.$$('button');
  let clicked=null;
  for(const b of btns){ const l=((await b.getAttribute('aria-label'))||(await b.innerText())||'').trim();
    if(l===want){ await b.click(); clicked=l; break; } }
  await page.waitForTimeout(Number(process.env.QA_WAIT||6000));
  return {clicked, panelText: await page.evaluate(()=>{const p=document.querySelector('[data-testid="participants-list-panel"]');
    return p?p.innerText.replace(/\n+/g,' | ').slice(0,220):null;})};
};
