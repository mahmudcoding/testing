export default async ({page}) => {
  const before = await page.evaluate(async ()=>{
    const j = await (await fetch('/api/v1/notifications?limit=50',{credentials:'include'})).json();
    return {total:j.total, unread:j.unread_count, byCat: (j.notifications||[]).reduce((a,x)=>{a[x.category+'/'+(x.event_type||x.title_key)]=(a[x.category+'/'+(x.event_type||x.title_key)]||0)+1;return a;},{})};
  });
  await page.goto('https://airion-cargo.store/w/W4QAF1XTURESO01/calls',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(3000);
  const badge = await page.evaluate(()=>{const b=[...document.querySelectorAll('button')].find(x=>/Notifications/.test(x.getAttribute('aria-label')||'')); return b? b.getAttribute('aria-label'):null;});
  // open the notifications panel
  await page.evaluate(()=>{const b=[...document.querySelectorAll('button')].find(x=>/Notifications/.test(x.getAttribute('aria-label')||'')); if(b) b.setAttribute('data-qa-n','1');});
  const n = page.locator('[data-qa-n="1"]');
  let panel=null;
  if (await n.count()) { await n.click(); await page.waitForTimeout(3000);
    panel = await page.evaluate(()=>{const d=[...document.querySelectorAll('[role="dialog"],[data-radix-popper-content-wrapper],aside')].pop(); return d? {text:d.innerText.replace(/\n+/g,' | ').slice(0,600), btns:[...d.querySelectorAll('button')].map(b=>(b.getAttribute('aria-label')||b.textContent||'').trim().slice(0,30)).filter(Boolean).slice(0,12)}:null;}); }
  await page.waitForTimeout(3000);
  const after = await page.evaluate(async ()=>{
    const j = await (await fetch('/api/v1/notifications?limit=50',{credentials:'include'})).json();
    const b=[...document.querySelectorAll('button')].find(x=>/Notifications/.test(x.getAttribute('aria-label')||''));
    return {total:j.total, unread:j.unread_count, badge: b? b.getAttribute('aria-label'):null};
  });
  return {before, badge, panel, after};
};
