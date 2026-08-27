export default async ({page}) => {
  const ws='W4QCF1XTURESO01', ch='C4QCPRIVATE0001';
  const out={};
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`);
  await page.waitForTimeout(9000);
  await page.locator('button[aria-label="Channel details"]').first().click({timeout:6000});
  await page.waitForTimeout(2800);
  // find the Name field and overflow it
  const inputs=await page.evaluate(()=>{
    const v=(e)=>{const r=e.getBoundingClientRect();return r.width>4&&r.height>4;};
    return [...document.querySelectorAll('input,textarea')].filter(v)
      .map((e,i)=>({i, label:e.getAttribute('aria-label')||e.getAttribute('placeholder')||e.name||'',
        val:(e.value||'').slice(0,20)}));});
  out.inputs=inputs;
  const nameIdx=(inputs.find(x=>/name/i.test(x.label))||inputs[0]||{}).i;
  if(nameIdx===undefined) return out;
  const f=page.locator('input,textarea').nth(nameIdx);
  await f.click(); await page.keyboard.press('Meta+A'); await page.keyboard.press('Delete');
  await page.keyboard.insertText('q'.repeat(300));
  await page.waitForTimeout(800);
  const save=page.locator('button[aria-label="Save changes"],button').filter({hasText:/^Save/}).first();
  out.saveFound=await save.count();
  const reqs=[]; const h=r=>{ if(r.method()!=='GET'&&/\/api\/v1\//.test(r.url())) reqs.push(r.method()); };
  page.on('request',h);
  if(out.saveFound) await save.click();
  await page.waitForTimeout(5000); page.off('request',h);
  out.reqs=reqs;
  out.onScreen=await page.evaluate(()=>{
    const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
    const txt=[...document.querySelectorAll('body *')].filter(e=>e.children.length===0&&v(e))
      .map(e=>(e.textContent||'').trim()).filter(Boolean);
    return {cyrillic: txt.filter(t=>/[А-Яа-яЁё]/.test(t)).slice(0,6),
      errors: txt.filter(t=>/error|invalid|too long|must|required|failed/i.test(t)&&t.length<80).slice(0,6)};});
  // restore the name
  await page.evaluate(async (ch)=>{ await fetch(`/api/v1/channels/${ch}`,{method:'PATCH',
    credentials:'include',headers:{'content-type':'application/json'},
    body:JSON.stringify({name:'qa-private'})}); }, ch);
  return out;
};
