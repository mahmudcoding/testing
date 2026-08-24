export default async ({page}) => {
  await page.goto('https://airion-cargo.store/w/W4QAF1XTURESO01/calls',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(3500);
  const found = {};
  // open the avatar / profile menu
  const av = page.locator('button[aria-label*="profile" i], button[aria-label*="Open menu" i], header button').first();
  const tries = await page.evaluate(()=>[...document.querySelectorAll('button')].map(b=>(b.getAttribute('aria-label')||'').slice(0,40)).filter(Boolean).slice(0,25));
  found.buttons = tries;
  const cand = await page.evaluate(()=>{
    const b=[...document.querySelectorAll('button')].find(x=>/QA Bob|avatar|profile|status|presence/i.test((x.getAttribute('aria-label')||'')+(x.textContent||'')));
    if(b) b.setAttribute('data-qa-av','1'); return b? (b.getAttribute('aria-label')||b.textContent||'').slice(0,40):null;
  });
  found.clicked = cand;
  if (cand) { await page.click('[data-qa-av="1"]'); await page.waitForTimeout(1800);
    found.menu = await page.evaluate(()=>[...document.querySelectorAll('[role="menu"],[data-radix-popper-content-wrapper],[role="dialog"]')].map(m=>m.innerText.replace(/\n+/g,' | ').slice(0,300)).slice(-2)); }
  found.dndSearch = await page.evaluate(()=>[...document.querySelectorAll('*')].filter(e=>e.children.length===0 && /do not disturb|не беспокоить|DND/i.test(e.textContent)).map(e=>e.textContent.trim().slice(0,60)).slice(0,5));
  return found;
};
