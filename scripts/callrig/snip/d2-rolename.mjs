// Role name validation in the Create-role form. Submits only the duplicate case.
export default async ({page}) => {
  const WS='W4QDF1XTURESO01';
  await page.goto(`https://airion-cargo.store/w/${WS}/settings/roles?scope=company`,{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(6000);
  const name = page.locator('main input[placeholder="e.g. Moderators"]').first();
  const state = () => page.evaluate(()=>{
    const m=document.querySelector('main');
    const b=[...m.querySelectorAll('button')].find(x=>/^Create role$/.test(x.innerText.trim()));
    const i=m.querySelector('input[placeholder="e.g. Moderators"]');
    const msgs=[...m.querySelectorAll('p,span')].map(e=>(e.innerText||'').trim())
      .filter(t=>t&&t.length<110&&/(exist|already|charact|required|least|most|invalid|must)/i.test(t));
    return {len:i.value.length, maxlen:i.getAttribute('maxlength'), createDisabled:b?b.disabled:'n/a', notes:[...new Set(msgs)].slice(0,2)};
  });
  const out={cases:[]};
  // tick one permission so only the name is in question
  await page.evaluate(()=>{const b=document.querySelectorAll('input[type=checkbox]')[5]; if(b&&!b.checked) b.click();});
  await page.waitForTimeout(400);
  for (const [n,v] of [['empty',''],['1 char','A'],['2 chars','Ab'],['whitespace','   '],
                       ['64 chars','X'.repeat(64)],['200 chars','Z'.repeat(200)],['duplicate "Member"','Member']]) {
    await name.fill(''); await page.waitForTimeout(200);
    if(v) await name.fill(v);
    await page.waitForTimeout(800);
    const s=await state();
    let submitted=null;
    if (n.startsWith('duplicate') && s.createDisabled===false) {
      const reqs=[]; const on=r=>{try{const u=new URL(r.url()); if(u.pathname.startsWith('/api/v1/')) reqs.push(`${r.request().method()} ${u.pathname} -> ${r.status()}`);}catch{}};
      page.on('response', on);
      await page.locator('main button').filter({hasText:/^Create role$/}).first().click();
      await page.waitForTimeout(4000); page.off('response', on);
      submitted={reqs:reqs.filter(r=>/role/i.test(r)), after:await state(),
        notices: await page.evaluate(()=>[...document.querySelectorAll('[role=status],[role=alert],[data-sonner-toast]')]
          .filter(e=>{const r=e.getBoundingClientRect();return r.width>2&&r.height>2;})
          .map(e=>(e.innerText||'').replace(/\s+/g,' ').trim()).filter(Boolean).slice(0,3))};
    }
    out.cases.push({case:n, typed:v.length, ...s, submitted});
  }
  const txt=await page.evaluate(()=>(document.querySelector('main').innerText||'').replace(/\s+/g,' '));
  out.table = txt.slice(txt.indexOf('ROLE PERMISSIONS'), txt.indexOf('ROLE PERMISSIONS')+330);
  return out;
};
