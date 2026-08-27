export default async ({page}) => {
  const id=process.env.QA_MSG_ID;
  await page.goto('https://airion-cargo.store/w/W4QAF1XTURESO01/c/C4QAGENERAL0001',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(6000);
  return await page.evaluate((id)=>{
    const r=document.querySelector('[data-message-id="'+id+'"]');
    if(!r) return {none:true};
    return {text:r.innerText.replace(/\n/g,' | '),
      html:r.innerHTML.replace(/\s+/g,' ').slice(0,900),
      buttons:[...r.querySelectorAll('button')].map(b=>(b.getAttribute('aria-label')||b.textContent||'').trim().slice(0,30)),
      testids:[...r.querySelectorAll('[data-testid]')].map(e=>e.getAttribute('data-testid'))};
  }, id);
};
