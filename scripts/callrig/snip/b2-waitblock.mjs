export default async ({ page }) => {
  return await page.evaluate(() => {
    const vis = el => { const r = el.getBoundingClientRect();
      if (r.width===0||r.height===0) return false;
      let n=el,o=1; while(n&&n!==document.documentElement){o*=parseFloat(getComputedStyle(n).opacity||'1');n=n.parentElement;}
      return o>0.05 && document.elementFromPoint(r.left+r.width/2, r.top+r.height/2) !== null; };
    const admit = Array.from(document.querySelectorAll('button')).filter(b => /^Admit$/.test(b.textContent.trim()));
    return admit.map(b => {
      let n = b, hops = 0;
      while (n && hops < 6 && !/waiting|approval|wants to join/i.test(n.textContent)) { n = n.parentElement; hops++; }
      const row = b.closest('li,[class*="row"],[class*="item"]') || b.parentElement;
      return { visible: vis(b), rect: (r=>({x:Math.round(r.x),y:Math.round(r.y),w:Math.round(r.width)}))(b.getBoundingClientRect()),
               rowText: row ? row.innerText.replace(/\n+/g,' | ').slice(0,140) : '',
               contextText: n ? n.innerText.replace(/\n+/g,' | ').slice(0,220) : '(no waiting context)' };
    });
  });
};
