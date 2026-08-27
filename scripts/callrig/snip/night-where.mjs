export default async ({page}) => page.evaluate(()=>{
  const m=document.querySelector('main');
  const body=document.body.innerText.replace(/\n+/g,' | ').slice(0,220);
  return {url:location.pathname+location.search,
    mainExists:!!m, mainText:(m?m.innerText:'').replace(/\n+/g,' | ').slice(0,160),
    mainRect:(()=>{if(!m)return null;const r=m.getBoundingClientRect();return [Math.round(r.width),Math.round(r.height)];})(),
    bodyText:body,
    dialogs:[...document.querySelectorAll('[role="dialog"],[role="alertdialog"]')]
      .map(e=>e.innerText.replace(/\n+/g,' | ').slice(0,80)).slice(0,2)};
});
