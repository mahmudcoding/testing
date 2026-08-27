export default async ({page}) => {
  const ws='W4QCF1XTURESO01', ch='C4QCGENERAL0001';
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`);
  await page.waitForTimeout(11000);
  const me=await page.evaluate(async ()=>{
    const r=await fetch('/api/v1/auth/me',{credentials:'include'});
    const j=await r.json(); return {id:j.id||j.user_id, name:j.display_name||j.name};});
  await page.locator('button[aria-label="Channel details"]').first().click({timeout:6000});
  await page.waitForTimeout(3000);
  await page.locator('button[aria-selected]').filter({hasText:/^Files/}).first().click({timeout:6000});
  await page.waitForTimeout(7000);
  const ui=await page.evaluate(()=>{
    const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
    const W=innerWidth;
    const pane=[...document.querySelectorAll('div,section')].filter(v)
      .filter(e=>{const b=e.getBoundingClientRect();return b.left>W*0.72&&b.width>250&&b.height>250;})
      .sort((a,b)=>(a.innerText||'').length-(b.innerText||'').length)[0];
    const names=[...document.querySelectorAll('button,a')].filter(v)
      .filter(e=>e.getBoundingClientRect().left>W*0.72)
      .map(e=>(e.getAttribute('aria-label')||'').trim())
      .filter(t=>/^Open .+\.(png|jpg|jpeg|gif|pdf|txt|webp)$/i.test(t));
    return {paneText:pane?(pane.innerText||'').replace(/\s+/g,' ').trim().slice(0,200):'NO-PANE',
      fileEntries:[...new Set(names)].slice(0,10)};});
  const api=await page.evaluate(async ({ws,ch,me})=>{
    const r=await fetch(`/api/v1/users/me/files?workspace_id=${ws}&scope=own`,{credentials:'include'});
    let j=null; try{j=await r.json()}catch{}
    const a=(j&&(j.files||j.items))||[];
    const inCh=(Array.isArray(a)?a:[]).filter(f=>(f.channel_id||'')===ch);
    return {status:r.status, ownTotal:Array.isArray(a)?a.length:null,
      ownInThisChannel:inCh.length, sample:inCh.slice(0,3).map(f=>f.name||f.file_name||'?')};},
    {ws,ch,me});
  return {account:me.name, filesTabUI:ui, ownFilesApi:api};
};
