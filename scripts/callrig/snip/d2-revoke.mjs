// Remove a role from a member via the "Remove <role> from <name>" button.
export default async ({page}) => {
  const WS='W4QDF1XTURESO01', scope=process.env.QA_SCOPE||'workspace';
  const label = process.env.QA_BTN;   // exact aria-label / text
  await page.goto(`https://airion-cargo.store/w/${WS}/settings/roles?scope=${scope}`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(5000);
  const before = await page.evaluate(()=>[...document.querySelectorAll('main button')].map(b=>(b.getAttribute('aria-label')||b.innerText||'').replace(/\s+/g,' ').trim()).filter(t=>/^Remove /.test(t)));
  const b = page.locator(`main button[aria-label="${label}"], main button:text-is("${label}")`).first();
  const found = await b.count();
  let reqs=[];
  if (found) {
    await b.scrollIntoViewIfNeeded();
    const on=r=>{try{const u=new URL(r.url()); if(u.pathname.startsWith('/api/v1/')) reqs.push(`${r.request().method()} ${u.pathname} -> ${r.status()}`);}catch{}};
    page.on('response', on);
    await b.click();
    await page.waitForTimeout(1500);
    // a confirmation dialog may appear
    const dlg = await page.evaluate(()=>{const d=document.querySelector('[role=dialog],[role=alertdialog]'); return d?{txt:(d.innerText||'').replace(/\s+/g,' ').slice(0,200), btns:[...d.querySelectorAll('button')].map(x=>x.innerText.trim())}:null;});
    if (dlg) { await page.locator('[role=dialog] button, [role=alertdialog] button').filter({hasText:/Remove|Confirm|Yes/i}).first().click().catch(()=>{}); await page.waitForTimeout(2000); }
    await page.waitForTimeout(2500);
    reqs = reqs.slice(); page.off('response', on);
    var dialog = dlg;
  }
  const txt = await page.evaluate(()=>(document.body.innerText||'').replace(/\s+/g,' '));
  const i = txt.indexOf('MEMBER ROLES');
  return {found, before, dialog: typeof dialog!=='undefined'?dialog:null, reqs: reqs.filter(r=>/role/i.test(r)), after: txt.slice(i,i+450)};
};
