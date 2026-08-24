export default async ({page}) => {
  await page.goto('https://airion-cargo.store/w/W4QAF1XTURESO01/calls',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(3000);
  const b = await page.$('button[aria-label^="Notifications"]');
  if (!b) return {err:'no notifications button'};
  await b.click(); await page.waitForTimeout(3000);
  const panel = await page.evaluate(()=>{
    const d=[...document.querySelectorAll('[role="dialog"],[role="menu"],[data-radix-popper-content-wrapper]')].pop();
    return d? {text:d.innerText.replace(/\n+/g,' | ').slice(0,600)} : {body: document.body.innerText.replace(/\n+/g,' | ').slice(0,500)};
  });
  const raw = await page.evaluate(async()=>{
    const j=await (await fetch('/api/v1/notifications?limit=10',{credentials:'include'})).json();
    const m=(j.notifications||[]).find(x=>/MISSED/.test(x.title_key||''));
    return m? {title:m.title, body:m.body, payload:m.payload, created:m.created_at} : null;
  });
  return {panel, missedNotif: raw};
};
