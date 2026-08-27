export default async ({page}) => {
  const ws='W4QCF1XTURESO01';
  const out={};
  await page.goto(`https://airion-cargo.store/w/${ws}`);
  await page.waitForTimeout(5500);
  const add=page.locator('button[aria-label="Add channel"]');
  out.addBtn=await add.count();
  if(!out.addBtn) return out;
  await add.first().click(); await page.waitForTimeout(1800);
  const name='QA C2 Slug? Test/Two';
  const ci=page.locator('[role="dialog"] input:visible').first();
  await ci.click(); await ci.fill(name); await page.waitForTimeout(700);
  out.typedValue=await ci.evaluate(e=>e.value);
  out.dialogText=await page.evaluate(()=>{
    const d=[...document.querySelectorAll('[role="dialog"]')].find(x=>x.getBoundingClientRect().height>30);
    return d? (d.innerText||'').replace(/\s+/g,' ').slice(0,180):null;});
  const posts=[];
  const onReq=r=>{ if(r.url().includes('/api/v1/channels')&&r.method()==='POST') posts.push((r.postData()||'').slice(0,120)); };
  page.on('request', onReq);
  const create=page.locator('[role="dialog"] button').filter({hasText:/^Create/}).first();
  await create.click(); await page.waitForTimeout(3500);
  page.off('request', onReq);
  out.createPost=posts;
  out.created=await page.evaluate(async(ws)=>{
    const j=await (await fetch(`/api/v1/workspaces/${ws}/channels`,{credentials:'include'})).json();
    const arr=(j.channels||j.data||j||[]);
    const c=arr.find(x=>/Slug/i.test(x.name||'')||/slug/i.test(x.name||''));
    return c? {id:c.id, name:c.name}:'not found';}, ws);
  return out;
};
