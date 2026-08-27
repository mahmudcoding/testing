export default async ({page}) => page.evaluate(()=>{
  const d=[...document.querySelectorAll('[role="dialog"]')].pop();
  if(!d) return {none:true};
  return {inputs:[...d.querySelectorAll('input,select,textarea')].map(e=>({
      type:e.type||e.tagName.toLowerCase(), name:e.name||e.getAttribute('aria-label')||e.placeholder||'',
      value:(e.value||'').slice(0,26)})).slice(0,12),
    durationBtns:[...d.querySelectorAll('button')]
      .filter(b=>/^(15 min|30 min|45 min|1 hr|1\.5 hr|2 hr)$/.test((b.textContent||'').trim()))
      .map(b=>({l:(b.textContent||'').trim(), pressed:b.getAttribute('aria-pressed'),
                sel:b.getAttribute('data-selected'), bg:getComputedStyle(b).backgroundColor})),
    text:d.innerText.replace(/\n+/g,' | ').slice(0,300)};
});
