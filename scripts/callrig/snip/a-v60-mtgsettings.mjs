const VS = `(el)=>{const r=el.getBoundingClientRect();if(r.width<1||r.height<1)return false;let n=el,op=1;while(n&&n!==document.documentElement){op*=parseFloat(getComputedStyle(n).opacity||'1');n=n.parentElement;}return op>0.05;}`;
export default async ({ page }) => {
  const out={};
  await page.locator('button[aria-label="Meeting settings"]').first().click().catch(e=>out.err=String(e).slice(0,50));
  await page.waitForTimeout(3000);
  await page.screenshot({path:'/private/tmp/claude-501/-Users-mahmud-Projects-testing/f92e5e8b-bcc2-441a-8a07-a9ff137b0db6/scratchpad/mtg-settings.png'});
  out.panel = await page.evaluate((vs)=>{const vis=eval(vs);
    const d=[...document.querySelectorAll('[role="dialog"],aside')].filter(vis).pop()||document.body;
    return { txt:(d.innerText||'').replace(/\s+/g,' ').slice(0,500),
      switches:[...d.querySelectorAll('[role="switch"]')].filter(vis).map(s=>({n:(s.closest('div')?.parentElement?.innerText||'').replace(/\s+/g,' ').slice(0,44),on:s.getAttribute('aria-checked')})),
      btns:[...d.querySelectorAll('button')].filter(vis).map(b=>(b.getAttribute('aria-label')||b.innerText||'').trim().replace(/\s+/g,' ').slice(0,26)).filter(Boolean).slice(0,16),
      inputs:[...d.querySelectorAll('input')].filter(vis).map(i=>({ph:(i.placeholder||'').slice(0,24),val:(i.value||'').slice(0,70)})) };},VS);
  return out;
};
