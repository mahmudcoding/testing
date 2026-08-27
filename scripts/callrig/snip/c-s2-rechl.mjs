// Recipient's view: is a real mention highlighted differently from a typed one?
export default async ({page}) => {
  const ws='W4QCF1XTURESO01', ch='C4QCGENERAL0001';
  if(!page.url().includes('/c/'+ch)){ await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`); await page.waitForTimeout(5000); }
  return page.evaluate(()=>{
    const res=[];
    for (const el of document.querySelectorAll('main [data-message-id]')) {
      const t=el.innerText||''; const m=t.match(/QA-S2-(MANUAL-\d|PICKED-\d)/); if(!m) continue;
      const cs=getComputedStyle(el);
      // walk up to 3 wrappers looking for a non-transparent background
      let bg=cs.backgroundColor, lvl=0, n=el;
      while(/rgba\(0, 0, 0, 0\)|transparent/.test(bg) && lvl<3 && n.parentElement){ n=n.parentElement; bg=getComputedStyle(n).backgroundColor; lvl++; }
      const chip=el.querySelector('button[data-mention-user-id]');
      const ccs=chip?getComputedStyle(chip):null;
      res.push({tag:m[1], rowBg:cs.backgroundColor, ancestorBg:bg, lvl,
        border:cs.borderLeft, cls:String(el.className||'').slice(0,60),
        chipColor:ccs&&ccs.color, chipBg:ccs&&ccs.backgroundColor, chipWeight:ccs&&ccs.fontWeight});
    }
    return res;
  });
};
