export default async ({page}) => {
  const ws='W4QCF1XTURESO01', ch='C4QCPRIVATE0001';
  const out={};
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`);
  await page.waitForTimeout(9000);
  await page.locator('button[aria-label="Channel details"]').first().click({timeout:6000});
  await page.waitForTimeout(3000);
  const name=page.locator('input[type="text"]:visible').first();
  out.nameBefore=await name.inputValue();
  await name.click();
  await page.keyboard.press('Meta+A'); await page.keyboard.press('Delete');
  await page.keyboard.insertText('q'.repeat(300));
  await page.waitForTimeout(900);
  out.typed=(await name.inputValue()).length;
  const reqs=[]; const h=async r=>{ if(r.method()!=='GET'&&/\/api\/v1\//.test(r.url()))
    reqs.push(r.method()+' '+new URL(r.url()).pathname.slice(-26)); };
  page.on('request',h);
  const resps=[]; const hr=async r=>{ if(r.status()>=400&&/\/api\/v1\//.test(r.url())){
    try{ resps.push((await r.text()).slice(0,200)); }catch(e){} } };
  page.on('response',hr);
  const save=page.locator('button[aria-label="Save changes"]').first();
  out.saveByAria=await save.count();
  if(out.saveByAria) await save.click();
  else { const s2=page.locator('button:visible').filter({hasText:/^Save/}).first();
         out.saveByText=await s2.count(); if(out.saveByText) await s2.click(); }
  await page.waitForTimeout(5500);
  page.off('request',h); page.off('response',hr);
  out.reqs=reqs; out.errorBodies=resps;
  out.screen=await page.evaluate(()=>{
    const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
    const txt=[...document.querySelectorAll('body *')].filter(e=>e.children.length===0&&v(e))
      .map(e=>(e.textContent||'').trim()).filter(Boolean);
    return {cyrillicOnScreen: txt.filter(t=>/[А-Яа-яЁё]/.test(t)).slice(0,6),
      errorish: txt.filter(t=>/error|invalid|long|must|required|failed|cannot/i.test(t)&&t.length<90).slice(0,6)};});
  // restore
  await page.evaluate(async ({ch,n})=>{ await fetch(`/api/v1/channels/${ch}`,{method:'PATCH',
    credentials:'include',headers:{'content-type':'application/json'},
    body:JSON.stringify({name:n})}); }, {ch, n:out.nameBefore});
  await page.waitForTimeout(1500);
  out.nameAfter=await page.evaluate(async (ch)=>{
    const r=await fetch('/api/v1/workspaces/W4QCF1XTURESO01/channels',{credentials:'include'});
    const j=await r.json(); const a=j.channels||j.data||j;
    const c=(Array.isArray(a)?a:[]).find(x=>x.id===ch); return c?c.name:'?';}, ch);
  return out;
};
