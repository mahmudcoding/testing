export default async ({page}) => {
  const want=process.env.QA_ITEM;
  const menus=await page.$$('[role="menu"],[data-radix-popper-content-wrapper]');
  const m=menus[menus.length-1]; if(!m) return {err:'no menu'};
  let clicked=null;
  for(const e of await m.$$('[role="menuitem"],button')){
    const t=(((await e.getAttribute('aria-label'))||(await e.textContent())||'')).trim();
    if(t===want){ await e.click(); clicked=t; break; } }
  await page.waitForTimeout(3000);
  const conf=await page.evaluate(()=>{const d=[...document.querySelectorAll('[role="dialog"],[role="alertdialog"]')].pop();
    return d?{text:d.innerText.replace(/\n+/g,' | ').slice(0,150),
      buttons:[...d.querySelectorAll('button')].map(b=>((b.getAttribute('aria-label')||b.textContent||'').trim()).slice(0,22))}:null;});
  return {clicked, confirm:conf};
};
