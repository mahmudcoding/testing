export default async ({page}) => {
  return await page.evaluate(() => {
    const rows = [...document.querySelectorAll('[data-testid="ic-user-message"]')];
    return rows.map(r => ({
      innerText: r.innerText.replace(/\n+/g,' | '),
      html: r.innerHTML.replace(/\s+/g,' ').slice(0,1400)
    }));
  });
};
