const empty = async (page, comp) => {
  for (let i=0;i<8;i++){
    if ((await comp.evaluate(e=>e.innerText.trim()))==='') return true;
    await comp.click(); await page.keyboard.press('Meta+A'); await page.keyboard.press('Delete');
    await page.waitForTimeout(250);
  }
  return false;
};
export default async ({page}) => {
  const ws='W4QCF1XTURESO01', dm='C4OVEWOTJW1AA86';
  const out={};
  await page.goto(`https://airion-cargo.store/w/${ws}/d/${dm}`);
  await page.waitForTimeout(7000);
  const comp=page.locator('div[contenteditable="true"][aria-label="Compose message"]');
  await empty(page, comp);
  await comp.type('@', {delay:60}); await page.waitForTimeout(1400);
  out.picker=await page.evaluate(()=>[...document.querySelectorAll('[role="option"]')]
    .filter(e=>e.getBoundingClientRect().height>0).map(e=>(e.innerText||'').replace(/\s+/g,' ').slice(0,36)));
  await empty(page, comp);
  // pick the other person if offered
  await comp.type('@qa_c_carol', {delay:55}); await page.waitForTimeout(1300);
  const o=page.locator('[role="option"]').filter({hasText:'qa_c_carol'});
  out.carolOffered=await o.count();
  if(await o.count()) await o.first().click();
  await page.waitForTimeout(700);
  await comp.type('QA-S2-DMMENTION', {delay:35}); await page.waitForTimeout(400);
  const posts=[];
  const onReq=r=>{ if(r.url().endsWith('/api/v1/messaging/messages')&&r.method()==='POST') posts.push(JSON.parse(r.postData()||'{}')); };
  page.on('request', onReq);
  await page.keyboard.press('Enter'); await page.waitForTimeout(3000);
  page.off('request', onReq);
  out.post=posts.map(p=>({body:p.body, mention_user_ids:p.mention_user_ids, mention_all:p.mention_all}));
  await empty(page, comp);
  // @all in a DM
  await comp.type('@all', {delay:60}); await page.waitForTimeout(1300);
  out.allPicker=await page.evaluate(()=>[...document.querySelectorAll('[role="option"]')]
    .filter(e=>e.getBoundingClientRect().height>0).map(e=>(e.innerText||'').replace(/\s+/g,' ').slice(0,30)));
  await empty(page, comp);
  return out;
};
