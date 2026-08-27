const VS = `(el)=>{const r=el.getBoundingClientRect();if(r.width<1||r.height<1)return false;let n=el,op=1;while(n&&n!==document.documentElement){op*=parseFloat(getComputedStyle(n).opacity||'1');n=n.parentElement;}return op>0.05;}`;
export default async ({ page }) => {
  const out={};
  const i=await page.$('input[placeholder="Ada Lovelace"]');
  await i.click(); await page.keyboard.type('V60 Guest',{delay:35});
  await page.waitForTimeout(700);
  await page.locator('button',{hasText:/^Ask to join$/}).first().click();
  await page.waitForTimeout(6000);
  await page.screenshot({path:'/private/tmp/claude-501/-Users-mahmud-Projects-testing/f92e5e8b-bcc2-441a-8a07-a9ff137b0db6/scratchpad/guest-lobby.png'});
  out.afterAsk = await page.evaluate((vs)=>{const vis=eval(vs);
    return { url:location.pathname.slice(0,40),
      txt:(document.querySelector('main')?.innerText||document.body.innerText||'').replace(/\s+/g,' ').slice(0,300),
      btns:[...document.querySelectorAll('button')].filter(vis).map(b=>(b.getAttribute('aria-label')||b.innerText||'').trim().replace(/\s+/g,' ').slice(0,26)).filter(Boolean).slice(0,12) };},VS);
  return out;
};
