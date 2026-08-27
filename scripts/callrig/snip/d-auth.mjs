export default async ({page}) => {
  const res={};
  // 1. is the revoked session actually dead server-side?
  await page.goto('https://airion-cargo.store/w/W4QDF1XTURESO01/settings/account', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4000);
  res.revoked = await page.evaluate(async()=>{
    const r=await fetch('/api/v1/auth/me',{credentials:'include'});
    let j=null; try{j=await r.json();}catch(e){}
    return {status:r.status, email:j&&j.email, url:location.pathname};
  });
  // 2. login form error handling
  const go = async () => { await page.goto('https://airion-cargo.store/login',{waitUntil:'domcontentloaded'}); await page.waitForTimeout(2200); };
  const attempt = async (email, pw, tag) => {
    await go();
    await page.fill('input[type=email]', email);
    await page.fill('input[type=password]', pw);
    const [resp] = await Promise.all([
      page.waitForResponse(r=>r.url().includes('/api/v1/')&&r.request().method()==='POST',{timeout:12000}).catch(()=>null),
      page.click('button[type=submit]')
    ]);
    await page.waitForTimeout(2500);
    const shown = await page.evaluate(()=>{
      const t=(document.body.innerText||'').replace(/\s+/g,' ');
      const al=[]; document.querySelectorAll('[role="alert"],[aria-live],.text-danger,[class*="error"]').forEach(x=>{const r=x.getBoundingClientRect(); if(r.width>0&&r.height>0){const s=(x.innerText||'').replace(/\s+/g,' ').trim(); if(s)al.push(s.slice(0,140));}});
      return {alerts:[...new Set(al)].slice(0,4), url:location.pathname, bodyHas:t.slice(0,260)};
    });
    return {tag, http: resp?{s:resp.status(), u:resp.url().replace('https://airion-cargo.store','')}:'none', shown};
  };
  res.wrongPassword = await attempt('qa.d.bob@aloqa.test','WrongPass999!','wrong pw');
  res.noSuchUser    = await attempt('qa.d.nobody-xyz@aloqa.test','QaPass123!','unknown email');
  res.malformed     = await attempt('not-an-email','QaPass123!','malformed email');
  return res;
};
