export default async ({page}) => await page.evaluate(()=>({
  toasts: [...document.querySelectorAll('[role="status"],[role="alert"]')].map(e=>e.innerText.trim().replace(/\n+/g,' ')).filter(Boolean).slice(0,8),
  dialogs: [...document.querySelectorAll('[role="dialog"],[role="alertdialog"]')].map(d=>`${d.getAttribute('data-testid')||'-'}::${d.innerText.replace(/\n+/g,' | ').slice(0,180)}`),
  anyDeviceMsg: [...document.querySelectorAll('*')].filter(e=>e.children.length===0 && /another device|другом устройстве|disconnect|отключ/i.test(e.textContent||'')).map(e=>e.textContent.trim().slice(0,90)).slice(0,4)
}));
