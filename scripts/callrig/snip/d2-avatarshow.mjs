export default async ({page}) => {
  const WS='W4QDF1XTURESO01';
  const out={};
  out.api = await page.evaluate(async()=>{
    const get=async u=>{try{return await (await fetch(u,{credentials:'include'})).text();}catch{return 'ERR';}};
    const me=await get('/api/v1/auth/me');
    const mem=await get(`/api/v1/workspaces/W4QDF1XTURESO01/members`);
    const pick=(t,who)=>{const i=t.indexOf(who); if(i<0) return 'not found';
      const s=t.slice(Math.max(0,i-120), i+260); const m=s.match(/"avatar_url":"[^"]*"/); return m?m[0]:'(no avatar_url field)';};
    return {me_has_avatar_field: /"avatar_url"/.test(me) ? (me.match(/"avatar_url":"?[^,"]*"?/)||[''])[0] : '(no avatar_url field in /auth/me)',
            members_alice: pick(mem,'U4QDALICE000001'),
            whoami:(me.match(/"email":"[^"]*"/)||[''])[0]};
  });
  for (const [name,url] of [['account','/w/'+WS+'/settings/account'],
                            ['profile','/w/'+WS+'/settings/profile'],
                            ['directories','/w/'+WS+'/directories?tab=people']]) {
    await page.goto('https://airion-cargo.store'+url,{waitUntil:'domcontentloaded'});
    await page.waitForTimeout(6000);
    out[name] = await page.evaluate(()=>{
      const vis=el=>{const r=el.getBoundingClientRect(); return r.width>2&&r.height>2;};
      const imgs=[...document.querySelectorAll('img')].filter(vis)
        .map(i=>({src:(i.getAttribute('src')||'').slice(0,70), w:Math.round(i.getBoundingClientRect().width)}));
      return {imgCount:imgs.length, imgs:imgs.slice(0,6)};
    });
  }
  return out;
};
