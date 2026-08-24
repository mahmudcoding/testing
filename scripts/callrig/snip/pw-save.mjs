export default async ({page}) => {
  const net=[];
  page.on('response', async r=>{const u=r.url(); if(u.includes('/api/v1/meeting')&&r.request().method()!=='GET'){let b='';try{b=(await r.text()).slice(0,300);}catch(e){} net.push(`${r.request().method()} ${r.status()} ${u.replace('https://airion-cargo.store','')} :: ${b}`);}});
  const inp = page.locator('[role="dialog"] input[type=password]').last();
  await inp.fill('secret123');
  await page.waitForTimeout(800);
  await page.click('[data-testid="meeting-settings-save"]');
  await page.waitForTimeout(3000);
  const after = await page.evaluate(async () => {
    const m = await (await fetch('/api/v1/meeting/V4OTLVMJL42ZGIG',{credentials:'include'})).json();
    return {password_protected: m.meeting && m.meeting.password_protected,
            toasts: [...document.querySelectorAll('[role="status"],[role="alert"],[data-sonner-toast]')].map(t=>t.innerText.replace(/\n+/g,' ').slice(0,140)).filter(Boolean),
            pwToggle: (document.querySelector('[data-testid="meeting-settings-password-toggle"]')||{}).getAttribute?.('aria-checked')};
  });
  return {net, after};
};
