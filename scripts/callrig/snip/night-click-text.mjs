export default async ({page}) => {
  const needle=process.env.QA_NEEDLE;
  const el=await page.evaluateHandle((n)=>{
    return [...document.querySelectorAll('*')].find(e=>(e.textContent||'').trim()===n && e.children.length===0);
  }, needle);
  const box=el.asElement();
  if(!box) return {err:'not found'};
  await box.click();
  await page.waitForTimeout(Number(process.env.QA_WAIT||4000));
  return await page.evaluate(()=>{
    const d=[...document.querySelectorAll('[role="dialog"],[data-radix-popper-content-wrapper]')].pop();
    return d?{text:d.innerText.replace(/\n+/g,' | ').slice(0,300),
      buttons:[...d.querySelectorAll('button')].map(b=>({l:(b.getAttribute('aria-label')||b.textContent||'').trim().slice(0,28), tid:b.getAttribute('data-testid')}))}:{none:true};
  });
};
