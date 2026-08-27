const VS = `(el)=>{const r=el.getBoundingClientRect();if(r.width<1||r.height<1)return false;let n=el,op=1;while(n&&n!==document.documentElement){op*=parseFloat(getComputedStyle(n).opacity||'1');n=n.parentElement;}return op>0.05;}`;
export default async ({ page }) => {
  const out = await page.evaluate((vs)=>{const vis=eval(vs);
    const d=[...document.querySelectorAll('[role="dialog"]')].filter(vis)[0]||document.body;
    const b=[...d.querySelectorAll('button')].filter(vis).find(x=>/Custom RRULE/.test(x.innerText||''));
    if(!b) return {notFound:true};
    const attrs={}; for(const a of b.attributes) attrs[a.name]=a.value.slice(0,60);
    const describedBy=(b.getAttribute('aria-describedby')||'').split(/\s+/).filter(Boolean)
      .map(id=>{const e=document.getElementById(id); return e?(e.innerText||e.textContent||'').trim().slice(0,70):'(missing '+id+')';});
    const near=(b.closest('div')?.parentElement?.innerText||'').replace(/\s+/g,' ').slice(0,140);
    return { text:b.innerText.trim(), attrs, describedBy, near,
      title:b.getAttribute('title'), ariaLabel:b.getAttribute('aria-label'),
      // does the app explain other unavailable features nearby?
      dialogMentionsUnavailable:/not available yet|coming soon|unavailable/i.test(d.innerText||'') };},VS);
  // hover it to see if a tooltip appears
  const box = await page.evaluate((vs)=>{const vis=eval(vs);
    const d=[...document.querySelectorAll('[role="dialog"]')].filter(vis)[0];
    const b=[...d.querySelectorAll('button')].filter(vis).find(x=>/Custom RRULE/.test(x.innerText||''));
    if(!b) return null; const r=b.getBoundingClientRect(); return {x:Math.round(r.x+r.width/2),y:Math.round(r.y+r.height/2)};},VS);
  let tooltip=null;
  if(box){ await page.mouse.move(box.x,box.y); await page.waitForTimeout(2200);
    tooltip = await page.evaluate((vs)=>{const vis=eval(vs);
      return [...document.querySelectorAll('[role="tooltip"],[data-radix-popper-content-wrapper]')].filter(vis)
        .map(t=>(t.innerText||'').replace(/\s+/g,' ').trim().slice(0,80));},VS); }
  return { ...out, tooltipOnHover: tooltip };
};
