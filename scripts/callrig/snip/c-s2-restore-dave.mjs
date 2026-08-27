export default async ({page}) => {
  const out={};
  await page.goto('https://airion-cargo.store/w/W4QCF1XTURESO01/c/C4QCGENERAL0001');
  await page.waitForTimeout(8000);
  await page.locator('button[aria-label="Profile"]').first().click({timeout:6000}).catch(()=>{});
  await page.waitForTimeout(2500);
  const so=await page.evaluateHandle(()=>{
    const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
    return [...document.querySelectorAll('button,a')].filter(v)
      .find(b=>/^Sign out$/i.test((b.innerText||'').trim()))||null;});
  const el=so.asElement(); if(el) await el.click({timeout:6000}).catch(()=>{});
  await page.waitForTimeout(8000);
  await page.goto('https://airion-cargo.store/login');
  await page.waitForTimeout(6000);
  await page.locator('input[type="email"], input[name="email"]').first().fill('qa.c.dave@aloqa.test');
  await page.locator('input[type="password"]').first().fill('QaPass123!');
  await page.waitForTimeout(600);
  await page.locator('button[type="submit"], button').filter({hasText:/sign in|log in|войти/i}).first()
    .click({timeout:8000}).catch(()=>{});
  await page.waitForTimeout(12000);
  out.after=await page.evaluate(async ()=>{
    const r=await fetch('/api/v1/auth/me',{credentials:'include'});
    let j=null; try{j=await r.json()}catch{}
    return {status:r.status, who:j&&(j.email||j.username)};});
  return out;
};
