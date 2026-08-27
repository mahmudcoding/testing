export default async ({page}) => {
  const ws='W4QCF1XTURESO01', ch='C4QCPRIVATE0001';
  const out={reqs:[]};
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`);
  await page.waitForTimeout(9000);
  page.on('request', r=>{ const u=r.url();
    if(/\/api\/v1\//.test(u)&&r.method()!=='GET')
      out.reqs.push(r.method()+' '+u.replace(/^https?:\/\/[^/]+\/api\/v1/,'').slice(0,64)); });
  await page.locator('button[aria-label="Channel details"]').first().click({timeout:6000});
  await page.waitForTimeout(3000);
  const tab=page.locator('[role="tab"],button').filter({hasText:/^Members/}).first();
  out.membersTab=await tab.count();
  if(out.membersTab){ await tab.click(); await page.waitForTimeout(2500); }
  out.rows=await page.evaluate(()=>{
    const v=(e)=>{const r=e.getBoundingClientRect();return r.width>4&&r.height>4;};
    const d=[...document.querySelectorAll('[role="dialog"],aside,[role="complementary"]')]
      .filter(v).find(e=>/Members/i.test(e.innerText||''));
    if(!d) return ['no dialog'];
    return [...d.querySelectorAll('button')].filter(v)
      .map(e=>(e.getAttribute('aria-label')||e.textContent||'').trim())
      .filter(Boolean).slice(0,14);});
  const dlg=page.locator('[role="dialog"],[role="complementary"],aside').filter({hasText:/Members/}).last();
  const rm=dlg.locator('button').filter({hasText:/^Remove$/}).first();
  const rmAria=dlg.locator('button').filter({has:page.locator('xpath=.')}).locator('xpath=self::button[starts-with(@aria-label,"Remove") and not(contains(@aria-label,"reaction"))]').first();
  out.removeByText=await rm.count(); out.removeByAria=await rmAria.count();
  const btn = out.removeByText ? rm : (out.removeByAria ? rmAria : null);
  if(!btn) return out;
  out.btnLabel=await btn.evaluate(e=>e.getAttribute('aria-label')||e.textContent.trim());
  out.membersBefore=await page.evaluate(async (ch)=>{
    const r=await fetch(`/api/v1/channels/${ch}/members`,{credentials:'include'});
    const j=await r.json().catch(()=>null); const a=j?.members||j?.data||j;
    return Array.isArray(a)?a.length:('status '+r.status);}, ch);
  await btn.evaluate(e=>{ window.__c=0; e.addEventListener('click',()=>{window.__c++;},{capture:true}); });
  out.reqs.length=0;
  await btn.click(); await page.waitForTimeout(5000);
  out.clickLanded=await page.evaluate(()=>window.__c||0);
  out.reqsAfter=[...out.reqs];
  out.dialogAfter=await page.evaluate(()=>{
    const v=(e)=>{const r=e.getBoundingClientRect();return r.width>4&&r.height>4;};
    return [...document.querySelectorAll('[role="dialog"],[role="alertdialog"]')].filter(v)
      .map(e=>(e.innerText||'').replace(/\s+/g,' ').slice(0,50));});
  out.membersAfter=await page.evaluate(async (ch)=>{
    const r=await fetch(`/api/v1/channels/${ch}/members`,{credentials:'include'});
    const j=await r.json().catch(()=>null); const a=j?.members||j?.data||j;
    return Array.isArray(a)?a.length:('status '+r.status);}, ch);
  return out;
};
