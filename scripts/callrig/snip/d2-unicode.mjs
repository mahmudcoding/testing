export default async ({ page }) => {
  await page.goto('https://airion-cargo.store/w/W4QDF1XTURESO01/settings/roles?scope=company', { waitUntil:'networkidle' });
  await page.waitForTimeout(2200);
  return await page.evaluate(async () => {
    const CO='O4QDF1XTURESO01';
    const call=async(m,u,b)=>{const r=await fetch(u,{method:m,credentials:'include',
      headers:b?{'Content-Type':'application/json'}:{},body:b?JSON.stringify(b):undefined});
      const t=await r.text(); let j=null; try{j=JSON.parse(t);}catch{}; return {s:r.status,j,b:t.slice(0,160)};};
    const names=[
      ['emoji','D2U 🎧🌴 role'],
      ['rtl','D2U مرحبا role'],
      ['cyrillic','D2U Роль Тестовая'],
      ['zero-width','D2U a​b role'],
      ['combining','D2U é́́ role'],
    ];
    const out=[];
    for (const [tag,name] of names) {
      const c=await call('POST', `/api/v1/companies/${CO}/roles`, {name, permissions:[]});
      let readBack=null, del=null;
      if (c.j && c.j.id) {
        const list=await call('GET', `/api/v1/companies/${CO}/roles`);
        const arr=Array.isArray(list.j)?list.j:((list.j&&list.j.roles)||[]);
        const found=arr.find(r=>r.id===c.j.id);
        readBack = found ? found.name : '(not in list)';
        del=await call('DELETE', `/api/v1/companies/roles/${c.j.id}`);
      }
      out.push({ tag, sent:name, created:c.s, sentLen:name.length,
                 readBack, readBackLen: readBack&&readBack.length,
                 identical: readBack===name, deleted:del&&del.s, err:c.s>=400?c.b:null });
    }
    const after=await call('GET', `/api/v1/companies/${CO}/roles`);
    const arr=Array.isArray(after.j)?after.j:((after.j&&after.j.roles)||[]);
    return { results:out, rolesRemaining:arr.map(r=>r.name) };
  });
};
