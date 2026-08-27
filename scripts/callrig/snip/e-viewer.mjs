export default async ({page}) => {
  const WS='W4QEF1XTURESO01';
  await page.goto(`https://airion-cargo.store/w/${WS}/files`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(3500);
  const out={};
  // open the image
  await page.locator('main').getByText('qa-e-image.png').first().click();
  await page.waitForTimeout(2800);
  out.viewer = await page.evaluate(()=>{
    const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0;};
    const d=document.querySelector('[role=dialog]');
    if(!d) return {opened:false, main:document.querySelector('main').innerText.replace(/\n{2,}/g,' | ').slice(0,300)};
    const img=d.querySelector('img');
    return {opened:true, txt:d.innerText.replace(/\n{2,}/g,' | ').slice(0,500),
      btns:[...d.querySelectorAll('button,a')].filter(vis).map(b=>(b.getAttribute('aria-label')||b.innerText).trim()).filter(Boolean).slice(0,20),
      img: img? {nw:img.naturalWidth, nh:img.naturalHeight, w:Math.round(img.getBoundingClientRect().width), h:Math.round(img.getBoundingClientRect().height), src:(img.src||'').slice(-45)}:null};
  });
  return out;
};
