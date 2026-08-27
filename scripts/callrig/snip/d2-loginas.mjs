// Attempt a login and report exactly what the user gets.
export default async ({page}) => {
  const email=process.env.QA_EMAIL, pw=process.env.QA_PW||'QaPass123!';
  await page.goto('https://airion-cargo.store/login',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(3500);
  await page.evaluate(async()=>{ try{await fetch('/api/auth/logout',{method:'POST',credentials:'include'});}catch{} });
  await page.goto('https://airion-cargo.store/login',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(3000);
  await page.fill('input[type=email]', email);
  await page.fill('input[type=password]', pw);
  const reqs=[]; const on=r=>{try{const u=new URL(r.url()); const m=r.request().method();
    if(m!=='GET'||u.pathname.startsWith('/api/')) reqs.push(`${m} ${u.pathname} -> ${r.status()}`);}catch{}};
  page.on('response', on);
  await page.locator('button[type=submit]').first().click();
  await page.waitForTimeout(8000);
  page.off('response', on);
  return {reqs, url: page.url(),
    me: await page.evaluate(async()=>{const r=await fetch('/api/v1/auth/me',{credentials:'include'});
      const j=await r.json().catch(()=>({})); return {s:r.status,email:j.email,verified:j.email_verified};}),
    screen: await page.evaluate(()=>{
      const vis=el=>{const r=el.getBoundingClientRect(); return r.width>2&&r.height>2;};
      return {heads:[...document.querySelectorAll('h1,h2,h3')].filter(vis).map(h=>h.innerText.trim().slice(0,60)),
        ctrls:[...document.querySelectorAll('button,a')].filter(vis).map(b=>((b.getAttribute('aria-label')||b.innerText)||'').replace(/\s+/g,' ').trim()).filter(Boolean).slice(0,14),
        txt:(document.body.innerText||'').replace(/\s+/g,' ').slice(0,420)};})};
};
