export default async ({page}) => {
  const ws='W4QCF1XTURESO01', dm='C4OVEWOTJW1AA86';
  const out={reqs:[]};
  await page.goto(`https://airion-cargo.store/w/${ws}/d/${dm}`);
  await page.waitForTimeout(7500);
  const snap=()=>page.evaluate(()=>{
    const vis=(x)=>{const r=x.getBoundingClientRect();return r.width>4&&r.height>4;};
    const comp=document.querySelector('div[contenteditable="true"][aria-label="Compose message"]');
    const h=document.querySelector('main header')||document.querySelector('header');
    return {composer:!!comp, composerEditable: comp? comp.getAttribute('contenteditable'):null,
      header:(h?h.innerText:'').replace(/\s+/g,' ').slice(0,60),
      unavailable:/Unavailable user/i.test(document.body.innerText),
      dmsInSidebar:[...document.querySelectorAll('a[href*="/d/"]')].filter(vis)
        .map(a=>(a.innerText||'').replace(/\s+/g,' ').slice(0,18)),
      notices:[...document.querySelectorAll('[role="status"],[role="alert"]')].filter(vis)
        .map(x=>x.textContent.trim().slice(0,50))};});
  out.before=await snap();
  // block from the sidebar context menu
  const onReq=r=>{ if(r.url().includes('/api/v1/')&&r.method()!=='GET')
    out.reqs.push(r.method()+' '+r.url().split('/api/v1')[1].slice(0,40)+' '+(r.postData()||'').slice(0,40)); };
  page.on('request', onReq);
  await page.locator(`a[href="/w/${ws}/d/${dm}"]`).first().click({button:'right'});
  await page.waitForTimeout(1000);
  const blk=page.locator('[role="menu"]').getByText('Block',{exact:true}).first();
  out.blockItem=await blk.count();
  if(!out.blockItem){ await page.keyboard.press('Escape'); page.off('request', onReq); return out; }
  await blk.click();
  // ALK-3547: is there a confirmation dialog?
  const s=[]; for(let i=0;i<8;i++){ await page.waitForTimeout(500);
    s.push(await page.evaluate(()=>({dialog:!!document.querySelector('[role="dialog"],[role="alertdialog"]'),
      dialogTxt:(()=>{const d=document.querySelector('[role="dialog"],[role="alertdialog"]');
        return d?(d.innerText||'').replace(/\s+/g,' ').slice(0,80):null;})()}))); }
  page.off('request', onReq);
  out.confirmDialogSeen=s.some(x=>x.dialog);
  out.dialogTexts=[...new Set(s.map(x=>x.dialogTxt).filter(Boolean))];
  await page.waitForTimeout(1500);
  out.afterBlock=await snap();
  return out;
};
