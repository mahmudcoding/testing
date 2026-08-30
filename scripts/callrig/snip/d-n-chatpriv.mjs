export default async ({page}) => {
  const TXT=process.env.QA_TEXT||'priv';
  const target=process.env.QA_TO||'QA Bob';
  const out={};
  const tob = page.locator('[data-testid="in-call-chat-panel"] button[aria-label="To"]').first();
  await tob.click(); await page.waitForTimeout(1200);
  out.picked = await page.evaluate((t)=>{
    const vis = el=>{const r=el.getBoundingClientRect(); if(r.width<1||r.height<1) return false;
      let n=el,op=1; while(n&&n!==document.documentElement){op*=parseFloat(getComputedStyle(n).opacity||'1');n=n.parentElement;} return op>0.05;};
    const cands=[...document.querySelectorAll('[role=menu],[data-radix-menu-content],[role=listbox],[data-radix-popper-content-wrapper]')].filter(vis);
    const m=cands[cands.length-1]; if(!m) return 'no-menu';
    const leaves=[...m.querySelectorAll('*')].filter(e=>e.children.length===0&&e.innerText&&vis(e));
    const hit=leaves.find(e=>e.innerText.includes(t)); if(!hit) return 'no-item';
    // click deepest clickable ancestor
    let n=hit; while(n&&n!==m && !(n.getAttribute('role')||'').match(/menuitem|option/)) n=n.parentElement;
    (n||hit).click(); return (n||hit).innerText.trim().slice(0,60);
  }, target);
  await page.waitForTimeout(1200);
  out.composerState = await page.evaluate(()=>{
    const p=document.querySelector('[data-testid="in-call-chat-panel"]');
    const ta=p.querySelector('textarea');
    return {to:(p.querySelector('button[aria-label="To"]')?.innerText||'').trim(), ph:ta?.placeholder};
  });
  const ta = page.locator('[data-testid="in-call-chat-panel"] textarea').first();
  await ta.click(); await ta.fill(''); await ta.type(TXT,{delay:15});
  await page.waitForTimeout(200);
  await page.keyboard.press('Enter');
  await page.waitForTimeout(3000);
  out.list = await page.evaluate(()=>{
    const l=document.querySelector('[data-testid="in-call-chat-list"]');
    return l?(l.innerText||'').replace(/\s+/g,' ').slice(0,800):null;});
  out.toAfter = await page.evaluate(()=>(document.querySelector('[data-testid="in-call-chat-panel"] button[aria-label="To"]')?.innerText||'').trim());
  return out;
};
