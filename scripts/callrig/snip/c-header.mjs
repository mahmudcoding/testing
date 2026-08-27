export default async ({page}) => {
  const rows=[]; const t0=Date.now();
  while (Date.now()-t0 < 25000) {
    const s = await page.evaluate(()=>{
      const h=document.querySelector('header');
      const t=(h?h.innerText:'').replace(/\n+/g,' | ').slice(0,80);
      return {hdr:t, title:document.title};
    });
    rows.push({ms:Date.now()-t0, ...s});
    await page.waitForTimeout(1000);
  }
  const cond=[]; let prev='';
  for(const r of rows){const k=JSON.stringify([r.hdr,r.title]); if(k!==prev){cond.push(r);prev=k;}}
  return {changes:cond.slice(0,10), last:rows[rows.length-1]};
};
