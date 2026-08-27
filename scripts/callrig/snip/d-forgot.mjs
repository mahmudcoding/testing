export default async ({page}) => {
  const res={};
  const cap = async () => page.evaluate(()=>{
    const b=document.body;
    const btns=[]; b.querySelectorAll('button,a').forEach(x=>{const r=x.getBoundingClientRect(); if(r.width>0&&r.height>0) btns.push(((x.innerText||'').trim()||x.getAttribute('aria-label')||'?').slice(0,30));});
    const ins=[]; b.querySelectorAll('input').forEach(x=>{const r=x.getBoundingClientRect(); if(r.width>0&&r.height>0) ins.push({ph:x.placeholder||'', t:x.type});});
    return {url:location.pathname, text:(b.innerText||'').replace(/\s+/g,' ').slice(0,420), btns:[...new Set(btns)].slice(0,12), ins};
  });
  await page.goto('https://airion-cargo.store/login',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(2500);
  // forgot password
  await page.locator('a,button').filter({hasText:/Forgot password/i}).first().click();
  await page.waitForTimeout(3000);
  res.forgotScreen = await cap();
  const em = page.locator('input[type=email]').first();
  if (await em.count()) {
    await em.fill('qa.d.bob@aloqa.test');
    const [resp]=await Promise.all([
      page.waitForResponse(r=>r.url().includes('/api/v1/')&&r.request().method()==='POST',{timeout:12000}).catch(()=>null),
      page.locator('button[type=submit]').first().click()
    ]);
    await page.waitForTimeout(3000);
    res.forgotSubmit={http:resp?{s:resp.status(),u:resp.url().replace('https://airion-cargo.store','')}:'none', after:await cap()};
  }
  // unknown address — should not reveal whether the account exists
  await page.goto('https://airion-cargo.store/login',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(2200);
  await page.locator('a,button').filter({hasText:/Forgot password/i}).first().click();
  await page.waitForTimeout(2500);
  const em2 = page.locator('input[type=email]').first();
  if (await em2.count()) {
    await em2.fill('definitely-not-a-user-9x7@aloqa.test');
    const [r2]=await Promise.all([
      page.waitForResponse(r=>r.url().includes('/api/v1/')&&r.request().method()==='POST',{timeout:12000}).catch(()=>null),
      page.locator('button[type=submit]').first().click()
    ]);
    await page.waitForTimeout(3000);
    res.forgotUnknown={http:r2?{s:r2.status(),u:r2.url().replace('https://airion-cargo.store','')}:'none', after:await cap()};
  }
  return res;
};
