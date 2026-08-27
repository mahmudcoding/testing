export default async ({page}) => {
  const WS='W4QEF1XTURESO01';
  const probe = async (label) => {
    await page.goto(`https://airion-cargo.store/w/${WS}/calendar`, {waitUntil:'domcontentloaded'});
    await page.waitForTimeout(4500);
    await page.locator('main button').filter({hasText:/^Month$/}).first().click();
    await page.waitForTimeout(3500);
    // poll the button's enabled state for 10s
    const trace=[];
    for(let i=0;i<20;i++){
      await page.waitForTimeout(500);
      trace.push(await page.evaluate(()=>{
        const b=[...document.querySelectorAll('button')].find(x=>/\+\d+ more/.test(x.textContent));
        if(!b) return 'x';
        return b.disabled? 'D' : (b.getAttribute('aria-disabled')==='true'?'A':'e');
      }));
    }
    const info = await page.evaluate(()=>{
      const b=[...document.querySelectorAll('button')].find(x=>/\+\d+ more/.test(x.textContent));
      if(!b) return null;
      const r=b.getBoundingClientRect();
      return {text:b.textContent.trim(), disabled:b.disabled, ariaDisabled:b.getAttribute('aria-disabled'),
        ariaExpanded:b.getAttribute('aria-expanded'), ariaHaspopup:b.getAttribute('aria-haspopup'),
        dataState:b.getAttribute('data-state'), pointerEvents:getComputedStyle(b).pointerEvents,
        opacity:getComputedStyle(b).opacity, rect:{w:Math.round(r.width),h:Math.round(r.height),top:Math.round(r.top)},
        atCentre:(document.elementFromPoint(r.left+r.width/2, r.top+r.height/2)||{}).tagName};
    });
    // try a raw JS click (bypasses Playwright's enabled check)
    const after = await page.evaluate(()=>{
      const b=[...document.querySelectorAll('button')].find(x=>/\+\d+ more/.test(x.textContent));
      if(!b) return null; b.click();
      return null;
    });
    await page.waitForTimeout(2000);
    const popover = await page.evaluate(()=>{
      const p=document.querySelector('[role=dialog],[role=tooltip],[data-radix-popper-content-wrapper]');
      const b=[...document.querySelectorAll('button')].find(x=>/\+\d+ more/.test(x.textContent));
      return {popover:!!p, popTxt:p?p.innerText.replace(/\n+/g,' | ').slice(0,200):null,
        ariaExpandedNow:b?b.getAttribute('aria-expanded'):null, dataStateNow:b?b.getAttribute('data-state'):null};
    });
    return {label, trace:trace.join(''), info, popover};
  };
  return {run1: await probe('run1'), run2: await probe('run2')};
};
