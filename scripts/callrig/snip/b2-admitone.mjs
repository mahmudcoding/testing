export default async ({ page }) => {
  const who = process.env.QA_ADMIT || 'QA Bob';
  const net = [];
  page.on('response', r => { if (/admit/.test(r.url())) net.push({st:r.status(), u:r.url().slice(-60)}); });
  const clicked = await page.evaluate((who) => {
    const v = el => { const r=el.getBoundingClientRect(); return r.width>0&&r.height>0; };
    const btns = [...document.querySelectorAll('button')].filter(b=>/^Admit$/.test(b.textContent.trim()) && v(b));
    for (const b of btns) {
      let n=b, h=0;
      while (n && h<5) { n=n.parentElement; h++;
        if (n && n.innerText.includes(who) && n.innerText.length < 90) { b.click(); return who; } }
    }
    return null;
  }, who);
  await page.waitForTimeout(5000);
  return { clicked, net, after: await page.evaluate(() => {
    const v = el => { const r=el.getBoundingClientRect(); return r.width>0&&r.height>0; };
    const admits=[...document.querySelectorAll('button')].filter(b=>/^Admit$/.test(b.textContent.trim()) && v(b));
    let hdr=null;
    if(admits[0]){let n=admits[0],h=0;while(n&&h<8){n=n.parentElement;h++;
      if(n&&/WAITING/i.test(n.innerText)){hdr=n.innerText.replace(/\n+/g,' | ').slice(0,240);break;}}}
    return { admitCount: admits.length, block: hdr,
             tiles: document.querySelectorAll('[data-testid*="participant-tile"],[class*="participant-tile"]').length };
  })};
};
