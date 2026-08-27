export default async ({page}) => {
  const ws='W4QCF1XTURESO01';
  await page.goto(`https://airion-cargo.store/w/${ws}/c/C4QCGENERAL0001`);
  await page.waitForTimeout(14000);
  const out={};
  out.notifications=await page.evaluate(async ()=>{
    const r=await fetch('/api/v1/notifications?limit=10',{credentials:'include'});
    const j=await r.json(); const a=(j&&(j.notifications||j.items))||[];
    const list=Array.isArray(a)?a:[];
    const hit=list.find(n=>JSON.stringify(n).includes('QA-GUESTMENTION'));
    return {total:list.length, unread:j&&j.unread_count,
      mention:hit?{title:hit.title, key:hit.title_key, type:hit.type}:'absent'};});
  out.mentionsPage=await page.evaluate(async ({ws})=>{
    const r=await fetch(`/api/v1/workspaces/${ws}/mentions?limit=20`,{credentials:'include'});
    let j=null; try{j=await r.json()}catch{}
    const a=(j&&(j.mentions||j.items))||[];
    return {status:r.status, total:Array.isArray(a)?a.length:null,
      hasIt:(Array.isArray(a)?a:[]).some(m=>JSON.stringify(m).includes('QA-GUESTMENTION'))};},{ws});
  // how does the guest see themselves and others in the member list?
  await page.locator('button[aria-label="Channel details"]').first().click({timeout:6000}).catch(()=>{});
  await page.waitForTimeout(3000);
  const mem=page.locator('button[aria-selected]').filter({hasText:/^Members/}).first();
  if(await mem.count()){ await mem.click({timeout:6000}).catch(()=>{}); await page.waitForTimeout(4500); }
  out.memberList=await page.evaluate(()=>{
    const rows=[];
    const walk=(n)=>{for(const c of n.childNodes){
      if(c.nodeType===3 && /^QA /.test((c.textContent||'').trim())){
        const cell=c.parentElement&&c.parentElement.parentElement;
        rows.push((cell?cell.innerText:'').replace(/\s*\n\s*/g,' | ').trim().slice(0,46));
      } else if(c.nodeType===1) walk(c);}};
    walk(document.body);
    return [...new Set(rows)].slice(0,8);});
  return out;
};
