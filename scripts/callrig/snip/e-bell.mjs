export default async ({page}) => {
  const WS='W4QEF1XTURESO01';
  await page.goto(`https://airion-cargo.store/w/${WS}/c/C4QEGENERAL0001`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(3500);
  const out={};
  out.apiUnread = await page.evaluate(async()=>{
    const r=await fetch('/api/v1/notifications?limit=20',{credentials:'include'});
    const j=await r.json();
    const arr=j.notifications||j.data||[];
    return {total:j.total, unread:j.unread_count ?? arr.filter(n=>!(n.is_read??n.read)).length, n:arr.length,
      items:arr.slice(0,6).map(x=>({ti:x.title,read:x.is_read??x.read}))};
  });
  out.bellBefore = await page.evaluate(()=>{
    const b=[...document.querySelectorAll('button,a')].find(x=>/notification/i.test(x.getAttribute('aria-label')||''));
    return b? {label:b.getAttribute('aria-label'), txt:b.innerText.replace(/\n/g,' ').trim().slice(0,40)} : null;
  });
  await page.locator('[aria-label="Notifications"]').first().click();
  await page.waitForTimeout(2800);
  out.panel = await page.evaluate(()=>{
    const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0;};
    const d=document.querySelector('[role=dialog]')||document.querySelector('[role=menu]');
    const scope=d||document.querySelector('main');
    return {isDialog:!!d, txt:scope.innerText.replace(/\n{2,}/g,' | ').slice(0,700),
      btns:[...scope.querySelectorAll('button,[role=tab],a')].filter(vis).map(b=>(b.getAttribute('aria-label')||b.innerText).trim()).filter(Boolean).slice(0,22)};
  });
  return out;
};
