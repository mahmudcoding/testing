export default async ({page}) => {
  const st=()=>page.evaluate(()=>{
    const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
    const b=document.querySelector('button[aria-label="Automatic role"]');
    const lb=[...document.querySelectorAll('[role="listbox"],[role="menu"]')][0];
    const r=lb?lb.getBoundingClientRect():null;
    return {exp:b&&b.getAttribute('aria-expanded'),
      size:r?`${Math.round(r.width)}x${Math.round(r.height)}`:null,
      opts:lb?[...lb.querySelectorAll('[role="option"],[role="menuitem"]')]
        .map(o=>(o.innerText||'').replace(/\s+/g,' ').trim().slice(0,26)):null};});
  const btn=page.locator('button[aria-label="Automatic role"]').first();
  const seq=[];
  for (let i=1;i<=4;i++){
    await btn.click({timeout:6000}).catch(()=>{});
    await page.waitForTimeout(2500);
    seq.push({click:i, ...(await st())});
    if(seq[seq.length-1].opts && seq[seq.length-1].opts.length) break;
  }
  return {sequence:seq};
};
