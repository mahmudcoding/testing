export default async ({page}) => {
  const dump = await page.evaluate(()=>{
    const d=[...document.querySelectorAll('[role="dialog"],[data-radix-popper-content-wrapper]')].pop();
    return d? {text:d.innerText.replace(/\n+/g,' | ').slice(0,300), items:[...d.querySelectorAll('button,[role="option"],[role="menuitem"],div[data-value]')].map(b=>`${(b.getAttribute('aria-label')||b.textContent||'').trim().slice(0,25)}`).filter(Boolean).slice(0,12)} : 'none';
  });
  const d = (await page.$$('[role="dialog"],[data-radix-popper-content-wrapper]')).pop();
  let clicked=null;
  if (d) { const items = await d.$$('button,[role="option"],[role="menuitem"]');
    for (const it of items) { const t=(await it.innerText()).trim(); if (/Рус|Russian/i.test(t)) { await it.click(); clicked=t; break; } } }
  await page.waitForTimeout(5000);
  const after = await page.evaluate(()=>({lang:document.documentElement.lang, text:(document.querySelector('main')||document.body).innerText.replace(/\n+/g,' | ').slice(0,260)}));
  return {dump, clicked, after};
};
