export default async ({page}) => {
  return await page.evaluate(() => {
    const dlgs = [...document.querySelectorAll('[role="dialog"],[role="alertdialog"]')];
    return dlgs.map(d=>({
      role: d.getAttribute('role'), testid: d.getAttribute('data-testid'),
      hidden: d.getAttribute('aria-hidden'),
      text: d.innerText.replace(/\n+/g,' | ').slice(0,300),
      buttons: [...d.querySelectorAll('button')].map(b=>({l:(b.getAttribute('aria-label')||b.textContent||'').trim().slice(0,32), t:b.getAttribute('data-testid'), d:b.disabled}))
    }));
  });
};
