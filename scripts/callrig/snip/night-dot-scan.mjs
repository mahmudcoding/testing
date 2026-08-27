export default async ({page}) => page.evaluate(()=>{
  const dots=[...document.querySelectorAll('[data-testid*="side-room"],[aria-label*="Side Room"],[aria-label*="side room"]')]
    .map(e=>({tid:e.getAttribute('data-testid'), al:e.getAttribute('aria-label'),
              vis:(()=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0;})()}));
  return {found:dots.slice(0,6), tileCount:document.querySelectorAll('[data-testid="participant-tile"]').length};
});
