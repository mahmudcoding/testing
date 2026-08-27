export default async ({page}) => {
  return await page.evaluate(() => {
    const d = document.querySelector('[role=dialog]');
    if (!d) return {none:true, url:location.href};
    const labels = [...d.querySelectorAll('label')].filter(l=>l.offsetParent).map(l=>l.innerText.trim().replace(/\s+/g,' ').slice(0,80));
    return {
      text: d.innerText.replace(/\n{2,}/g,'\n').slice(0,900),
      buttons: [...d.querySelectorAll('button')].filter(b=>b.offsetParent).map(b=>(b.innerText||b.getAttribute('aria-label')||'').trim().replace(/\s+/g,' ')).slice(0,25),
      labels: labels.slice(0,20)
    };
  });
};
