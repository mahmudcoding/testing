export default async ({page}) => {
  await page.goto('https://airion-cargo.store/w/W4QAF1XTURESO01/settings/account',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4000);
  const links=await page.$$('a,button');
  for (const l of links){ const t=((await l.getAttribute('aria-label'))||(await l.innerText())||'').trim(); if(t==='Calls and audio'){ await l.click(); break; } }
  await page.waitForTimeout(4000);
  return await page.evaluate(()=>({
    url: location.href,
    main:(document.querySelector('main')||document.body).innerText.replace(/\n+/g,' | ').slice(0,900),
    switches:[...document.querySelectorAll('[role="switch"],input[type=checkbox]')].map(e=>({l:(e.getAttribute('aria-label')||(e.closest('label')||{}).innerText||'').trim().slice(0,50), checked:e.getAttribute('aria-checked')||e.checked}))
  }));
};
