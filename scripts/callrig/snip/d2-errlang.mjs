export default async ({ page }) => {
  const W='W4QDF1XTURESO01', CO='O4QDF1XTURESO01';
  await page.goto(`https://airion-cargo.store/w/${W}/settings/account`, { waitUntil:'networkidle' });
  await page.waitForTimeout(1200);
  return await page.evaluate(async () => {
    const W='W4QDF1XTURESO01', CO='O4QDF1XTURESO01';
    const me = await (await fetch('/api/v1/auth/me',{credentials:'include'})).json();
    const lang = (me.settings&&(me.settings.language||me.settings.locale)) || me.language || '(?)';
    const out=[];
    const hit=async(label,m,u,b,hdr)=>{ try{
      const r=await fetch(u,{method:m,credentials:'include',
        headers:Object.assign(b?{'Content-Type':'application/json'}:{},hdr||{}),
        body:b?JSON.stringify(b):undefined});
      const t=await r.text(); let j=null; try{j=JSON.parse(t);}catch{}
      out.push({label, status:r.status, key:j&&j.key, message:(j&&j.message)||t.slice(0,80)});
    }catch(e){ out.push({label,err:String(e).slice(0,60)}); } };
    await hit('403 audit (no perm)','GET',`/api/v1/workspaces/${W}/admin/audit-log?limit=1`);
    await hit('403 audit + Accept-Language en','GET',`/api/v1/workspaces/${W}/admin/audit-log?limit=1`,null,{'Accept-Language':'en-US,en;q=0.9'});
    await hit('400 role empty name','POST',`/api/v1/companies/${CO}/roles`,{name:'',permissions:[]});
    await hit('403 create role','POST',`/api/v1/companies/${CO}/roles`,{name:'D2 errprobe',permissions:[]});
    await hit('404 unknown message','GET','/api/v1/messaging/messages/M0000000000000/thread?limit=1');
    await hit('400 bad workspace','GET','/api/v1/workspaces/NOPE000000/channels');
    await hit('401 style: bad password change','POST','/api/v1/users/me/password',{current_password:'wrongwrong1!',new_password:'QaPass123!'});
    return { lang, out };
  });
};
