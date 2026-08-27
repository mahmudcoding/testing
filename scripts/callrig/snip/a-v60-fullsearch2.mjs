const VS = `(el)=>{const r=el.getBoundingClientRect();if(r.width<1||r.height<1)return false;let n=el,op=1;while(n&&n!==document.documentElement){op*=parseFloat(getComputedStyle(n).opacity||'1');n=n.parentElement;}return op>0.05;}`;
export default async ({ page }) => {
  const out={};
  await page.goto('https://airion-cargo.store/w/W4QAF1XTURESO01/chat/mentions',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4200);
  out.startUrl = await page.evaluate(()=>location.pathname+location.search);
  const sb = page.locator('input[placeholder="Search QA Workspace"], button[aria-label="Search QA Workspace"]').first();
  await sb.click(); await page.waitForTimeout(1400);
  await page.keyboard.type('V60-COPY',{delay:45});
  await page.waitForTimeout(3200);
  const see = page.locator('button', { hasText: /^See all in Messages$/ }).first();
  const box = await see.boundingBox();
  out.seeAllBox = box;
  await see.click();
  const poll=[]; for(let i=0;i<10;i++){ poll.push({t:i*500, url:await page.evaluate(()=>location.pathname+location.search)}); await page.waitForTimeout(500); }
  out.urlPoll = [...new Set(poll.map(p=>p.url))];
  out.final = await page.evaluate((vs)=>{const vis=eval(vs);
    return { url:location.pathname+location.search,
      mainTxt:(document.querySelector('main')?.innerText||'').replace(/\s+/g,' ').slice(0,200),
      dialogOpen:[...document.querySelectorAll('[role="dialog"]')].filter(vis).length,
      searchResultCount:(document.body.innerText.match(/Showing \d+ results?[^\n]{0,40}/)||[''])[0] };},VS);
  return out;
};
