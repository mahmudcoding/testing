export default async ({page}) => {
  return await page.evaluate(()=>{
    const a=window.__ann||[];
    const last=[...document.querySelectorAll('[data-message-id]')].pop();
    return {count:a.length, all:a.slice(0,14).map(x=>({text:x.text, sr:x.sr, w:x.w, h:x.h})),
      renderedLastMessage: last? last.innerText.replace(/\n+/g,' | ').slice(0,90):null};
  });
};
