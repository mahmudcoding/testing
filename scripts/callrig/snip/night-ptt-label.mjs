export default async ({page}) => {
  return await page.evaluate(()=>{
    const ms=[...document.querySelectorAll('[role="dialog"],[role="menu"]')];
    const m=ms[ms.length-1];
    const btns=[...m.querySelectorAll('button')];
    const sw=btns[btns.length-1];
    const id=sw.id;
    return {
      tag:sw.tagName.toLowerCase(), role:sw.getAttribute('role'),
      ariaLabel:sw.getAttribute('aria-label'), ariaLabelledby:sw.getAttribute('aria-labelledby'),
      ariaChecked:sw.getAttribute('aria-checked'), id,
      labelFor: id? (l=>l?l.innerText.trim().slice(0,40):null)(document.querySelector('label[for="'+CSS.escape(id)+'"]')) : null,
      wrappedInLabel: !!sw.closest('label'),
      wrapText: (l=>l?l.innerText.replace(/\n+/g,' | ').trim().slice(0,60):null)(sw.closest('label')),
      outer: sw.outerHTML.replace(/\s+/g,' ').slice(0,260)
    };
  });
};
