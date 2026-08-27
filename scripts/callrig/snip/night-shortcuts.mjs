export default async ({page}) => page.evaluate(()=>{
  const withTitle=[...document.querySelectorAll('button,[role="button"],[title]')]
    .map(e=>({l:(e.getAttribute('aria-label')||e.textContent||'').trim().slice(0,26),
              title:e.getAttribute('title')}))
    .filter(x=>x.title && /[⌘⌥⇧^]|Ctrl|Alt|Shift/i.test(x.title));
  const body=document.body.innerText;
  return {withShortcut: withTitle.slice(0,20),
          mentionsShortcuts: /shortcut/i.test(body)};
});
