export default async ({page}) => await page.evaluate(()=>({url:location.href, text:(document.body.innerText||'').replace(/\n+/g,' | ').slice(0,400)}));
