export default async ({page}) => page.evaluate(()=>{
  const d=[...document.querySelectorAll('[role="dialog"],[data-radix-popper-content-wrapper]')].pop();
  if(!d) return {none:true};
  return {yesNo:[...d.querySelectorAll('button')]
      .filter(b=>/^(Yes|No)$/.test((b.textContent||'').trim()))
      .map(b=>({l:(b.textContent||'').trim(), pressed:b.getAttribute('aria-pressed'),
                sel:b.getAttribute('data-selected'), bg:getComputedStyle(b).backgroundColor})),
    hasUnavailable:/Participant list unavailable/.test(d.innerText||'')};
});
