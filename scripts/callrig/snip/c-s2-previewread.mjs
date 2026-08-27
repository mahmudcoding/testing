export default async ({page}) => {
  const ws='W4QCF1XTURESO01', dm='C4OVEWOTJW1AA86';
  const out={};
  await page.goto(`https://airion-cargo.store/w/${ws}/c/C4QCGENERAL0001`);
  await page.waitForTimeout(8000);
  const unread=()=>page.evaluate(async({ws,dm})=>{
    const j=await (await fetch(`/api/v1/workspaces/${ws}/unread`,{credentials:'include'})).json();
    const g=(j.unread_counts||[]).find(c=>c.channel_id===dm);
    const vis=(x)=>{const r=x.getBoundingClientRect();return r.width>4&&r.height>4;};
    const a=[...document.querySelectorAll(`a[href*="${dm}"]`)].filter(vis)[0];
    return {api:g||null, badge:a?(a.innerText||'').replace(/\s+/g,' ').slice(0,22):null};}, {ws,dm});
  out.before=await unread();
  await page.locator(`a[href="/w/${ws}/d/${dm}"]`).first().click({button:'right'});
  await page.waitForTimeout(1200);
  const pv=page.locator('[role="menu"]').getByText('Preview',{exact:true}).first();
  if(!await pv.count()){ await page.keyboard.press('Escape'); return {...out, err:'no Preview'}; }
  const reqs=[];
  const onReq=r=>{ if(r.url().includes('/read')&&r.method()==='POST') reqs.push(r.url().split('/api/v1')[1]+' '+(r.postData()||'').slice(0,40)); };
  page.on('request', onReq);
  await pv.click(); await page.waitForTimeout(5000);
  out.duringPreview=await unread();
  await page.keyboard.press('Escape'); await page.waitForTimeout(2000);
  page.off('request', onReq);
  out.readRequests=reqs;
  out.afterClose=await unread();
  return out;
};
