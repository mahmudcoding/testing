// Open a person's profile popup from the directory and read what it says.
export default async ({page}) => {
  const who = process.env.QA_WHO || 'QA Alice';
  await page.goto('https://airion-cargo.store/w/W4QDF1XTURESO01/directories?tab=people',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(7000);
  const out={};
  // presence-ish nodes anywhere on the row, before clicking
  out.rowMarkers = await page.evaluate((who)=>{
    const el=[...document.querySelectorAll('*')].filter(e=>e.children.length===0 && (e.textContent||'').trim()===who)[0];
    if(!el) return 'name node not found';
    let row=el; for(let i=0;i<5&&row;i++) row=row.parentElement;
    const marks=[...row.querySelectorAll('*')].map(e=>({
      cls:(typeof e.className==='string'?e.className:'').slice(0,90),
      al:e.getAttribute('aria-label')||'', dt:e.getAttribute('data-status')||e.getAttribute('data-presence')||''}))
      .filter(m=>/presence|online|status|offline|active/i.test(m.cls+m.al+m.dt));
    return marks.slice(0,6);
  }, who);
  const nameLoc = page.locator(`main :text-is("${who}")`).first();
  await nameLoc.scrollIntoViewIfNeeded().catch(()=>{});
  await nameLoc.click().catch(e=>out.clickErr=String(e).slice(0,80));
  await page.waitForTimeout(3000);
  out.popup = await page.evaluate(()=>{
    const vis=el=>{const r=el.getBoundingClientRect(); return r.width>2&&r.height>2;};
    const d=[...document.querySelectorAll('[role=dialog],[data-radix-popper-content-wrapper],[role=tooltip]')].filter(vis);
    return d.map(x=>(x.innerText||'').replace(/\s+/g,' ').slice(0,300));
  });
  out.url = page.url();
  return out;
};
