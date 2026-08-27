export default async ({page}) => {
  const ws='W4QCF1XTURESO01', ch='C4QCGENERAL0001';
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`);
  await page.waitForTimeout(6000);
  const out={};
  out.ls = await page.evaluate(()=>{
    const k=Object.keys(localStorage).find(k=>k.startsWith('aloqa.saved-messages'));
    return {key:k, val:String(localStorage.getItem(k)).slice(0,240)};
  });
  const msg=page.locator('main [data-message-id]').filter({hasText:'QA-S2-SAVEDEV'}).last();
  out.found=await msg.count();
  if(out.found){
    await msg.scrollIntoViewIfNeeded(); await msg.hover(); await page.waitForTimeout(600);
    out.labels = await msg.evaluate(el=>[...el.querySelectorAll('button')]
      .filter(b=>b.getBoundingClientRect().height>0).map(b=>b.getAttribute('aria-label')));
    out.id = await msg.getAttribute('data-message-id');
  }
  // what the server says is saved
  out.savedPage = await page.evaluate(async(ws)=>{
    const r=await fetch(`/api/v1/workspaces/${ws}/channels`,{credentials:'include'});
    const j=await r.json(); const arr=j.channels||j.data||j||[];
    const saved=arr.find(c=>/saved/i.test(c.name||'')||c.type==='saved');
    return saved? {id:saved.id, name:saved.name, type:saved.type}:'no saved channel in list';
  }, ws);
  return out;
};
