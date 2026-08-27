// Boundary-probe the company name field. Never saves; restores the field at the end.
export default async ({page}) => {
  await page.goto('https://airion-cargo.store/w/W4QDF1XTURESO01/settings/company',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(6500);
  const inp = page.locator('main input[placeholder="Acme Inc"]').first();
  const orig = await inp.inputValue();
  const state = () => page.evaluate(()=>{
    const vis=el=>{const r=el.getBoundingClientRect(); return r.width>2&&r.height>2;};
    const m=document.querySelector('main');
    const btns=[...m.querySelectorAll('button')].filter(vis)
      .map(b=>`${b.disabled?'(dis)':''}${(b.innerText||'').replace(/\s+/g,' ').trim().slice(0,26)}`)
      .filter(t=>/Save|Discard|Cancel/i.test(t));
    const i=m.querySelector('input[placeholder="Acme Inc"]');
    const msgs=[...m.querySelectorAll('p,span')].map(e=>(e.innerText||'').trim())
      .filter(t=>t&&t.length<110&&/(charact|least|most|required|invalid|must|between)/i.test(t));
    return {len:i.value.length, maxlen:i.getAttribute('maxlength'), saveBar:btns, notes:[...new Set(msgs)].slice(0,2)};
  });
  const out={orig, initial: await state(), cases:[]};
  for (const [n,v] of [['1 char','A'],['2 chars','Ab'],['empty',''],['whitespace','   '],
                       ['128 chars','X'.repeat(128)],['200 chars','Z'.repeat(200)]]) {
    await inp.fill(''); await page.waitForTimeout(250);
    if(v) await inp.fill(v);
    await page.waitForTimeout(900);
    out.cases.push({case:n, typed:v.length, ...await state()});
  }
  await inp.fill(orig); await page.waitForTimeout(700);
  out.restoredTo = await inp.inputValue();
  out.finalState = await state();
  return out;
};
