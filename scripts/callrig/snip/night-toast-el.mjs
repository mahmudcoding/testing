export default async ({page}) => {
  return await page.evaluate(()=>{
    const els=[...document.querySelectorAll('[role="status"],[role="alert"],[aria-live]')].map(e=>({
      role:e.getAttribute('role'), live:e.getAttribute('aria-live'), atomic:e.getAttribute('aria-atomic'),
      testid:e.getAttribute('data-testid'),
      txt:(e.innerText||'').replace(/\n+/g,' | ').slice(0,80),
      visible:(r=>r.width>0&&r.height>0)(e.getBoundingClientRect())
    }));
    return {elements: els};
  });
};
