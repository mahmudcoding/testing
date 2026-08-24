export default async ({page}) => {
  const before = await page.evaluate(()=>[...document.querySelectorAll('main button')].map(b=>({t:(b.getAttribute('aria-label')||b.textContent||'').trim().slice(0,30), role:b.getAttribute('role'), checked:b.getAttribute('aria-checked'), state:b.getAttribute('data-state')})));
  // find switches
  const sw = await page.$$('main button[role="switch"], main [role="switch"]');
  const out=[];
  for (const s of sw) { out.push({label: await s.getAttribute('aria-label'), checked: await s.getAttribute('aria-checked'), state: await s.getAttribute('data-state')}); }
  return {before, switches: out};
};
