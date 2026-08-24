export default async ({page}) => await page.evaluate(()=>{
  const dlgOpen = !!document.querySelector('[data-testid="calls-start-submit"]');
  const inp = document.querySelector('#calls-hub-call-name');
  return {
    dialogStillOpen: dlgOpen,
    inputLen: inp? inp.value.length : null,
    ariaInvalid: inp? inp.getAttribute('aria-invalid') : null,
    describedby: inp? inp.getAttribute('aria-describedby') : null,
    errorTexts: [...document.querySelectorAll('[role="alert"],[aria-live],[class*="error" i],[class*="danger" i]')].map(e=>e.innerText.trim().slice(0,120)).filter(Boolean).slice(0,6),
    toasts: [...document.querySelectorAll('[role="status"],[role="alert"]')].map(e=>e.innerText.trim().replace(/\n+/g,' ')).filter(Boolean).slice(0,5),
    submitDisabled: (()=>{const b=document.querySelector('[data-testid="calls-start-submit"]'); return b? b.disabled : null;})(),
    dialogText: (()=>{const d=[...document.querySelectorAll('[role="dialog"]')].pop(); return d? d.innerText.replace(/\n+/g,' | ').slice(0,300):null;})()
  };
});
