export default async ({page}) => {
  const WS='W4QDF1XTURESO01';
  return await page.evaluate(async (ws)=>{
    const j = async u => { const r = await fetch(u,{credentials:'include'}); return {s:r.status, b: await r.text()}; };
    const me = await j('/api/v1/auth/me');
    const act = await j(`/api/v1/workspace/${ws}/meetings/active`);
    const cur = await j('/api/v1/meetings/current');
    return {me: me.b.slice(0,200), active: act.b.slice(0,1200), current: cur.b.slice(0,400)};
  }, WS);
};
