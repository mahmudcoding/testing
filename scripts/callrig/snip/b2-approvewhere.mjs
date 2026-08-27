export default async ({ page }) => {
  return await page.evaluate(() => {
    const b = [...document.querySelectorAll('button')]
      .find(x=>/^Approve Microphone/i.test(x.getAttribute('aria-label')||''));
    if (!b) return 'NOT-FOUND';
    const r = b.getBoundingClientRect();
    let n = b, ctx = null, h = 0;
    while (n && h < 6) { n = n.parentElement; h++;
      if (n && (n.innerText||'').trim().length > 20) { ctx = n.innerText.replace(/\n+/g,' | ').slice(0,200); break; } }
    return { visible: r.width>0 && r.height>0, rect:{x:Math.round(r.x),y:Math.round(r.y)},
             siblings: [...b.parentElement.children].map(c=>({tag:c.tagName,
               al:c.getAttribute('aria-label'), t:(c.innerText||'').trim().slice(0,20)})),
             context: ctx };
  });
};
