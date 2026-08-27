// Delete a role by name from the Roles page; record the warning and the result.
export default async ({page}) => {
  const WS='W4QDF1XTURESO01', scope=process.env.QA_SCOPE||'company', role=process.env.QA_ROLE;
  await page.goto(`https://airion-cargo.store/w/${WS}/settings/roles?scope=${scope}`,{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(6000);
  const out={};
  out.clicked = await page.evaluate(r=>{
    for(const tr of document.querySelectorAll('tr')) if((tr.innerText||'').includes(r)){
      const b=[...tr.querySelectorAll('button')].find(x=>/^Delete/i.test((x.getAttribute('aria-label')||x.innerText||'').trim()));
      if(b){b.scrollIntoView({block:'center'}); b.click(); return true;}
    } return false;
  }, role);
  await page.waitForTimeout(2000);
  out.dialog = await page.evaluate(()=>{const d=document.querySelector('[role=dialog],[role=alertdialog]');
    return d?{txt:(d.innerText||'').replace(/\s+/g,' ').slice(0,300),btns:[...d.querySelectorAll('button')].map(x=>x.innerText.trim()).filter(Boolean)}:null;});
  const reqs=[]; const on=r=>{try{const u=new URL(r.url()); if(u.pathname.startsWith('/api/v1/')) reqs.push(`${r.request().method()} ${u.pathname} -> ${r.status()}`);}catch{}};
  page.on('response', on);
  if(out.dialog){ await page.locator('[role=dialog] button,[role=alertdialog] button')
    .filter({hasText:/^(Delete|Delete role|Confirm|Yes)$/i}).first().click().catch(e=>out.err=String(e).slice(0,80)); }
  await page.waitForTimeout(4500);
  out.reqs=reqs.filter(r=>/role/i.test(r)); page.off('response', on);
  const txt=await page.evaluate(()=>(document.querySelector('main').innerText||'').replace(/\s+/g,' '));
  out.table = txt.slice(txt.indexOf('ROLE PERMISSIONS'), txt.indexOf('ROLE PERMISSIONS')+420);
  const i=txt.indexOf('MEMBER ROLES'); out.memberRoles = txt.slice(i,i+420);
  return out;
};
