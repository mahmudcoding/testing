export default async ({page}) => {
  const el = await page.$('[data-testid="guest-links-created-url"]');
  if(!el) return {err:'no link element'};
  const val = await el.evaluate(e=>e.value||e.textContent||'');
  return {link: val.trim()};
};
