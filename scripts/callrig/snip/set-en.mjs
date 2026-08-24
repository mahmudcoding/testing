export default async ({page}) => {
  await page.goto('https://airion-cargo.store/w/W4QAF1XTURESO01/settings/account',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4000);
  const btns = await page.$$('main button');
  let trig=null;
  for (const x of btns) { const t=((await x.getAttribute('aria-label'))||'').trim(); if (t==='Language'||t==='Язык') { trig=x; break; } }
  if (!trig) return {err:'no language trigger'};
  const cur = (await trig.innerText()).trim();
  await trig.click(); await page.waitForTimeout(2000);
  const d = (await page.$$('[role="dialog"],[data-radix-popper-content-wrapper]')).pop();
  if (!d) return {err:'no dropdown', cur};
  const items = await d.$$('button,[role="option"],[role="menuitem"]');
  let picked=null;
  for (const it of items) { const t=(await it.innerText()).trim(); if (/^(English|Английский)$/i.test(t)) { await it.click(); picked=t; break; } }
  await page.waitForTimeout(4000);
  return {was: cur, picked, lang: await page.evaluate(()=>document.documentElement.lang),
          text: await page.evaluate(()=>(document.querySelector('main')||document.body).innerText.replace(/\n+/g,' | ').slice(0,180))};
};
