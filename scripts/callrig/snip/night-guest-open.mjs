export default async ({page}) => {
  await page.goto(process.env.QA_LINK, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(5000);
  return await page.evaluate(()=>({url:location.href, text:(document.body.innerText||'').replace(/\n+/g,' | ').slice(0,400),
    inputs:[...document.querySelectorAll('input')].map(i=>({t:i.type,ph:i.placeholder})),
    btns:[...document.querySelectorAll('button')].map(b=>(b.getAttribute('aria-label')||b.textContent||'').trim()).filter(Boolean).slice(0,12)}));
};
