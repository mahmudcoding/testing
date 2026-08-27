export default async ({page}) => {
  return await page.evaluate(() => {
    const asides = [...document.querySelectorAll('aside')].map((a,i)=>({
      i, testid: a.getAttribute('data-testid'),
      visible: a.offsetParent !== null,
      rect: (r=>({x:Math.round(r.x),w:Math.round(r.width),h:Math.round(r.height)}))(a.getBoundingClientRect()),
      text: a.innerText.replace(/\n+/g,' | ').slice(0,260)
    }));
    const chatIds = [...document.querySelectorAll('[data-testid*="chat" i],[data-testid*="thread" i],[data-testid*="ic-" i]')].map(e=>e.getAttribute('data-testid'));
    return {asides, chatRelatedTestids: [...new Set(chatIds)]};
  });
};
