export default async ({page}) => page.evaluate(()=>{
  const mic=[...document.querySelectorAll('button')]
    .find(b=>/^(Mute|Unmute)$/.test(b.getAttribute('aria-label')||''));
  const tb=document.querySelector('[data-testid="call-toolbar"]');
  return {mic: mic?{aria:mic.getAttribute('aria-label'), title:mic.getAttribute('title'),
      disabled:mic.disabled, tid:mic.getAttribute('data-testid'),
      ariaDesc:mic.getAttribute('aria-describedby')}:null,
    toolbarLabels: tb?[...tb.querySelectorAll('button')].map(b=>(b.getAttribute('aria-label')||'').slice(0,24)):[],
    bodyMentions:(document.body.innerText.match(/[^\n]*(blocked|Blocked|not allowed|disabled by|host has|muted by)[^\n]*/i)||[''])[0].trim().slice(0,80)};
});
