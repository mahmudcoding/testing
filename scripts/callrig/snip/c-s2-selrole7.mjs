export default async ({page}) => {
  const ws='W4QCF1XTURESO01', ch='C4QCPRIVATE0001';
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`);
  await page.waitForTimeout(9000);
  await page.locator('button[aria-label="Channel details"]').first().click({timeout:6000});
  await page.waitForTimeout(2500);
  await page.locator('button', {hasText:/^Roles$/}).first().click({timeout:6000});
  await page.waitForTimeout(2500);
  const btn=page.locator('button[aria-label="Automatic role"]').first();
  await btn.focus();
  await page.keyboard.press('Enter'); await page.waitForTimeout(2000);
  await page.keyboard.press('Enter'); await page.waitForTimeout(3000);
  return page.evaluate(()=>{
    const b=document.querySelector('button[aria-label="Automatic role"]');
    const all=[...document.querySelectorAll('[role="listbox"],[role="menu"],[data-radix-popper-content-wrapper]')];
    const info=all.map(e=>{const r=e.getBoundingClientRect();
      let op=1,n=e,hidden=null;
      while(n&&n!==document.documentElement){const s=getComputedStyle(n);
        op*=parseFloat(s.opacity||'1');
        if(s.display==='none'||s.visibility==='hidden'){hidden=n.tagName.toLowerCase()+':'+s.display+'/'+s.visibility;op=0;break;}
        n=n.parentElement;}
      return {role:e.getAttribute('role')||'popper',
        rect:{w:Math.round(r.width),h:Math.round(r.height)},
        opacity:+op.toFixed(2), hiddenBy:hidden,
        children:e.children.length,
        options:e.querySelectorAll('[role="option"],[role="menuitem"]').length,
        text:(e.textContent||'').replace(/\s+/g,' ').trim().slice(0,120)};});
    return {expanded:b&&b.getAttribute('aria-expanded'), popupCount:all.length, popups:info};
  });
};
