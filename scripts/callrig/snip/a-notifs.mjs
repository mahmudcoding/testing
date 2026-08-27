export default async ({page}) => {
  return await page.evaluate(async () => {
    const j = await (await fetch('/api/v1/notifications?limit=14',{credentials:'include'})).json();
    return (j.notifications||j.items||[]).map(n=>({type:n.type, title:n.title, body:(n.body||'').slice(0,70), at:n.created_at}));
  });
};
