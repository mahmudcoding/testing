export default async ({page}) => {
  const pat=process.env.QA_PAT||'nerd';
  return await page.evaluate((pat)=>{
    const all=[...document.querySelectorAll('[data-testid]')].map(e=>e.getAttribute('data-testid'));
    const hits=all.filter(t=>t.toLowerCase().includes(pat.toLowerCase()));
    return {hits, totalTestids: all.length,
      toolbar:[...document.querySelectorAll('[data-testid="call-toolbar"] button')].map(b=>b.getAttribute('aria-label'))};
  }, pat);
};
