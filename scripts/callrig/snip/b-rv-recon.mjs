export default async ({page}) => {
  await page.goto('https://staging.airion-cargo.store/', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(3000);
  return await page.evaluate(async () => {
    const j = async u => { const r = await fetch(u,{credentials:'include'}); let b=null; try{b=await r.json();}catch{} return {s:r.status,b}; };
    const me = await j('/api/v1/auth/me');
    const ws = (location.pathname.match(/\/w\/([A-Za-z0-9]+)/)||[])[1] || null;
    const cur = await j('/api/v1/meetings/current');
    const act = ws ? await j(`/api/v1/workspace/${ws}/meetings/active`) : null;
    return {
      url: location.href, ws,
      me: me.b && {email:me.b.email, id:me.b.id, name:me.b.name||me.b.full_name},
      current: cur.s===200 ? JSON.stringify(cur.b).slice(0,300) : cur.s,
      active: act && (act.s===200 ? (act.b.meetings||[]).map(m=>({id:m.id,name:m.name,status:m.status,pc:m.participant_count})) : act.s),
      vis: document.visibilityState,
    };
  });
};
