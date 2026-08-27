export default async ({page}) => {
  const ws='W4QCF1XTURESO01', ch='C4OX0TTLIMVOUBH';
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`);
  await page.waitForTimeout(10000);
  const t0=Date.now(); const seen=[];
  while(Date.now()-t0 < 60000){
    const s=await page.evaluate(()=>{
      const regions=[...document.querySelectorAll('[aria-live]')];
      return regions.map(r=>(r.textContent||'').trim()).filter(Boolean);});
    for(const x of s) if(!seen.includes(x)) seen.push(x);
    if(seen.some(x=>/QA-V2-LIVE|QA\\-V2\\-LIVE/.test(x))) break;
    await page.waitForTimeout(250);
  }
  const hit=seen.find(x=>/V2-LIVE/.test(x)||/V2\\-LIVE/.test(x));
  return {announcements:seen.slice(-4), matched:hit||null,
    escapedInAnnouncement: hit? /\\-/.test(hit) : null};
};
