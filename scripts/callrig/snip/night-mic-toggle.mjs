export default async ({page}) => {
  const tb = await page.$('[data-testid="call-toolbar"]');
  const btns = await tb.$$('button');
  for (const b of btns) { const l=await b.getAttribute('aria-label')||''; if (/^(Mute|Unmute)$/i.test(l)) { await b.click(); await page.waitForTimeout(2500);
    const after = await page.evaluate(()=>{const t=document.querySelector('[data-testid="call-toolbar"]');const m=[...t.querySelectorAll('button')].find(x=>/mute|unmute/i.test(x.getAttribute('aria-label')||''));return {label:m.getAttribute('aria-label'),pressed:m.getAttribute('aria-pressed')};});
    return {was:l, now:after}; } }
  return {err:'no mic button'};
};
