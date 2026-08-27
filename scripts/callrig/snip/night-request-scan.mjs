export default async ({page}) => page.evaluate(()=>{
  const tb=document.querySelector('[data-testid="call-toolbar"]');
  const all=[...document.querySelectorAll('button')].map(b=>({
    l:(b.getAttribute('aria-label')||b.textContent||'').trim().slice(0,30), d:b.disabled}));
  return {toolbar: tb?[...tb.querySelectorAll('button')].map(b=>({l:(b.getAttribute('aria-label')||'').slice(0,26), d:b.disabled})):[],
    requestButtons: all.filter(x=>/request|ask|raise/i.test(x.l)),
    micRelated: all.filter(x=>/mic|unmute|mute|audio|speak/i.test(x.l))};
});
