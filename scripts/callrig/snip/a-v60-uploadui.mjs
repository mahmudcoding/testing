const VS = `(el)=>{const r=el.getBoundingClientRect();if(r.width<1||r.height<1)return false;let n=el,op=1;while(n&&n!==document.documentElement){op*=parseFloat(getComputedStyle(n).opacity||'1');n=n.parentElement;}return op>0.05;}`;
export default async ({ page }) => {
  const out={};
  await page.locator('button', { hasText: /^Upload$/ }).first().click().catch(e=>out.err=String(e).slice(0,50));
  await page.waitForTimeout(2500);
  out.state = await page.evaluate((vs)=>{const vis=eval(vs);
    return { dialogs:[...document.querySelectorAll('[role="dialog"]')].filter(vis).map(d=>(d.innerText||'').replace(/\s+/g,' ').slice(0,200)),
      menus:[...document.querySelectorAll('[role="menu"],[role="menuitem"]')].filter(vis).map(d=>(d.innerText||'').replace(/\s+/g,' ').slice(0,80)),
      fileInputsAny:[...document.querySelectorAll('input[type=file]')].map(i=>({vis:vis(i),accept:i.accept,multiple:i.multiple})),
      toasts:[...document.querySelectorAll('[data-sonner-toast],[role="status"]')].filter(vis).map(t=>(t.innerText||'').trim().slice(0,60)).filter(Boolean) };},VS);
  await page.screenshot({path:'/private/tmp/claude-501/-Users-mahmud-Projects-testing/f92e5e8b-bcc2-441a-8a07-a9ff137b0db6/scratchpad/files-upload-click.png'});
  return out;
};
