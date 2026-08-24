export default async ({page}) => await page.evaluate(()=>{
  const hits=[...document.querySelectorAll('*')].filter(e=>e.children.length===0 && /onerror|<img|<b>/i.test(e.textContent||''))
    .map(e=>({tag:e.tagName, tid:e.getAttribute('data-testid')||'-', text:(e.textContent||'').slice(0,90)}));
  return {
    literalTextNodes: hits.slice(0,5),
    imgTags: [...document.querySelectorAll('img[src="x"]')].length,
    boldTags: [...document.querySelectorAll('b')].map(b=>b.textContent.slice(0,20)).slice(0,5),
    xssMarker: !!window.__XSS_FIRED,
    topBar: (document.querySelector('[data-testid="call-top-bar"]')||{innerText:''}).innerText.replace(/\n+/g,' | ').slice(0,150)
  };
});
