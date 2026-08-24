export default async ({page}) => await page.evaluate(()=>({
  dialogs: [...document.querySelectorAll('[role="dialog"],[role="alertdialog"]')].map(d=>`${d.getAttribute('data-testid')||'-'} :: ${d.innerText.replace(/\n+/g,' | ').slice(0,220)}`),
  toasts: [...document.querySelectorAll('[role="status"],[role="alert"]')].map(e=>e.innerText.trim().replace(/\n+/g,' ')).filter(Boolean).slice(0,8),
  askEls: [...document.querySelectorAll('*')].filter(e=>e.children.length===0 && /unmute|включить микрофон|asks you|просит/i.test(e.textContent||'')).map(e=>e.textContent.trim().slice(0,80)).slice(0,6),
  micBtn: (()=>{const b=[...document.querySelectorAll('button')].find(x=>/^(Mute|Unmute)$/.test(x.getAttribute('aria-label')||'')); return b?{l:b.getAttribute('aria-label'),d:b.disabled}:null;})()
}));
