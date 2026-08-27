// Complete a real signup and follow what happens next.
export default async ({page}) => {
  const email=process.env.QA_NEWMAIL, name=process.env.QA_NEWNAME||'QA D2 Signup', pw=process.env.QA_NEWPW||'QaPass123!';
  const out={email};
  await page.goto('https://airion-cargo.store/signup',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4500);
  await page.fill('input[name=email]', email);
  await page.fill('input[name=displayName]', name);
  await page.fill('input[name=password]', pw);
  await page.waitForTimeout(600);
  const reqs=[]; const on=r=>{try{const u=new URL(r.url()); const m=r.request().method();
    if(m!=='GET'||u.pathname.startsWith('/api/')) reqs.push(`${m} ${u.pathname} -> ${r.status()}`);}catch{}};
  page.on('response', on);
  await page.locator('button').filter({hasText:/^Create account$/}).first().click();
  await page.waitForTimeout(9000);
  out.reqs=reqs.slice(); page.off('response', on);
  out.url = page.url();
  out.me  = await page.evaluate(async()=>{const r=await fetch('/api/v1/auth/me',{credentials:'include'});
    const j=await r.json().catch(()=>({})); return {s:r.status, email:j.email, verified:j.email_verified, id:j.id, name:j.display_name||j.name};});
  out.screen = await page.evaluate(()=>{
    const vis=el=>{const r=el.getBoundingClientRect(); return r.width>2&&r.height>2;};
    return {heads:[...document.querySelectorAll('h1,h2,h3')].filter(vis).map(h=>h.innerText.trim().slice(0,60)),
      ctrls:[...document.querySelectorAll('button,a,input')].filter(vis)
        .map(b=>`${b.tagName.toLowerCase()}${b.disabled?'(dis)':''}: ${((b.getAttribute('aria-label')||b.innerText||b.placeholder)||'').replace(/\s+/g,' ').trim().slice(0,40)}`),
      txt:(document.body.innerText||'').replace(/\s+/g,' ').slice(0,700)};
  });
  return out;
};
