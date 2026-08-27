export default async ({ page }) => {
  const count = async () => page.evaluate(() =>
    [...document.querySelectorAll('button')].filter(b=>/^Admit$/.test(b.textContent.trim())
      && b.getBoundingClientRect().width>0).length);
  for (let i = 0; i < 3; i++) {
    if (await count() > 0) break;
    await page.evaluate(() => { const b = document.querySelector('[data-testid="call-controls-people-toggle"]'); if (b) b.click(); });
    await page.waitForTimeout(1600);
  }
  return await page.evaluate(() => {
    const v = el => { const r=el.getBoundingClientRect(); return r.width>0&&r.height>0; };
    const admits = [...document.querySelectorAll('button')].filter(b=>/^Admit$/.test(b.textContent.trim()) && v(b));
    let hdr=null;
    if (admits[0]) { let n=admits[0],h=0; while(n&&h<8){ n=n.parentElement; h++;
      if (n && /WAITING/i.test(n.innerText)) { hdr=n.innerText.replace(/\n+/g,' | ').slice(0,260); break; } } }
    return { admitCount: admits.length, block: hdr };
  });
};
