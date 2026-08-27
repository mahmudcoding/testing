export default async ({page}) => {
  await page.goto('https://airion-cargo.store/w/W4QAF1XTURESO01/calendar',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(8000);
  const needle=process.env.QA_NEEDLE||'QA RSVP TEST';
  const el=await page.evaluateHandle((n)=>[...document.querySelectorAll('*')]
    .find(e=>(e.textContent||'').trim()===n && e.children.length===0), needle);
  const box=el.asElement(); if(!box) return {err:'event not found'};
  await box.click(); await page.waitForTimeout(4000);
  const reqs=[];
  const onResp=async(r)=>{const u=r.url();
    if(/\/api\/v1\//.test(u)&&r.request().method()!=='GET')
      reqs.push({m:r.request().method(),u:u.replace(/^https:\/\/[^/]+/,''),s:r.status(),post:(r.request().postData()||'').slice(0,90)});};
  page.on('response',onResp);
  const d=[...await page.$$('[role="dialog"],[data-radix-popper-content-wrapper]')].pop();
  let clicked=null;
  for(const b of await d.$$('button')){ const t=((await b.textContent())||'').trim();
    if(t===(process.env.QA_ANS||'Yes')){ await b.click(); clicked=t; break; } }
  await page.waitForTimeout(5000);
  page.off('response',onResp);
  return {clicked, reqs, popover: await page.evaluate(()=>{
    const dd=[...document.querySelectorAll('[role="dialog"],[data-radix-popper-content-wrapper]')].pop();
    return dd?dd.innerText.replace(/\n+/g,' | ').slice(0,200):null;})};
};
