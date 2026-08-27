// How does a user start a DM? Enumerate the paths the UI offers.
export default async ({page}) => {
  const ws='W4QCF1XTURESO01';
  const out={};
  await page.goto(`https://airion-cargo.store/w/${ws}/directories?tab=people`);
  await page.waitForTimeout(5000);
  out.page = await page.evaluate(()=>{
    const m=document.querySelector('main');
    return {txt:(m?m.innerText:'').replace(/\s+/g,' ').slice(0,260),
      buttons:[...document.querySelectorAll('main button')].filter(b=>b.getBoundingClientRect().height>0)
        .map(b=>b.getAttribute('aria-label')||b.textContent.trim().slice(0,20)).slice(0,24)};
  });
  // sidebar: is there a "new message" / plus control?
  out.sidebar = await page.evaluate(()=>[...document.querySelectorAll('nav button, aside button')]
    .filter(b=>b.getBoundingClientRect().height>0)
    .map(b=>b.getAttribute('aria-label')||b.textContent.trim().slice(0,22)).filter(Boolean).slice(0,24));
  return out;
};
