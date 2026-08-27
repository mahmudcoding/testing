export default async ({page}) => {
  await page.goto('https://airion-cargo.store/w/W4QAF1XTURESO01/settings/notifications',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(6000);
  return await page.evaluate(()=>{
    const m=document.querySelector('main');
    return {
      buttons:[...m.querySelectorAll('button')].map(b=>({l:(b.getAttribute('aria-label')||b.textContent||'').trim().slice(0,40), role:b.getAttribute('role'), t:b.getAttribute('data-testid'), d:b.disabled})),
      switchCount: m.querySelectorAll('[role="switch"]').length,
      text:(m.innerText||'').replace(/\n+/g,' | ').slice(-500)
    };
  });
};
