const VS = `(el)=>{const r=el.getBoundingClientRect();if(r.width<1||r.height<1)return false;let n=el,op=1;while(n&&n!==document.documentElement){op*=parseFloat(getComputedStyle(n).opacity||'1');n=n.parentElement;}return op>0.05;}`;
export default async ({ page }) => {
  const out={};
  await page.keyboard.press('Escape').catch(()=>{});
  await page.waitForTimeout(1000);
  const g = page.locator('button[aria-label="Grid view"]').first();
  out.gridBtn = await g.count()>0;
  if(out.gridBtn){ await g.click(); await page.waitForTimeout(4500); }
  const read = () => page.evaluate((vs)=>{const vis=eval(vs);
    const names=[...document.body.querySelectorAll('*')].filter(e=>vis(e)&&e.children.length===0&&/^(QA (Alice|Bob|Carol|Dave|Owner|Admin)|Visitor \d+)/.test((e.innerText||'').trim()))
      .map(e=>e.innerText.trim().slice(0,20));
    return { tiles:[...new Set(names)],
      tileCount:[...new Set(names)].length,
      capText:[...document.body.querySelectorAll('*')].filter(e=>vis(e)&&e.children.length===0&&/show more|showing|hidden|\+\d+|more$|of \d+/i.test(e.innerText||''))
        .map(e=>e.innerText.replace(/\s+/g,' ').trim().slice(0,44)).slice(0,6),
      capBtns:[...document.querySelectorAll('button')].filter(vis).map(b=>(b.getAttribute('aria-label')||b.innerText||'').trim().slice(0,28)).filter(a=>/show more|more|cap|page/i.test(a)).slice(0,6),
      videoEls:document.querySelectorAll('video').length };},VS);
  out.grid = await read();
  await page.screenshot({path:'/private/tmp/claude-501/-Users-mahmud-Projects-testing/f92e5e8b-bcc2-441a-8a07-a9ff137b0db6/scratchpad/grid9.png'});
  return out;
};
