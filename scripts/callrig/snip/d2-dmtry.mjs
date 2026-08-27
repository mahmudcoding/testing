// Try to start a DM with a named person from the directory, and record what happens.
export default async ({page}) => {
  const who = process.env.QA_WHO || 'QA Alice';
  const out={};
  await page.goto('https://airion-cargo.store/w/W4QDF1XTURESO01/directories?tab=people',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(7000);
  // the row's Message button
  const btn = page.locator(`main button[aria-label*="${who}"], main button:has-text("Message")`);
  out.msgButtons = await page.evaluate((who)=>{
    const bs=[...document.querySelectorAll('main button')].filter(b=>/^Message$/.test(b.innerText.trim()));
    return bs.length;
  }, who);
  // find the Message button in the row that mentions `who`
  // Walk UP from the exact name node to the smallest ancestor that holds a
  // Message button AND no other person's name — a loose ancestor spans the
  // whole list and its first Message button belongs to somebody else.
  const clicked = await page.evaluate((who)=>{
    const nameNode=[...document.querySelectorAll('main *')]
      .filter(e=>e.children.length===0 && (e.textContent||'').trim()===who)[0];
    if(!nameNode) return {err:'name node not found'};
    let p=nameNode;
    for(let i=0;i<8 && p;i++,p=p.parentElement){
      const btn=[...p.querySelectorAll('button')].find(x=>/^Message$/.test(x.innerText.trim()));
      if(!btn) continue;
      const others=(p.innerText||'').match(/QA [A-Z]\w+/g)||[];
      const uniq=[...new Set(others)];
      if(uniq.length!==1 || uniq[0]!==who) return {err:'ancestor spans '+uniq.join(',')};
      btn.scrollIntoView({block:'center'}); btn.click();
      return {ok:true, row:(p.innerText||'').replace(/\s+/g,' ').slice(0,70)};
    }
    return {err:'no Message button above name node'};
  }, who);
  out.clickedRow = clicked;
  await page.waitForTimeout(4000);
  out.url = page.url();
  const reqs=[]; const on=r=>{try{const u=new URL(r.url()); if(u.pathname.startsWith('/api/v1/')) reqs.push(`${r.request().method()} ${u.pathname} -> ${r.status()}`);}catch{}};
  page.on('response', on);
  // try to send
  const comp = page.locator('div[contenteditable="true"]');
  out.composer = await comp.count();
  if (out.composer) {
    await comp.first().click();
    await page.keyboard.press('Control+A'); await page.keyboard.press('Delete');
    await page.keyboard.type('QA-D2 privacy probe');
    await page.waitForTimeout(600);
    await page.keyboard.press('Enter');
    await page.waitForTimeout(4000);
  }
  out.reqs=reqs.filter(r=>/messag|direct|dm/i.test(r)); page.off('response', on);
  out.screen = await page.evaluate(()=>{
    const m=document.querySelector('main')||document.body;
    const notes=[...document.querySelectorAll('[role=status],[role=alert],[data-sonner-toast]')]
      .filter(e=>{const r=e.getBoundingClientRect(); return r.width>2&&r.height>2;})
      .map(e=>(e.innerText||'').replace(/\s+/g,' ').trim()).filter(Boolean);
    return {notes:[...new Set(notes)].slice(0,5), txt:(m.innerText||'').replace(/\s+/g,' ').slice(-450)};
  });
  return out;
};
