const VS = `(el)=>{const r=el.getBoundingClientRect();if(r.width<1||r.height<1)return false;let n=el,op=1;while(n&&n!==document.documentElement){op*=parseFloat(getComputedStyle(n).opacity||'1');n=n.parentElement;}return op>0.05;}`;
export default async ({ page }) => {
  const out={};
  // close side panels
  for(const al of ['Close','Participants']){
    const b=page.locator(`button[aria-label="${al}"]`).first();
    if(await b.count()){ await b.click().catch(()=>{}); await page.waitForTimeout(1500); }
  }
  await page.waitForTimeout(2000);
  out.viewBtns = await page.evaluate((vs)=>{const vis=eval(vs);
    return [...document.querySelectorAll('button')].filter(vis).map(b=>(b.getAttribute('aria-label')||'').slice(0,24)).filter(a=>/view|grid|spotlight/i.test(a));},VS);
  const g = page.locator('button[aria-label="Grid view"]').first();
  if(await g.count()){ await g.click(); out.switched='grid'; await page.waitForTimeout(4000); }
  await page.screenshot({path:'/private/tmp/claude-501/-Users-mahmud-Projects-testing/f92e5e8b-bcc2-441a-8a07-a9ff137b0db6/scratchpad/grid9b.png'});
  out.measured = await page.evaluate((vs)=>{const vis=eval(vs);
    // a tile = a visible element carrying a participant name label, sized like a card
    const cards=[...document.querySelectorAll('div')].filter(e=>{ if(!vis(e)) return false;
      const r=e.getBoundingClientRect();
      if(r.width<120||r.height<80) return false;
      const t=(e.innerText||'').trim();
      return /^(QA (Alice|Bob|Carol|Dave|Owner|Admin)|Visitor \d+)/.test(t) && t.length<40; });
    const names=[...new Set(cards.map(c=>(c.innerText||'').trim().split('\n')[0].slice(0,20)))];
    return { tileCards:names.length, names,
      capText:[...document.body.querySelectorAll('*')].filter(e=>vis(e)&&e.children.length===0&&/show more|hidden|\+\d+|of \d+/i.test(e.innerText||''))
        .map(e=>e.innerText.replace(/\s+/g,' ').trim().slice(0,44)).slice(0,5),
      viewNow:[...document.querySelectorAll('button')].filter(vis).map(b=>(b.getAttribute('aria-label')||'')).filter(a=>/view/i.test(a)) };},VS);
  return out;
};
