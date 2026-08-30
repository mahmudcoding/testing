export default async ({page}) => {
  const TXT=process.env.QA_TEXT||'priv';
  const target=process.env.QA_TO||'QA Bob';
  const out={};
  const tob = page.locator('[data-testid="in-call-chat-panel"] button[aria-label="To"]').first();
  await tob.click(); await page.waitForTimeout(2500);
  out.menuSnapshot = await page.evaluate(()=>{
    const vis = el=>{const r=el.getBoundingClientRect(); if(r.width<1||r.height<1) return false;
      let n=el,op=1; while(n&&n!==document.documentElement){op*=parseFloat(getComputedStyle(n).opacity||'1');n=n.parentElement;} return op>0.05;};
    const cands=[...document.querySelectorAll('[role=menu],[data-radix-menu-content],[role=listbox],[data-radix-popper-content-wrapper],[role=dialog]')].filter(vis);
    return cands.map(m=>({role:m.getAttribute('role'),tid:m.dataset.testid||null,txt:(m.innerText||'').replace(/\s+/g,' ').slice(0,150)}));
  });
  // click the item by visible text with a real mouse click
  const suffix = process.env.QA_SUFFIX || '(member)';
  const item = page.locator(`text=${target} ${suffix}`).last();
  out.itemCount = await item.count();
  if (out.itemCount) {
    const box = await item.boundingBox();
    out.box = box;
    if (box) { await page.mouse.click(box.x+box.width/2, box.y+box.height/2); await page.waitForTimeout(1500); }
  }
  out.composerState = await page.evaluate(()=>{
    const p=document.querySelector('[data-testid="in-call-chat-panel"]');
    const ta=p.querySelector('textarea');
    return {to:(p.querySelector('button[aria-label="To"]')?.innerText||'').trim(), ph:ta?.placeholder,
      panelHead:(p.innerText||'').replace(/\s+/g,' ').slice(0,120)};
  });
  if (!new RegExp(target.split(' ')[0]).test(out.composerState.to)) { out.abort='recipient not set'; return out; }
  const ta = page.locator('[data-testid="in-call-chat-panel"] textarea').first();
  await ta.click(); await ta.fill(''); await ta.type(TXT,{delay:15});
  await page.waitForTimeout(200);
  await page.keyboard.press('Enter');
  await page.waitForTimeout(3000);
  out.list = await page.evaluate(()=>{
    const l=document.querySelector('[data-testid="in-call-chat-list"]');
    return l?(l.innerText||'').replace(/\s+/g,' ').slice(0,900):null;});
  out.toAfter = await page.evaluate(()=>(document.querySelector('[data-testid="in-call-chat-panel"] button[aria-label="To"]')?.innerText||'').trim());
  return out;
};
