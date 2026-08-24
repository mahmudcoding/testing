export default async ({page}) => await page.evaluate(()=>{
  return [...document.querySelectorAll('button')].filter(b=>/Допуст|Впуст|Отклон|Admit|Deny/i.test((b.getAttribute('aria-label')||'')+(b.textContent||'')))
    .map(b=>({visibleText:(b.textContent||'').trim(), ariaLabel:b.getAttribute('aria-label'), testid:b.getAttribute('data-testid')}));
});
