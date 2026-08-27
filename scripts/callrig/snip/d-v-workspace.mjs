const controls = async (page) => page.evaluate(()=>{
  const main=document.querySelector('main')||document.body;
  return [...main.querySelectorAll('button,a,[role=button],select,[role=menuitem],[role=tab]')]
    .filter(e=>{const r=e.getBoundingClientRect(); return r.width>0&&r.height>0&&e.offsetParent!==null;})
    .map(e=>{const t=(e.innerText||e.getAttribute('aria-label')||'').trim().replace(/\s+/g,' ').slice(0,44);
      return `${e.tagName.toLowerCase()}${e.disabled?'(disabled)':''}:${t}`;})
    .filter(s=>!/:$/.test(s));
});

export default async ({page}) => {
  const out={}; const ws='W4QDF1XTURESO01';
  await page.goto(`https://airion-cargo.store/w/${ws}/settings/workspace`,{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4000);
  out.url=page.url();

  out.general = {controls: await controls(page)};
  out.general.transferMatches = out.general.controls.filter(s=>/transfer|ownership|owner/i.test(s));

  // Danger zone + Workspace identity text
  const t = await page.evaluate(()=>{
    const main=document.querySelector('main')||document.body; const txt=main.innerText||'';
    const grab=(h,n)=>{const i=txt.indexOf(h); return i<0?null:txt.slice(i,i+n).split('\n').map(s=>s.trim()).filter(Boolean).slice(0,10);};
    return {danger: grab('Danger zone',320), identity: grab('Workspace identity',320),
      hasTransferWord: /transfer/i.test(txt), fullLen: txt.length};
  });
  out.text=t;

  // inputs in content area (finding 4)
  out.inputs = await page.evaluate(()=>[...(document.querySelector('main')||document.body)
    .querySelectorAll('input,textarea,[contenteditable="true"],select')]
    .filter(e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0;})
    .map(e=>`${e.tagName.toLowerCase()}[${e.type||''}] ph="${e.placeholder||''}" aria="${e.getAttribute('aria-label')||''}" val="${(e.value||'').slice(0,24)}"`));

  // Leave workspace button state
  out.leave = await page.evaluate(()=>{
    const b=[...document.querySelectorAll('button')].find(x=>/Leave workspace/i.test(x.innerText||''));
    if(!b) return 'not found';
    const row=b.closest('div')?.parentElement;
    return {text:(b.innerText||'').trim(), disabled:b.disabled, ariaDisabled:b.getAttribute('aria-disabled'),
      nearbyText:((row&&row.innerText)||'').replace(/\s+/g,' ').slice(0,220)};
  });

  // Roles tab of workspace settings
  const rolesTab = page.locator('main [role=tab],main button', {hasText:/^Roles$/}).first();
  if (await rolesTab.count()) { await rolesTab.click().catch(()=>{}); await page.waitForTimeout(2500);
    out.rolesTab = {controls: await controls(page)};
    out.rolesTab.transferMatches = out.rolesTab.controls.filter(s=>/transfer|ownership/i.test(s)); }

  // Admin -> Workspaces
  await page.goto(`https://airion-cargo.store/w/${ws}/settings/admin/workspaces`,{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(3500);
  out.adminWorkspaces={controls: await controls(page)};
  out.adminWorkspaces.transferMatches=out.adminWorkspaces.controls.filter(s=>/transfer|ownership/i.test(s));
  return out;
}
