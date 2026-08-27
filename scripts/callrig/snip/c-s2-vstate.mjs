export default async ({page}) => page.evaluate(()=>{
  const notices=[...document.querySelectorAll('[role="status"],[role="alert"],[class*="toast"]')]
    .filter(e=>{const r=e.getBoundingClientRect();return r.width>4&&r.height>4;})
    .map(e=>e.textContent.trim().slice(0,90));
  const comp=document.querySelector('div[contenteditable="true"][aria-label="Compose message"]');
  const last=[...document.querySelectorAll('main [data-message-id]')].slice(-3)
    .map(e=>(e.innerText||'').replace(/\s+/g,' ').slice(0,60));
  const anyVideoText=[...document.querySelectorAll('*')].filter(e=>e.children.length===0
    && /qa-s2-clip|QA-S2-VIDEO/.test(e.textContent||'')).map(e=>e.textContent.trim().slice(0,50));
  return {notices, composer: comp? comp.innerText.slice(0,60):'none', last, anyVideoText:anyVideoText.slice(0,6)};
});
