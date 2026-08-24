export default async ({page}) => {
  await page.goto('https://airion-cargo.store/w/W4QAF1XTURESO01/settings/account',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4000);
  const info = await page.evaluate(()=>({
    text: (document.querySelector('main')||document.body).innerText.replace(/\n+/g,' | ').slice(0,600),
    selects: [...document.querySelectorAll('select')].map(s=>`${s.getAttribute('aria-label')||s.id||''}=${s.value}|opts:${[...s.options].map(o=>o.value).join(',')}`),
    combos: [...document.querySelectorAll('[role="combobox"],button')].map(b=>`${(b.getAttribute('aria-label')||b.textContent||'').trim().slice(0,30)}#${b.getAttribute('data-testid')||'-'}`).filter(x=>/lang|язык|English|Русск/i.test(x)).slice(0,8)
  }));
  return info;
};
