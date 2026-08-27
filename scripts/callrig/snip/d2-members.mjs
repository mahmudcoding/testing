// Members table: one row per member with its Remove control's real state.
export default async ({page}) => {
  const WS='W4QDF1XTURESO01';
  await page.goto(`https://airion-cargo.store/w/${WS}/settings/admin/members`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(6000);
  const me = await page.evaluate(async()=>{const r=await fetch('/api/v1/auth/me',{credentials:'include'});const j=await r.json();return j.email;});
  const rows = await page.evaluate(()=>{
    const out=[];
    for (const tr of document.querySelectorAll('tbody tr, tr')) {
      const cells=[...tr.querySelectorAll('td')].map(td=>(td.innerText||'').replace(/\s+/g,' ').trim());
      if (!cells.length) continue;
      const b=[...tr.querySelectorAll('button')].map(x=>({
        lbl:((x.getAttribute('aria-label')||x.innerText)||'').replace(/\s+/g,' ').trim().slice(0,45),
        disabled: x.disabled===true || x.getAttribute('aria-disabled')==='true',
        title: x.getAttribute('title')||''}));
      out.push({who:cells[0].slice(0,40), role:(cells[1]||'').slice(0,40), btns:b});
    }
    return out;
  });
  return {me, rows};
};
