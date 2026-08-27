export default async ({page}) => {
  const ws='W4QCF1XTURESO01', ch='C4OXDY9FPZM92FH';
  const read=async(label)=>{
    const r=await page.evaluate(async (ch)=>{
      const res=await fetch('/api/v1/notifications?limit=6',{credentials:'include'});
      let j=null; try{j=await res.json()}catch{}
      const a=(j&&(j.notifications||j.items))||[];
      const hit=(Array.isArray(a)?a:[]).find(n=>JSON.stringify(n).includes('QA-ARCHNOTIF'));
      return {status:res.status, found:!!hit,
        raw:hit?JSON.stringify(hit).slice(0,220):null};}, ch);
    return {label, ...r};
  };
  const out={beforeArchive:await read('before')};
  // bell UI label, before
  await page.goto(`https://airion-cargo.store/w/${ws}/c/C4QCGENERAL0001`);
  await page.waitForTimeout(10000);
  const bell=async()=>{
    await page.locator('button[aria-label*="otification"], button[aria-label*="Bell"]').first()
      .click({timeout:6000}).catch(()=>{});
    await page.waitForTimeout(3500);
    return page.evaluate(()=>{
      const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
      const items=[...document.querySelectorAll('button[aria-label]')].filter(v)
        .map(e=>e.getAttribute('aria-label')||'')
        .filter(t=>/QA-ARCHNOTIF|Unknown channel/i.test(t));
      return items.slice(0,3);});
  };
  out.bellBefore=await bell();
  await page.keyboard.press('Escape').catch(()=>{});
  await page.evaluate(async (ch)=>{await fetch(`/api/v1/channels/${ch}/archive`,
    {method:'POST',credentials:'include'});}, ch);
  await page.waitForTimeout(3000);
  await page.reload(); await page.waitForTimeout(10000);
  out.bellAfterArchive=await bell();
  out.afterArchive=await read('after');
  return out;
};
