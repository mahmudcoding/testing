// Log in with QA_PW_OLD, change password to QA_PW_NEW, polling visible notices
// from BEFORE the click, and record what the screen does afterwards.
export default async ({page}) => {
  const email=process.env.QA_EMAIL, oldp=process.env.QA_PW_OLD, newp=process.env.QA_PW_NEW;
  const out={};
  await page.goto('https://airion-cargo.store/login',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(2000);
  const me0 = await page.evaluate(async()=>{try{const r=await fetch('/api/v1/auth/me',{credentials:'include'});return r.status;}catch{return 'err';}});
  if (me0!==200) {
    await page.fill('input[type=email]', email);
    await page.fill('input[type=password]', oldp);
    await page.click('button[type=submit]');
    await page.waitForTimeout(5000);
  }
  out.loggedIn = await page.evaluate(async()=>{const r=await fetch('/api/v1/auth/me',{credentials:'include'});
    return {s:r.status, e:(await r.json().catch(()=>({}))).email};});
  if (out.loggedIn.s!==200) return out;

  await page.goto('https://airion-cargo.store/w/W4QDF1XTURESO01/settings/security',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(6000);
  // poll visible notices from BEFORE the click
  await page.evaluate(()=>{ window.__n=[];
    const vis=el=>{const r=el.getBoundingClientRect(); if(r.width<3||r.height<3) return false;
      let n=el,o=1; while(n&&n!==document.documentElement){const c=getComputedStyle(n);
        if(c.display==='none'||c.visibility==='hidden')return false; o*=parseFloat(c.opacity||'1'); n=n.parentElement;} return o>0.01;};
    window.__t0=performance.now();
    window.__id=setInterval(()=>{
      const now=Math.round(performance.now()-window.__t0);
      window.__url=location.pathname;
      for(const e of document.querySelectorAll('[role=status],[role=alert],[data-sonner-toast]')){
        const t=(e.innerText||'').replace(/\s+/g,' ').trim(); if(!t) continue;
        const prev=window.__n.find(x=>x.t===t);
        let n=e,o=1; while(n&&n!==document.documentElement){o*=parseFloat(getComputedStyle(n).opacity||'1'); n=n.parentElement;}
        if(prev){prev.maxOp=Math.max(prev.maxOp,o); prev.last=now; prev.n++;}
        else window.__n.push({t,maxOp:o,first:now,last:now,n:1,vis:vis(e)});
      }
      if(!window.__nav && location.pathname.includes('/login')) window.__nav=now;
    },50);
  });
  await page.waitForTimeout(600);
  const f=page.locator('main input[type=password]');
  await f.nth(0).fill(oldp); await f.nth(1).fill(newp); await f.nth(2).fill(newp);
  await page.waitForTimeout(600);
  const reqs=[]; const on=r=>{try{const u=new URL(r.url()); if(u.pathname.startsWith('/api/v1/')) reqs.push(`${r.request().method()} ${u.pathname} -> ${r.status()}`);}catch{}};
  page.on('response', on);
  await page.locator('main button').filter({hasText:/^Update password$/}).first().click();
  await page.waitForTimeout(9000);
  out.reqs=reqs.slice(); page.off('response', on);
  out.notices = await page.evaluate(()=>{clearInterval(window.__id); return {clickAtMs:0, notices:window.__n, loginAtMs:window.__nav};});
  out.urlAfter = page.url();
  out.screenAfter = await page.evaluate(()=>(document.body.innerText||'').replace(/\s+/g,' ').slice(0,330));
  out.meAfter = await page.evaluate(async()=>{const r=await fetch('/api/v1/auth/me',{credentials:'include'}); return r.status;});
  // does the page react to the dead session on its own?
  await page.waitForTimeout(8000);
  out.urlAfter20s = page.url();
  out.screenAfter20s = await page.evaluate(()=>(document.body.innerText||'').replace(/\s+/g,' ').slice(0,330));
  return out;
};
