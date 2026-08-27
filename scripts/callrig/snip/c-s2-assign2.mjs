export default async ({page}) => {
  const ws='W4QCF1XTURESO01', ch='C4OXCK0OB50583Z';
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`);
  await page.waitForTimeout(10000);
  await page.locator('button[aria-label="Channel details"]').first().click({timeout:6000});
  await page.waitForTimeout(3000);
  await page.locator('button[aria-selected]').filter({hasText:/^Roles/}).first().click({timeout:6000});
  await page.waitForTimeout(5000);
  const out={};
  out.assignControls=await page.evaluate(()=>{
    const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
    const W=innerWidth;
    return [...document.querySelectorAll('button')].filter(v)
      .filter(e=>e.getBoundingClientRect().left>W*0.72)
      .map(e=>`${(e.getAttribute('aria-label')||e.innerText||'(unnamed)').replace(/\s+/g,' ').trim().slice(0,26)}|exp=${e.getAttribute('aria-expanded')}`)
      .filter(t=>/Member|Role|Assign/i.test(t));});
  const open=async(label)=>{
    const b=page.locator(`button[aria-label="${label}"]`).first();
    if(!await b.count()) return {label, present:false};
    for(let i=0;i<3;i++){ await b.click({timeout:6000}).catch(()=>{}); await page.waitForTimeout(2200);
      const s=await page.evaluate(()=>{
        const lb=[...document.querySelectorAll('[role="listbox"],[role="menu"]')][0];
        const r=lb?lb.getBoundingClientRect():null;
        return {size:r?`${Math.round(r.width)}x${Math.round(r.height)}`:null,
          opts:lb?[...lb.querySelectorAll('[role="option"],[role="menuitem"]')]
            .map(o=>(o.innerText||'').replace(/\s+/g,' ').trim().slice(0,24)):null};});
      if(s.opts&&s.opts.length) return {label, present:true, clicks:i+1, ...s};
    }
    return {label, present:true, opened:false};
  };
  out.memberPicker=await open('Member');
  await page.keyboard.press('Escape').catch(()=>{});
  await page.waitForTimeout(1200);
  out.rolePicker=await open('Role');
  return out;
};
