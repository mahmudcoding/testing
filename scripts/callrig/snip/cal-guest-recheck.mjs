export default async ({page}) => {
  const url = process.env.QA_URL;
  await page.goto(url,{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4000);
  const grab = (label) => page.evaluate((label)=>({
    label, url: location.href,
    text: document.body.innerText.replace(/\n+/g,' | ').slice(0,400),
    buttons: [...document.querySelectorAll('button')].map(b=>`${(b.getAttribute('aria-label')||b.textContent||'').trim().slice(0,30)}${b.disabled?' DIS':''}`).filter(Boolean),
    links: [...document.querySelectorAll('a')].map(a=>a.textContent.trim().slice(0,30)).filter(Boolean),
    inputs: [...document.querySelectorAll('input')].map(i=>`${i.type}|${i.placeholder||''}`),
    lang: document.documentElement.lang
  }), label);
  const before = await grab('before Continue');
  await page.fill('input[type=text]','Recheck Guest');
  await page.locator('button',{hasText:/Continue|Продолжить/}).first().click();
  const out=[];
  for (const w of [1000,3000,6000,12000]) { await page.waitForTimeout(w===1000?1000:w-out.length*0); out.push(await grab('after +'+w+'ms')); }
  return {before, after: out};
};
