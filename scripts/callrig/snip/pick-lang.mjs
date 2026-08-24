export default async ({page}) => {
  const b = await page.$('button[aria-label="Language"]') || (await page.$$('button')).find(async x=>/Language/.test(await x.innerText()));
  const btns = await page.$$('button');
  let trigger=null;
  for (const x of btns) { const t=((await x.getAttribute('aria-label'))||(await x.innerText())||'').trim(); if (t==='Language'||/^English$/.test(t)) { trigger=x; break; } }
  if (!trigger) return {err:'no trigger'};
  await trigger.click(); await page.waitForTimeout(2000);
  const opts = await page.evaluate(()=>[...document.querySelectorAll('[role="option"],[role="menuitem"],li')].map(o=>o.textContent.trim().slice(0,30)).filter(Boolean).slice(0,15));
  const ru = await page.$('[role="option"]:has-text("Рус")') || await page.$('[role="menuitem"]:has-text("Рус")');
  if (ru) { await ru.click(); await page.waitForTimeout(4000); }
  const after = await page.evaluate(()=>({text:(document.querySelector('main')||document.body).innerText.replace(/\n+/g,' | ').slice(0,300), html: document.documentElement.lang}));
  return {opts, picked: !!ru, after};
};
