export default async ({page}) => {
  const out={};
  await page.keyboard.press('Escape'); await page.waitForTimeout(500);
  await page.locator('button[aria-label="Participants"]').first().click();
  await page.waitForTimeout(2500);
  out.after = await page.evaluate(()=>{
    const panels=[...document.querySelectorAll('aside,[role="complementary"],[data-testid*="participants" i],section')].filter(e=>e.getClientRects().length && /participants/i.test(e.innerText||''));
    const p = panels[panels.length-1];
    return {
      panelFound: !!p,
      txt: p ? (p.innerText||'').replace(/\n+/g,' | ').slice(0,500) : null,
      btns: p ? [...p.querySelectorAll('button')].filter(b=>b.getClientRects().length).map(b=>({l:(b.getAttribute('aria-label')||b.textContent||'').replace(/\s+/g,' ').trim().slice(0,40), t:b.getAttribute('data-testid')})) : null,
      allAria: [...document.querySelectorAll('button')].filter(b=>b.getClientRects().length).map(b=>b.getAttribute('aria-label')).filter(l=>l&&/bob|action|more/i.test(l))
    };
  });
  return out;
};
