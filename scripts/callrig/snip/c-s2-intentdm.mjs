export default async ({page}) => {
  const ws='W4QCF1XTURESO01';
  const out={};
  const look=async(url,label)=>{
    await page.goto(url); await page.waitForTimeout(6000);
    return page.evaluate((label)=>{
      const vis=(x)=>{const r=x.getBoundingClientRect();return r.width>4&&r.height>4;};
      const btns=[...document.querySelectorAll('main button')].filter(vis)
        .map(b=>b.getAttribute('aria-label')||(b.textContent||'').trim().slice(0,16));
      const counts={};
      for(const b of btns) counts[b]=(counts[b]||0)+1;
      const m=document.querySelector('main');
      return {label, head:(m?m.innerText:'').replace(/\s+/g,' ').slice(0,110),
        call:counts['Call']||0, message:counts['Message']||0};}, label);
  };
  out.plain=await look(`https://airion-cargo.store/w/${ws}/directories?tab=people`, 'plain');
  out.intentDm=await look(`https://airion-cargo.store/w/${ws}/directories?tab=people&intent=dm`, 'intent=dm');
  return out;
};
