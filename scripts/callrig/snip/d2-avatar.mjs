import { watchNotices } from './lib.mjs';
export default async ({page}) => {
  const WS='W4QDF1XTURESO01';
  const path = process.env.QA_FILE;
  await page.goto(`https://airion-cargo.store/w/${WS}/settings/${process.env.QA_PAGE||'account'}`,{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(6500);
  const out={file:path};
  out.controls = await page.evaluate(()=>{
    const m=document.querySelector('main');
    return {fileInputs:[...m.querySelectorAll('input[type=file]')].map(i=>({accept:i.getAttribute('accept')||'-', multiple:i.multiple,
              hidden:getComputedStyle(i).display==='none'||i.getBoundingClientRect().width<2})),
            btns:[...m.querySelectorAll('button')].map(b=>(b.innerText||'').trim()).filter(t=>/avatar|image|upload|remove/i.test(t))};
  });
  if (!out.controls.fileInputs.length) return out;
  const before = await page.evaluate(async()=>{const r=await fetch('/api/v1/auth/me',{credentials:'include'});const j=await r.json();return j.avatar_url||null;});
  out.avatarBefore = before;
  const reqs=[]; const on=r=>{try{const u=new URL(r.url()); const m=r.request().method();
    if(m!=='GET'||u.pathname.startsWith('/api/v1/')) reqs.push(`${m} ${u.pathname} -> ${r.status()}`);}catch{}};
  page.on('response', on);
  out.notices = await watchNotices(page,{ms:12000, trigger: async()=>{
    await page.locator('main input[type=file]').first().setInputFiles(path);
  }});
  page.off('response', on);
  out.reqs = reqs.filter(r=>/avatar|upload|file|auth|profile|tenant/i.test(r));
  await page.waitForTimeout(1500);
  out.avatarAfter = await page.evaluate(async()=>{const r=await fetch('/api/v1/auth/me',{credentials:'include'});const j=await r.json();return j.avatar_url||null;});
  return out;
};
