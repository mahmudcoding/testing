export default async ({page}) => {
  const rows = await page.evaluate(() => {
    const m = document.querySelector('main') || document.body;
    return [...m.querySelectorAll('li,[role="listitem"]')]
      .map(e=>e.innerText.replace(/\n+/g,' · ').trim())
      .filter(t=>/1-to-1/.test(t) || /No answer|Declined|Canceled/.test(t));
  });
  const api = await page.evaluate(async () => {
    const r = await fetch('/api/v1/meetings/history?limit=100', {credentials:'include'});
    const j = await r.json();
    return (j.meetings||[]).map(m=>({id:m.id,name:m.name,by:m.created_by,st:m.started_at,en:m.ended_at,er:m.end_reason,status:m.status,ch:m.channel_id,type:m.type,rating:m.rating&&m.rating.count}))
      .filter(m=>!m.ch);
  });
  return {rows, apiNoChannel: api.slice(0,14), meId: await page.evaluate(async()=> (await (await fetch('/api/v1/auth/me',{credentials:'include'})).json()).user?.id)};
};
