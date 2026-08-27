export default async ({page}) => {
  const want = process.env.QA_BTN || 'Leave';
  const dlgs = await page.$$('[role="dialog"],[role="alertdialog"]');
  const last = dlgs[dlgs.length-1];
  const btns = await last.$$('button');
  let clicked=null;
  for (const b of btns) {
    const t = ((await b.getAttribute('aria-label'))||(await b.innerText())||'').trim();
    if (t === want) { await b.click(); clicked=t; break; }
  }
  await page.waitForTimeout(Number(process.env.QA_WAIT||6000));
  return {clicked, url: page.url(), txt: await page.evaluate(()=>(document.querySelector('main')||document.body).innerText.replace(/\n+/g,' | ').slice(0,200))};
};
