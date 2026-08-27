export default async ({page}) => {
  const out={}; const ws='W4QDF1XTURESO01';
  const NAME = 'QA verify probe D';
  await page.goto(`https://airion-cargo.store/w/${ws}/settings/roles?scope=company`,{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(3500);

  // fill role name
  const nameInput = page.locator('main input').filter({hasNot: page.locator('[placeholder="Filter settings"]')});
  const inputs = await page.evaluate(()=>[...document.querySelectorAll('main input')]
     .map((e,i)=>({i, ph:e.placeholder||'', type:e.type, vis:e.getBoundingClientRect().width>0})));
  out.inputs = inputs;

  await page.evaluate((n)=>{
    const ins=[...document.querySelectorAll('main input')].filter(e=>e.type==='text'&&e.placeholder!=='Filter settings');
    // React-friendly set
    const el=ins[0]; if(!el) return;
    const setter=Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype,'value').set;
    setter.call(el,n); el.dispatchEvent(new Event('input',{bubbles:true}));
  }, NAME);
  await page.waitForTimeout(500);

  // tick one permission ("View company members")
  const permBox = page.locator('main label', {hasText:'View company members'}).first();
  await permBox.click().catch(e=>out.permErr=String(e).slice(0,80));
  await page.waitForTimeout(500);

  // capture the create request
  const reqs=[];
  page.on('response', r=>{ const u=r.url(); if(/\/api\/v1\/.*role/i.test(u)) reqs.push({m:r.request().method(), url:u.replace(/^https:\/\/[^/]+/,''), s:r.status()}); });

  await page.locator('main button', {hasText:/^Create role$/}).first().click().catch(e=>out.createErr=String(e).slice(0,80));
  await page.waitForTimeout(3000);
  out.createReqs = reqs.slice();

  out.rolesAfterCreate = await page.evaluate(()=>{
    const t=(document.querySelector('main')||document.body).innerText;
    const i=t.indexOf('ROLE\tPERMISSIONS'); return i>=0? t.slice(i,i+500).split('\n').slice(0,20):'?';
  });
  return out;
}
