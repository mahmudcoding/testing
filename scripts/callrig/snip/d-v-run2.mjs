export default async ({page}) => {
  const out={}; const ws='W4QDF1XTURESO01';

  // --- finding 1, run 2: pagination boundary on the audit log ---
  await page.goto(`https://airion-cargo.store/w/${ws}/settings/admin/audit-log`,{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4000);
  const readRows = () => page.evaluate(()=>{
    const rows=[...document.querySelectorAll('table tr')].filter(tr=>tr.offsetParent!==null);
    return rows.slice(1).map(tr=>((tr.querySelector('td')||{}).innerText||'').trim());
  });
  out.page1 = await readRows();
  const next = page.locator('main button', {hasText:/^Next$/}).first();
  out.nextDisabled = await next.evaluate(e=>e.disabled).catch(()=>'n/a');
  if (out.nextDisabled === false) { await next.click().catch(()=>{}); await page.waitForTimeout(2500); out.page2 = await readRows(); }
  out.anyRoleEventOnScreen = [...(out.page1||[]), ...(out.page2||[])].filter(a=>/^role\./.test(a));

  // --- findings 2 & 4, run 2: reach the page by clicking through the UI, not by URL ---
  await page.goto(`https://airion-cargo.store/w/${ws}`,{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(3000);
  await page.goto(`https://airion-cargo.store/w/${ws}/settings/account`,{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(2500);
  const wsLink = page.locator('a', {hasText:/^Workspace$/}).first();
  out.navClicked = await wsLink.count() ? (await wsLink.click().then(()=>true).catch(()=>false)) : false;
  await page.waitForTimeout(3500);
  out.urlAfterNav = page.url();

  out.run2 = await page.evaluate(()=>{
    const main=document.querySelector('main')||document.body; const txt=main.innerText||'';
    const b=[...document.querySelectorAll('button')].find(x=>/Leave workspace/i.test(x.innerText||''));
    const ctrls=[...main.querySelectorAll('button,a,[role=button],select')]
      .filter(e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0;})
      .map(e=>(e.innerText||e.getAttribute('aria-label')||'').trim().replace(/\s+/g,' ').slice(0,40)).filter(Boolean);
    const inputs=[...main.querySelectorAll('input,textarea,select')]
      .filter(e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0;})
      .map(e=>`${e.type||e.tagName}:"${e.placeholder||''}"`);
    return {
      leaveDisabled: b? b.disabled : 'no button',
      hint: (txt.match(/Transfer workspace ownership[^\n]*/)||[null])[0],
      identitySubtitle: (txt.match(/Name, URL, and default channel[^\n]*/)||[null])[0],
      controlCount: ctrls.length,
      transferOrDelete: ctrls.filter(s=>/transfer|ownership|delete workspace/i.test(s)),
      inputs
    };
  });
  return out;
}
