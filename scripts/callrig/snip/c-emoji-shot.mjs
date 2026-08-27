export default async ({page}) => {
  const inp = await page.$('input[aria-label="Search emoji"]');
  if (!inp) return {err:'picker not open'};
  const root = await page.evaluateHandle(() => document.querySelector('input[aria-label="Search emoji"]').parentElement);
  await root.asElement().screenshot({path:'/private/tmp/claude-501/-Users-mahmud-Projects-testing/ea7548f3-2f65-44bb-af90-5caa1d521e16/scratchpad/emoji-picker.png'});
  // also: what the user actually sees in the top 60px of the picker
  const top = await page.evaluate(() => {
    const r = document.querySelector('input[aria-label="Search emoji"]').parentElement.getBoundingClientRect();
    const seen = [];
    for (let y = r.y+45; y < r.y+140; y += 12) {
      for (let x = r.x+10; x < r.x+r.width-10; x += 30) {
        const el = document.elementFromPoint(x,y);
        if (el) seen.push(Math.round(y)+':'+ (el.tagName) + ':' + (el.textContent||'').trim().slice(0,14));
      }
    }
    return [...new Set(seen)].slice(0,40);
  });
  return {shot:'emoji-picker.png', topOfPicker: top};
};
