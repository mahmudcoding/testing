export default async ({page}) => {
  await page.goto('https://airion-cargo.store/w/W4QAF1XTURESO01/calendar',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(8000);
  const reqs=[];
  const onResp=async(r)=>{const u=r.url();
    if(/\/api\/v1\//.test(u) && !/\/rum/.test(u)){
      let b=''; try{ b=(await r.text()).slice(0,200);}catch(e){}
      reqs.push({m:r.request().method(),u:u.replace(/^https:\/\/[^/]+/,'').slice(0,80),s:r.status(),body:b});}};
  page.on('response',onResp);
  const needle=process.env.QA_NEEDLE||'QA RSVP TEST';
  const el=await page.evaluateHandle((n)=>[...document.querySelectorAll('*')]
    .find(e=>(e.textContent||'').trim()===n && e.children.length===0), needle);
  const box=el.asElement(); if(!box) return {err:'not found'};
  await box.click(); await page.waitForTimeout(6000);
  page.off('response',onResp);
  return {reqs: reqs.slice(-6), text: await page.evaluate(()=>{
    const d=[...document.querySelectorAll('[role="dialog"],[data-radix-popper-content-wrapper]')].pop();
    return d?d.innerText.replace(/\n+/g,' | ').slice(0,140):null;})};
};
