// Invite-link form: pick a role, probe the Maximum uses field, then create one
// invite and revoke it.
export default async ({page}) => {
  const WS='W4QDF1XTURESO01';
  await page.goto(`https://airion-cargo.store/w/${WS}/settings/admin/invites`,{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(7000);
  const out={};
  // role picker: button[aria-label="Role"] (below the fold on this page too)
  const trig = page.locator('main button[aria-label="Role"]').first();
  out.roleTrigger = await trig.count();
  if (out.roleTrigger) {
    await trig.scrollIntoViewIfNeeded(); await page.waitForTimeout(400);
    await trig.click(); await page.waitForTimeout(1600);
    out.roleOptions = await page.evaluate(()=>{
      const vis=el=>{const r=el.getBoundingClientRect();return r.width>2&&r.height>2;};
      const pop=[...document.querySelectorAll('[data-radix-popper-content-wrapper],[role=listbox],[role=menu]')].filter(vis).pop();
      if(!pop) return {err:'no popup'};
      return [...new Set([...pop.querySelectorAll('*')].filter(e=>e.children.length===0)
        .map(e=>(e.textContent||'').trim()).filter(Boolean))].slice(0,10);
    });
    await page.evaluate(()=>{
      const vis=el=>{const r=el.getBoundingClientRect();return r.width>2&&r.height>2;};
      const pop=[...document.querySelectorAll('[data-radix-popper-content-wrapper],[role=listbox],[role=menu]')].filter(vis).pop();
      const it=[...pop.querySelectorAll('*')].filter(e=>e.children.length===0)
        .find(e=>/Member · Workspace role|Member/.test((e.textContent||'').trim()));
      if(it){let c=it;for(let i=0;i<4&&c;i++,c=c.parentElement){if(c.getAttribute&&(c.getAttribute('role')||/^(BUTTON|LI|A)$/.test(c.tagName)))break;}(c||it).click();}
    });
    await page.waitForTimeout(1200);
    out.rolePicked = await trig.innerText().catch(()=>'?');
  }
  const num = page.locator('main input[type=number]').first();
  const st = () => page.evaluate(()=>{
    const m=document.querySelector('main');
    const b=[...m.querySelectorAll('button')].find(x=>/^Create invite link$/.test(x.innerText.trim()));
    const i=m.querySelector('input[type=number]');
    const inline=[...m.querySelectorAll('p,span')].filter(e=>e.children.length===0)
      .map(e=>({t:(e.textContent||'').trim(),c:(typeof e.className==='string'?e.className:'')}))
      .filter(x=>x.t&&x.t.length<120&&(/red|error/i.test(x.c)||/(between|least|most|invalid|must|Enter )/i.test(x.t)))
      .map(x=>x.t);
    return {val:i?i.value:null, min:i?i.getAttribute('min'):null, max:i?i.getAttribute('max'):null,
            btnDisabled:b?b.disabled:'n/a', inline:[...new Set(inline)].slice(0,2)};
  });
  out.cases=[];
  for (const v of ['0','-1','1','10000','10001','99999']) {
    await num.fill(''); await page.waitForTimeout(200);
    await num.fill(v); await page.waitForTimeout(800);
    out.cases.push({typed:v, ...await st()});
  }
  await num.fill(''); await page.waitForTimeout(600);
  out.emptyState = await st();
  return out;
};
