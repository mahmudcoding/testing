export default async ({page}) => {
  const api = await page.evaluate(async ()=> (await (await fetch('/api/v1/notifications/settings',{credentials:'include'})).text()).slice(0,900));
  await page.goto('https://airion-cargo.store/w/W4QAF1XTURESO01/settings/notifications',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4000);
  const ui = await page.evaluate(()=>{
    const m=document.querySelector('main')||document.body;
    return {text: m.innerText.replace(/\n+/g,' | ').slice(0,900),
      toggles: [...m.querySelectorAll('button[role=switch],input[type=checkbox],button[aria-checked]')].map(b=>`${(b.getAttribute('aria-label')||b.textContent||'').trim().slice(0,40)}#${b.getAttribute('data-testid')||'-'}|${b.getAttribute('aria-checked')??b.checked}`)};
  });
  return {api, ui};
};
