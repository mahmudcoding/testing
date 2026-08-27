export default async ({page}) => page.evaluate(()=>{
  const vis=[...document.querySelectorAll('[role="status"],[role="alert"],[role="dialog"],[class*="toast"],[data-testid*="prompt"],[data-testid*="request"]')]
    .filter(e=>{const r=e.getBoundingClientRect();
      return e.innerText.trim() && !/sr-only/.test((e.className||'').toString()) && r.width>20 && r.height>10;})
    .map(e=>({tid:e.getAttribute('data-testid'), role:e.getAttribute('role'),
              txt:e.innerText.replace(/\n+/g,' | ').trim().slice(0,90)}));
  const camBtn=[...document.querySelectorAll('button')]
    .find(b=>/^Turn camera (on|off)$/.test(b.getAttribute('aria-label')||''));
  return {visible:vis.slice(0,4), camButton: camBtn?camBtn.getAttribute('aria-label'):null,
    bodyHasAsk:/turn on (your )?camera|asked you/i.test(document.body.innerText)};
});
