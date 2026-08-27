export default async ({page}) => {
  const WS='W4QDF1XTURESO01';
  await page.goto(`https://airion-cargo.store/w/${WS}/settings/account`,{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(7000);
  const out={};
  out.me = await page.evaluate(async()=>{const r=await fetch('/api/v1/auth/me',{credentials:'include'});
    const t=await r.text(); return t.slice(0,420);});
  out.membersRow = await page.evaluate(async()=>{
    const r=await fetch('/api/v1/workspaces/W4QDF1XTURESO01/members',{credentials:'include'});
    const t=await r.text();
    const i=t.indexOf('ALICE'); return i>=0? t.slice(Math.max(0,i-160), i+200) : t.slice(0,240);});
  out.pageImgs = await page.evaluate(()=>{
    const vis=el=>{const r=el.getBoundingClientRect(); return r.width>2&&r.height>2;};
    return [...document.querySelectorAll('img')].filter(vis).map(i=>({src:(i.getAttribute('src')||'').slice(0,80), w:Math.round(i.getBoundingClientRect().width)}));
  });
  out.profileTxt = await page.evaluate(()=>{const t=(document.querySelector('main').innerText||'').replace(/\s+/g,' ');
    const i=t.indexOf('PROFILE'); return t.slice(i,i+180);});
  return out;
};
