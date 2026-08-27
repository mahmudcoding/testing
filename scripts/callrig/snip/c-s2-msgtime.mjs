export default async ({page}) => page.evaluate(()=>{
  const out={};
  const msgs=[...document.querySelectorAll('main [data-message-id]')].slice(-4);
  out.samples=msgs.map(el=>{
    const times=[...el.querySelectorAll('time,[datetime],[title]')].map(t=>({
      tag:t.tagName, dt:t.getAttribute('datetime'), title:t.getAttribute('title'),
      txt:(t.textContent||'').trim().slice(0,26)}));
    const leaves=[...el.querySelectorAll('*')].filter(e=>e.children.length===0)
      .map(e=>(e.textContent||'').trim()).filter(t=>/\d{1,2}:\d{2}/.test(t)).slice(0,3);
    return {times, leaves, head:(el.innerText||'').replace(/\s+/g,' ').slice(0,44)};
  });
  // date separators in the feed
  out.separators=[...document.querySelectorAll('main *')].filter(e=>e.children.length===0)
    .map(e=>(e.textContent||'').trim())
    .filter(t=>/^(Today|Yesterday|\w+ \d{1,2}|\d{1,2} \w+)/.test(t)&&t.length<24).slice(0,5);
  return out;
});
