export default async ({page}) => {
  const out=[];
  for (const w of [0, 3000, 8000, 15000]) {
    if (w) await page.waitForTimeout(w===3000?3000:(w===8000?5000:7000));
    out.push(await page.evaluate((w)=>{
      const m=document.querySelector('main');
      const col=document.querySelector('[data-testid="app-shell-main-column"]');
      return {at:w+'ms', url: location.href,
        mainExists: !!m, mainText: m?m.innerText.trim().slice(0,80):null,
        mainRect: m?(r=>({w:Math.round(r.width),h:Math.round(r.height)}))(m.getBoundingClientRect()):null,
        colText: col?col.innerText.replace(/\n+/g,' | ').trim().slice(0,120):null,
        pip: !!document.querySelector('[data-testid="draggable-pip"]')};
    }, w));
  }
  return out;
};
