export default async ({ page }) => {
  return await page.evaluate(() => {
    const v = el => { const r=el.getBoundingClientRect(); return r.width>0&&r.height>0; };
    const admits = [...document.querySelectorAll('button')].filter(b=>/^Admit$/.test(b.textContent.trim()) && v(b));
    let hdr = null;
    if (admits[0]) { let n=admits[0], h=0; while(n&&h<7){ n=n.parentElement; h++;
      if (n && /WAITING/i.test(n.innerText)) { hdr = n.innerText.replace(/\n+/g,' | ').slice(0,220); break; } } }
    return { admitCount: admits.length, block: hdr };
  });
};
