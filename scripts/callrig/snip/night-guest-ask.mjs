export default async ({page}) => {
  const name=process.env.QA_GUESTNAME||'QA Visitor';
  await page.fill('input[type=text]', name);
  await page.waitForTimeout(500);
  const btns=await page.$$('button');
  for (const b of btns){ const t=((await b.getAttribute('aria-label'))||(await b.innerText())||'').trim(); if(/ask to join|join call/i.test(t)){ await b.click(); break; } }
  await page.waitForTimeout(9000);
  let st=await page.evaluate(()=>({url:location.href, text:(document.body.innerText||'').replace(/\n+/g,' | ').slice(0,300),
    btns:[...document.querySelectorAll('button')].map(b=>(b.getAttribute('aria-label')||b.textContent||'').trim()).filter(Boolean).slice(0,14)}));
  return {name, state: st};
};
