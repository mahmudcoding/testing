export default async ({ page }) => {
  const MODE = process.env.D2_MODE || 'CLEANUP';
  await page.goto('https://airion-cargo.store/w/W4QDF1XTURESO01/settings/roles?scope=company', { waitUntil:'domcontentloaded' });
  await page.waitForTimeout(1200);
  return await page.evaluate(async (mode) => {
    const W='W4QDF1XTURESO01', CO='O4QDF1XTURESO01', ALICE='U4QDALICE000001';
    const call=async(m,u,b)=>{const r=await fetch(u,{method:m,credentials:'include',
      headers:b?{'Content-Type':'application/json'}:{},body:b?JSON.stringify(b):undefined});
      const t=await r.text();let j=null;try{j=JSON.parse(t);}catch{};return{s:r.status,j,raw:t.slice(0,200)};};
    const roleLists = async () => {
      const c=await call('GET',`/api/v1/companies/${CO}/roles`);
      const w=await call('GET',`/api/v1/workspaces/${W}/roles`);
      const norm=x=>Array.isArray(x.j)?x.j:((x.j&&x.j.roles)||[]);
      return { co:norm(c), ws:norm(w) };
    };
    // ---- always clean first ----
    const before = await roleLists();
    const cleaned=[];
    for (const r of before.co) if (/^D2 (union|zero|dup)/.test(r.name)) {
      await call('POST','/api/v1/companies/roles/revoke',{role_id:r.id,user_id:ALICE});
      const d=await call('DELETE',`/api/v1/companies/roles/${r.id}`); cleaned.push(`co:${r.name}:${d.s}`);
    }
    for (const r of before.ws) if (/^D2 (union|zero|dup)/.test(r.name)) {
      await call('POST',`/api/v1/workspaces/${W}/roles/revoke`,{role_id:r.id,user_id:ALICE});
      const d=await call('DELETE',`/api/v1/companies/roles/${r.id}`); cleaned.push(`ws:${r.name}:${d.s}`);
    }
    if (mode==='CLEANUP') return { cleaned };

    const out={ cleaned };
    if (mode==='UNION') {
      const cw=await call('POST',`/api/v1/workspaces/${W}/roles`,{name:'D2 union W',permissions:[`workspace.${W}.audit.view`]});
      const cc=await call('POST',`/api/v1/companies/${CO}/roles`,{name:'D2 union C',permissions:[`company.${CO}.role.get`]});
      out.createW={s:cw.s,id:cw.j&&cw.j.id}; out.createC={s:cc.s,id:cc.j&&cc.j.id};
      if (cw.j&&cw.j.id) out.assignW=(await call('POST',`/api/v1/workspaces/${W}/roles/assign`,{role_id:cw.j.id,user_id:ALICE})).s;
      if (cc.j&&cc.j.id) out.assignC=(await call('POST','/api/v1/companies/roles/assign',{role_id:cc.j.id,user_id:ALICE})).s;
    }
    if (mode==='ZERO') {
      const c=await call('POST',`/api/v1/companies/${CO}/roles`,{name:'D2 zero',permissions:[]});
      out.create={s:c.s,body:c.raw};
      if (c.j&&c.j.id) out.assign=(await call('POST','/api/v1/companies/roles/assign',{role_id:c.j.id,user_id:ALICE})).s;
    }
    if (mode==='DUP') {
      const a=await call('POST',`/api/v1/companies/${CO}/roles`,{name:'D2 dup',permissions:[`company.${CO}.role.get`]});
      const b=await call('POST',`/api/v1/companies/${CO}/roles`,{name:'D2 dup',permissions:[`company.${CO}.member.view`]});
      out.first={s:a.s,id:a.j&&a.j.id}; out.second={s:b.s,id:b.j&&b.j.id,body:b.raw};
      const after=await roleLists();
      out.namedD2dup=after.co.filter(r=>r.name==='D2 dup').map(r=>({id:r.id,perms:(r.permissions||[]).length}));
    }
    // report alice's effective permissions as the company member row shows them
    const mem=await call('GET',`/api/v1/companies/${CO}/members?limit=100&offset=0`);
    const arr=(mem.j&&(mem.j.members||mem.j.items))||[]; const m=arr.find(x=>x.user_id===ALICE);
    out.aliceRoles = m?(m.roles||[]).map(r=>r.name):null;
    out.alicePerms = m?(m.roles||[]).flatMap(r=>r.permissions||[]):null;
    return out;
  }, MODE);
};
