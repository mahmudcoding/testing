export default async ({page}) => {
  const me = await page.evaluate(async()=> (await (await fetch('/api/v1/auth/me',{credentials:'include'})).json()).email);
  const ui = await page.evaluate(()=>({
    body: document.body.innerText.replace(/\n+/g,' | ').slice(0,300),
    toasts: [...document.querySelectorAll('[data-sonner-toast],[role="status"],[role="alert"]')].map(x=>x.innerText.replace(/\n+/g,' ').slice(0,110)).filter(Boolean)}));
  const api = await page.evaluate(async ()=>{
    const h = await (await fetch('/api/v1/meetings/history?limit=3',{credentials:'include'})).json();
    const n = await (await fetch('/api/v1/notifications?limit=3',{credentials:'include'})).json();
    return {hist: (h.meetings||[]).map(m=>({id:m.id,name:m.name,status:m.status,created_by:m.created_by})),
            notifs: (n.notifications||[]).map(x=>({t:x.title, k:x.title_key, et:x.event_type, read:x.read}))};
  });
  await page.goto('https://airion-cargo.store/w/W4QAF1XTURESO01/calls',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4000);
  const rows = await page.evaluate(()=>[...document.querySelectorAll('main button')].map(b=>b.textContent.replace(/\s+/g,' ').trim()).filter(t=>/Outbound|Incoming/.test(t)).slice(0,3));
  return {me, ui, api, recentRows: rows};
};
