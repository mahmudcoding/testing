export default async ({page}) => {
  const ws='W4QCF1XTURESO01', ch='C4QCGENERAL0001';
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`);
  await page.waitForTimeout(12000);
  const out={};
  // 1) profile card of the guest, opened from the sidebar DM entry
  const dm=page.locator('a[href*="/d/"]').filter({hasText:'QA Guest'}).first();
  out.guestDmInSidebar=await dm.count();
  // 2) open Channel details -> Members and look for a guest marker
  await page.locator('button[aria-label="Channel details"]').first().click({timeout:6000}).catch(()=>{});
  await page.waitForTimeout(3000);
  const mem=page.locator('button[aria-selected]').filter({hasText:/^Members/}).first();
  if(await mem.count()){ await mem.click({timeout:6000}).catch(()=>{}); await page.waitForTimeout(4500); }
  out.membersPane=await page.evaluate(()=>{
    const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
    const W=innerWidth;
    const pane=[...document.querySelectorAll('div,section')].filter(v)
      .filter(e=>{const b=e.getBoundingClientRect();return b.left>W*0.7&&b.width>250&&b.height>250;})
      .sort((a,b)=>(a.innerText||'').length-(b.innerText||'').length)[0];
    return pane?(pane.innerText||'').replace(/\s+/g,' ').trim().slice(0,220):'NO-PANE';});
  // 3) open the guest's profile card
  const btn=page.locator("button[aria-label=\"Open QA Guest's profile\"]").first();
  out.profileBtn=await btn.count();
  if(out.profileBtn){
    await btn.click({timeout:6000}).catch(()=>{});
    await page.waitForTimeout(4000);
    out.profileCard=await page.evaluate(()=>{
      const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
      const d=[...document.querySelectorAll('[role="dialog"]')].filter(v)[0];
      return d?(d.innerText||'').replace(/\s+/g,' ').trim().slice(0,180):'NO-CARD';});
  }
  out.guestWordsOnScreen=await page.evaluate(()=>{
    const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
    return [...new Set([...document.querySelectorAll('*')].filter(v)
      .filter(e=>e.children.length===0)
      .map(e=>(e.innerText||'').replace(/\s+/g,' ').trim())
      .filter(t=>/\bguest\b|external/i.test(t) && t.length<40))].slice(0,6);});
  return out;
};
