export default async ({page}) => {
  const ws='W4QCF1XTURESO01';
  const out={};
  await page.goto(`https://airion-cargo.store/w/${ws}/c/C4QCGENERAL0001`);
  await page.waitForTimeout(7500);
  const dm=await page.evaluate(()=>{const a=[...document.querySelectorAll('a[href*="/d/"]')]
    .filter(x=>x.getBoundingClientRect().height>0)[0];
    return a? {href:a.getAttribute('href'), txt:(a.innerText||'').replace(/\s+/g,' ').slice(0,20)}:null;});
  out.dm=dm;
  if(!dm) return out;
  out.urlBefore=page.url().replace('https://airion-cargo.store','');
  await page.locator(`a[href="${dm.href}"]`).first().click({button:'right'});
  await page.waitForTimeout(1200);
  const pv=page.locator('[role="menu"]').getByText('Preview',{exact:true}).first();
  out.previewItem=await pv.count();
  if(!out.previewItem){ await page.keyboard.press('Escape'); return out; }
  const reqs=[];
  const onReq=r=>{ if(r.url().includes('/api/v1/')&&r.method()!=='GET') reqs.push(r.method()+' '+r.url().split('/api/v1')[1].slice(0,40)); };
  page.on('request', onReq);
  await pv.click();
  const s=[]; for(let i=0;i<10;i++){ await page.waitForTimeout(600);
    s.push(await page.evaluate(()=>{
      const vis=(x)=>{const r=x.getBoundingClientRect();return r.width>4&&r.height>4;};
      const d=[...document.querySelectorAll('[role="dialog"]')].filter(vis)[0];
      return {url:location.pathname, dialog:!!d,
        dialogTxt:d?(d.innerText||'').replace(/\s+/g,' ').slice(0,140):null,
        poppers:document.querySelectorAll('[data-radix-popper-content-wrapper]').length,
        active:document.activeElement?(document.activeElement.getAttribute('aria-label')||document.activeElement.tagName):null};}));
  }
  page.off('request', onReq);
  out.reqs=reqs;
  out.first=s[0]; out.last=s.at(-1);
  out.urlChanged=s.some(x=>x.url!==out.urlBefore);
  out.dialogSeen=s.some(x=>x.dialog);
  await page.keyboard.press('Escape');
  return out;
};
