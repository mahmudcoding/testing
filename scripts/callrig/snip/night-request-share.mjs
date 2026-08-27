export default async ({page}) => {
  const net = [];
  page.on('response', async r => { const u=r.url(); if(u.includes('/api/v1/meeting')){ let b=''; try{b=(await r.text()).slice(0,250);}catch(e){} net.push(`${r.request().method()} ${r.status()} ${u.replace('https://airion-cargo.store','')} :: ${b}`);} });
  const b = page.locator('[data-testid="call-controls-screen-share"]');
  const before = {label: await b.getAttribute('aria-label'), disabled: await b.isDisabled(), pressed: await b.getAttribute('aria-pressed')};
  await b.click();
  await page.waitForTimeout(4000);
  const after = await page.evaluate(() => {
    const b = document.querySelector('[data-testid="call-controls-screen-share"]');
    const toasts = [...document.querySelectorAll('[role="status"],[role="alert"],[data-testid*="toast" i]')].map(e=>e.innerText.replace(/\n+/g,' | ').slice(0,150)).filter(Boolean);
    return {
      label: b && b.getAttribute('aria-label'), disabled: b && b.disabled, pressed: b && b.getAttribute('aria-pressed'),
      toasts
    };
  });
  return {before, after, net: net.filter(n=>n.includes('POST')||n.includes('request')||n.startsWith('PATCH'))};
};
