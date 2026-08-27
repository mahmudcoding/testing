export default async ({page}) => {
  const ws='W4QCF1XTURESO01', dm='C4OVEWOTJW1AA86', target='M4OWTXW7L8209AI';
  const out={};
  await page.goto(`https://airion-cargo.store/w/${ws}/d/${dm}`);
  await page.waitForTimeout(6000);
  out.me = await page.evaluate(async()=>(await (await fetch('/api/v1/auth/me',{credentials:'include'})).json()).id);
  const el=page.locator(`[data-message-id="${target}"]`);
  out.rendered=await el.count();
  if(!out.rendered) return out;
  out.authorFromApi = await page.evaluate(async({dm,target})=>{
    const j=await (await fetch(`/api/v1/messaging/channels/${dm}/messages?limit=5`,{credentials:'include'})).json();
    const m=(j.messages||j.data||j||[]).find(x=>x.id===target);
    return m? m.user_id:null;
  }, {dm,target});
  await el.scrollIntoViewIfNeeded(); await el.hover(); await page.waitForTimeout(600);
  out.inline = await el.evaluate(e=>[...e.querySelectorAll('button')]
    .filter(b=>b.getBoundingClientRect().height>4).map(b=>b.getAttribute('aria-label')).filter(Boolean));
  const more=el.locator('button[aria-label="More actions"]');
  if(await more.count()){ await more.first().click({force:true}); await page.waitForTimeout(800);
    out.menu=await page.evaluate(()=>{const m=document.querySelector('[role="menu"]');
      return m? (m.innerText||'').split('\n').map(s=>s.trim()).filter(Boolean).slice(0,14):[];});
    await page.keyboard.press('Escape'); }
  return out;
};
