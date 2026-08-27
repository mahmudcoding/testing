export default async ({page}) => {
  const want = process.env.QA_NAV || 'Calls';
  const btns = await page.$$('button, a');
  let clicked=null;
  for (const b of btns) {
    const l=((await b.getAttribute('aria-label'))||(await b.innerText())||'').trim();
    if (l === want) { await b.click(); clicked=l; break; }
  }
  await page.waitForTimeout(4000);
  return await page.evaluate((c)=>({clicked:c, url: location.href,
    mainText: (document.querySelector('main')||{innerText:''}).innerText.replace(/\n+/g,' | ').trim().slice(0,140),
    pip: !!document.querySelector('[data-testid="draggable-pip"]')}), clicked);
};
