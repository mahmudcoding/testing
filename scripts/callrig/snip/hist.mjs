export default async ({page}) => {
  return await page.evaluate(async () => {
    const g = async l => { const r = await fetch('/api/v1/meetings/history?limit='+l,{credentials:'include'}); const j = await r.json(); return j.meetings||[]; };
    const me = await (await fetch('/api/v1/auth/me',{credentials:'include'})).json();
    const a = await g(20), b = await g(100);
    return {me: me.email, n20: a.length, n100: b.length,
      keys: Object.keys(b[0]||{}),
      names100: b.map(m=>m.name+'|'+m.id).slice(0,100)};
  });
};
