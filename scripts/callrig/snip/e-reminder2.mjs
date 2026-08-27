export default async ({page}) => {
  const pos = await page.evaluate(()=>{
    const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0;};
    const d=document.querySelector('[role=dialog]'); if(!d) return null;
    const b=[...d.querySelectorAll('button')].filter(vis).find(x=>/reminder/i.test(x.innerText));
    if(!b) return {noBtn:true, btns:[...d.querySelectorAll('button')].filter(vis).map(x=>x.innerText.replace(/\n/g,' ').trim().slice(0,20)).slice(-8)};
    const r=b.getBoundingClientRect();
    return {x:r.left+r.width/2, y:r.top+r.height/2, txt:b.innerText.trim(), disabled:b.disabled,
      exp:b.getAttribute('aria-expanded'), pop:b.getAttribute('aria-haspopup')};
  });
  if(!pos || pos.noBtn) return {pos};
  await page.mouse.click(pos.x, pos.y);
  const trace=[];
  for(let i=0;i<8;i++){ await page.waitForTimeout(500);
    trace.push(await page.evaluate(()=>{
      const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0;};
      const b=[...document.querySelectorAll('[role=dialog] button')].filter(vis).find(x=>/reminder/i.test(x.innerText));
      const opts=[...document.querySelectorAll('[role=menuitem],[role=option]')].filter(vis).length;
      return {exp:b?b.getAttribute('aria-expanded'):null, opts};
    }));
  }
  const opts = await page.evaluate(()=>{
    const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0;};
    return [...document.querySelectorAll('[role=menuitem],[role=option]')].filter(vis).map(o=>o.innerText.trim().slice(0,22));
  });
  return {pos, expTrace:trace.map(t=>t.exp).join(','), optTrace:trace.map(t=>t.opts).join(','), options:opts};
};
