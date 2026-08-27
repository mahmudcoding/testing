export default async ({page}) => {
  await page.goto('https://airion-cargo.store/w/W4QDF1XTURESO01/directories',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4000);
  return await page.evaluate(async()=>{
    const s=await (await fetch('/api/v1/notifications/settings',{credentials:'include'})).json();
    const n=await (await fetch('/api/v1/notifications?limit=10',{credentials:'include'})).json();
    return {settings:s, total:n.total, unread:n.unread_count,
      latest:(n.notifications||[]).slice(0,3).map(x=>({t:x.title, b:(x.body||'').slice(0,50), at:x.created_at, type:x.event_type}))};
  });
};
