export default async ({page}) => {
  await page.goto('https://airion-cargo.store/w/W4QAF1XTURESO01/settings/'+(process.env.QA_SEC||'account'),{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(5000);
  return await page.evaluate(()=>({
    url: location.href,
    nav:[...document.querySelectorAll('nav a, nav button, aside a, aside button')].map(e=>(e.getAttribute('aria-label')||e.textContent||'').trim()).filter(Boolean).slice(0,20),
    main:(document.querySelector('main')||document.body).innerText.replace(/\n+/g,' | ').slice(0,600)
  }));
};
