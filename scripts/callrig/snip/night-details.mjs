export default async ({page}) => {
  await page.goto('https://airion-cargo.store/w/W4QAF1XTURESO01/calls/'+process.env.QA_CALL,{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(6000);
  return await page.evaluate(()=>({
    url: location.href,
    main:(document.querySelector('main')||document.body).innerText.replace(/\n+/g,' | ').slice(0,900),
    tabs:[...document.querySelectorAll('[role="tab"]')].map(e=>({l:e.textContent.trim().slice(0,24), sel:e.getAttribute('aria-selected')})),
    buttons:[...document.querySelectorAll('main button')].map(b=>(b.getAttribute('aria-label')||b.textContent||'').trim().slice(0,32)).filter(Boolean).slice(0,20),
    testids:[...new Set([...document.querySelectorAll('main [data-testid]')].map(e=>e.getAttribute('data-testid')))].slice(0,25)
  }));
};
