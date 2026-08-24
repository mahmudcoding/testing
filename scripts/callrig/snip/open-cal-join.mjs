export default async ({page}) => {
  await page.goto(process.env.QA_URL, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(7000);
  return await page.evaluate(async()=>{
    const me = await (await fetch('/api/v1/auth/me',{credentials:'include'})).json();
    return {url: location.href, who: me.email||null,
      text: document.body.innerText.replace(/\n+/g,' | ').slice(0,420),
      inputs: [...document.querySelectorAll('input')].map(i=>`${i.type}|${i.placeholder||''}`),
      btns: [...document.querySelectorAll('button')].map(b=>(b.getAttribute('aria-label')||b.textContent||'').trim()).filter(Boolean).slice(-8)};
  });
};
