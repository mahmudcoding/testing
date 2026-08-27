export default async ({page}) => {
  const d=[...await page.$$('[role="dialog"]')].pop();
  if(!d) return {err:'no dialog'};
  const btns=await d.$$('button');
  const labels=[];
  for(const b of btns) labels.push(((await b.textContent())||'').trim().slice(0,10));
  const i=labels.findIndex((l,ix)=>l==='Inherit' && ix>0);
  if(i>=0) await btns[i].click();
  await page.waitForTimeout(1500);
  for(const b of await d.$$('button')){ const t=((await b.textContent())||'').trim();
    if(t==='Save' && !(await b.isDisabled())){ await b.click(); break; } }
  await page.waitForTimeout(5000);
  return {restored:true};
};
