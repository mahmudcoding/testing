export default async ({page}) => {
  const net=[];
  page.on('response', async r => { const u=r.url(); if(r.request().method()!=='GET' && /file|upload/i.test(u)) net.push({m:r.request().method(),u:u.replace('https://airion-cargo.store','').slice(0,70),s:r.status()}); });
  const btn = page.locator('[role=dialog] button:has-text("Upload 2 files")').first();
  if (!(await btn.count())) return {err:'dialog gone — rerun e-upload.mjs first'};
  const samples=[];
  const snap=()=>page.evaluate(()=>{
    const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0&&getComputedStyle(e).visibility!=='hidden';};
    const d=document.querySelector('[role=dialog]');
    return {dlg:!!d&&vis(d), dtxt:d?d.innerText.replace(/\n{2,}/g,' | ').slice(-260):null,
      toasts:[...document.querySelectorAll('[role=status],[role=alert],[data-sonner-toast],[class*=toast]')].filter(vis).map(x=>x.innerText.replace(/\n/g,' ').slice(0,70)).filter(Boolean)};
  });
  samples.push(await snap());
  await btn.click();
  for(let i=0;i<24;i++){ await page.waitForTimeout(500); samples.push(await snap()); }
  const api = await page.evaluate(async()=>{
    const r=await fetch('/api/v1/users/me/files?workspace_id=W4QEF1XTURESO01&scope=own',{credentials:'include'});
    const j=await r.json(); return {status:r.status,total:j.total, names:(j.files||j.data||[]).map(f=>(f.name||f.file_name)+' '+(f.size||f.size_bytes)+'B').slice(0,6)};
  });
  const main = await page.evaluate(()=>document.querySelector('main').innerText.replace(/\n{2,}/g,' | ').slice(0,400));
  return {net, dlgTrace:samples.map(s=>s.dlg?1:0).join(''), lastDlg:samples[samples.length-1].dtxt,
    toasts:[...new Set(samples.flatMap(s=>s.toasts))], api, main};
};
