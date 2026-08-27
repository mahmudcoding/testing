export default async ({ page }) => {
  const WHO = process.env.QA_WHO || 'QA Bob';
  const r = await page.evaluate((who)=>{
    const v = el => { const r=el.getBoundingClientRect(); return r.width>0&&r.height>0; };
    const rows=[...document.querySelectorAll('li,tr,div')].filter(e=>v(e) && (e.innerText||'').includes(who)
      && (e.innerText||'').length<200 && [...e.querySelectorAll('button')].some(b=>/^Call$/.test((b.innerText||'').trim())));
    const row=rows[rows.length-1]; if(!row) return {noRow:true};
    const cb=[...row.querySelectorAll('button')].filter(v).find(b=>/^Call$/.test((b.innerText||'').trim()));
    if(!cb) return {noBtn:true}; cb.click(); return {clicked:true, url:location.pathname};
  }, WHO);
  return r;
};
