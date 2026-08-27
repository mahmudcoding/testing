export default async ({page}) => {
  await page.goto('https://airion-cargo.store/company/create',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(6500);
  const inp = page.locator('input[type=text]').first();
  const st = () => page.evaluate(()=>{
    const b=[...document.querySelectorAll('button')].find(x=>/^Create$/.test(x.innerText.trim()));
    const i=document.querySelector('input[type=text]');
    const msgs=[...document.querySelectorAll('p,span,div')].filter(e=>e.children.length===0)
      .map(e=>({t:(e.textContent||'').trim(), c:(typeof e.className==='string'?e.className:'')}))
      .filter(x=>x.t && x.t.length<120 && (/red|error/i.test(x.c)||/(charact|least|most|invalid|exist|must|Use )/i.test(x.t)))
      .map(x=>x.t);
    return {len:i?i.value.length:null, max:i?i.getAttribute('maxlength'):null,
            createDisabled:b?b.disabled:'n/a', msgs:[...new Set(msgs)].slice(0,2)};
  });
  const out={cases:[]};
  for (const [n,v] of [['empty',''],['1 char','A'],['2 chars','Ab'],['whitespace','   '],['128','X'.repeat(128)],['200 typed','Z'.repeat(200)]]) {
    await inp.fill(''); await page.waitForTimeout(200);
    if(v) await inp.fill(v);
    await page.waitForTimeout(700);
    out.cases.push({case:n, typed:v.length, ...await st()});
  }
  if (process.env.QA_GO==='1') {
    await inp.fill(''); await inp.fill(process.env.QA_CONAME||'QA D2 Probe Company');
    await page.waitForTimeout(600);
    const reqs=[]; const on=r=>{try{const u=new URL(r.url()); const m=r.request().method();
      if(m!=='GET'||u.pathname.startsWith('/api/v1/')) reqs.push(`${m} ${u.pathname} -> ${r.status()}`);}catch{}};
    page.on('response', on);
    await page.locator('button').filter({hasText:/^Create$/}).first().click();
    await page.waitForTimeout(9000);
    out.reqs=reqs.filter(r=>/compan|workspace/i.test(r)); page.off('response', on);
    out.after = await page.evaluate(async()=>{
      const co=await (await fetch('/api/v1/users/me/companies',{credentials:'include'})).json().catch(()=>({}));
      const ws=await (await fetch('/api/v1/users/me/workspaces',{credentials:'include'})).json().catch(()=>({}));
      return {url:location.pathname,
        companies:(co.companies||[]).map(c=>c.name+' owner='+((c.owner||{}).username||'?')),
        workspaces:(ws.workspaces||[]).map(w=>w.name+' ('+w.type+')'),
        txt:(document.body.innerText||'').replace(/\s+/g,' ').slice(0,320)};
    });
  }
  return out;
};
