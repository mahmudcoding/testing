export default async ({page}) => {
  await page.goto('https://airion-cargo.store/w/W4QAF1XTURESO01/settings/calls',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4000);
  let info = await page.evaluate(()=>({url:location.href, text:(document.querySelector('main')||document.body).innerText.replace(/\n+/g,' | ').slice(0,900)}));
  if (!/call|звонк|audio|аудио/i.test(info.text)) {
    // navigate via the settings nav
    await page.goto('https://airion-cargo.store/w/W4QAF1XTURESO01/settings/account',{waitUntil:'domcontentloaded'});
    await page.waitForTimeout(3000);
    const links = await page.$$('a,button');
    for (const l of links) { const t=((await l.getAttribute('aria-label'))||(await l.innerText())||'').trim(); if (/^Calls and audio$/i.test(t)) { await l.click(); await page.waitForTimeout(3500); break; } }
    info = await page.evaluate(()=>({url:location.href, text:(document.querySelector('main')||document.body).innerText.replace(/\n+/g,' | ').slice(0,900)}));
  }
  const controls = await page.evaluate(()=>[...document.querySelectorAll('main button,main input,main select')].map(e=>`${e.tagName}${e.type?'['+e.type+']':''}|${(e.getAttribute('aria-label')||e.textContent||e.placeholder||'').trim().slice(0,35)}|${e.getAttribute('data-testid')||'-'}`).slice(0,35));
  return {info, controls};
};
