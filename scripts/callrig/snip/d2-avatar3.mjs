import { watchNotices } from './lib.mjs';
export default async ({page}) => {
  const WS='W4QDF1XTURESO01', path=process.env.QA_FILE;
  await page.goto(`https://airion-cargo.store/w/${WS}/settings/account`,{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(6500);
  const out={};
  out.before = await page.evaluate(async()=>{const j=await (await fetch('/api/v1/auth/me',{credentials:'include'})).json();return j.avatar_url||null;});
  await page.locator('main input[type=file]').first().setInputFiles(path);
  await page.waitForTimeout(2500);
  out.cropDialog = await page.evaluate(()=>{const d=document.querySelector('[role=dialog]');
    return d?{txt:(d.innerText||'').replace(/\s+/g,' ').slice(0,150),
      inputs:[...d.querySelectorAll('input')].map(i=>`${i.type} min=${i.min||'-'} max=${i.max||'-'} val=${i.value}`)}:null;});
  const reqs=[]; const on=r=>{try{const u=new URL(r.url()); const m=r.request().method();
    if(m!=='GET') reqs.push(`${m} ${u.pathname} -> ${r.status()}`);}catch{}};
  page.on('response', on);
  out.notices = await watchNotices(page,{ms:14000, trigger: async()=>{
    await page.locator('[role=dialog] button').filter({hasText:/^Apply$/}).first().click();
  }});
  page.off('response', on);
  out.reqs = reqs.filter(r=>!/rum/.test(r));
  await page.waitForTimeout(2000);
  out.after = await page.evaluate(async()=>{const j=await (await fetch('/api/v1/auth/me',{credentials:'include'})).json();return j.avatar_url||null;});
  // reload and check persistence + look for a remove control
  await page.goto(`https://airion-cargo.store/w/${WS}/settings/account`,{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(5000);
  out.afterReload = await page.evaluate(async()=>{
    const j=await (await fetch('/api/v1/auth/me',{credentials:'include'})).json();
    const vis=el=>{const r=el.getBoundingClientRect();return r.width>2&&r.height>2;};
    const m=document.querySelector('main');
    return {avatar:j.avatar_url||null,
      btns:[...m.querySelectorAll('button')].filter(vis).map(b=>(b.innerText||'').trim()).filter(t=>/avatar|image|remove|delete/i.test(t))};
  });
  return out;
};
