export default async ({page}) => {
  const out={};
  await page.goto('https://airion-cargo.store/login');
  await page.waitForTimeout(7000);
  const inputs=page.locator('input:visible');
  out.inputCount=await inputs.count();
  const email=page.locator('input[type="email"], input[name="email"]').first();
  const pass=page.locator('input[type="password"]').first();
  if(!await email.count() || !await pass.count()){
    out.fields=await page.evaluate(()=>{
      const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
      return [...document.querySelectorAll('input')].filter(v)
        .map(i=>`${i.type}|${i.name}|${i.getAttribute('placeholder')||''}`);});
    return out;
  }
  await email.fill('qa.c.guest@aloqa.test');
  await pass.fill('QaPass123!');
  await page.waitForTimeout(600);
  const submit=page.locator('button[type="submit"], button').filter({hasText:/sign in|log in|войти/i}).first();
  out.submitFound=await submit.count();
  if(out.submitFound) await submit.click({timeout:8000}).catch(e=>{out.submitErr=String(e.message).slice(0,40);});
  await page.waitForTimeout(12000);
  out.after=await page.evaluate(async ()=>{
    const r=await fetch('/api/v1/auth/me',{credentials:'include'});
    let j=null; try{j=await r.json()}catch{}
    return {meStatus:r.status, who:j&&(j.email||j.username), isGuest:j&&(j.is_guest??null),
      url:location.pathname.slice(0,40)};});
  return out;
};
