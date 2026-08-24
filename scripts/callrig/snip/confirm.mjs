export default async ({page}) => {
  const label = process.env.QA_CONFIRM;
  const dlgs = await page.$$('[role="dialog"],[role="alertdialog"]');
  const m = dlgs[dlgs.length-1];
  if (!m) return {err:'no dialog'};
  const btns = await m.$$('button');
  for (const b of btns) { const t=(await b.innerText()).trim(); if (new RegExp('^'+label+'$','i').test(t)) { await b.click(); await page.waitForTimeout(Number(process.env.QA_WAIT||5000)); return {clicked:t, after: await page.evaluate(()=>document.body.innerText.replace(/\n+/g,' | ').slice(-500))}; } }
  return {err:'no button '+label, opts: await Promise.all(btns.map(async b=>(await b.innerText()).trim()))};
};
