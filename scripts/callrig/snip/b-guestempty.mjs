export default async ({page}) => {
  const out={};
  const inp = await page.$('input[type=text]');
  out.disabledBefore = await page.evaluate(()=>{ const b=[...document.querySelectorAll('button')].find(x=>/Ask to join/i.test(x.innerText||'')); return b? b.disabled : null; });
  // empty submit
  await page.evaluate(()=>{ const b=[...document.querySelectorAll('button')].find(x=>/Ask to join/i.test(x.innerText||'')); if(b&&!b.disabled) b.click(); });
  await page.waitForTimeout(2500);
  out.afterEmpty = await page.evaluate(()=>document.body.innerText.replace(/\s+/g,' ').slice(0,300));
  // whitespace-only name
  if (inp) { await inp.fill('   '); }
  await page.waitForTimeout(500);
  out.disabledWs = await page.evaluate(()=>{ const b=[...document.querySelectorAll('button')].find(x=>/Ask to join/i.test(x.innerText||'')); return b? b.disabled : null; });
  await page.evaluate(()=>{ const b=[...document.querySelectorAll('button')].find(x=>/Ask to join/i.test(x.innerText||'')); if(b&&!b.disabled) b.click(); });
  await page.waitForTimeout(3000);
  out.afterWs = await page.evaluate(()=>({txt:document.body.innerText.replace(/\s+/g,' ').slice(0,300), url:location.href}));
  return out;
};
