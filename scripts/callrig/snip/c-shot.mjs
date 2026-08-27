export default async ({page, pages}) => {
  const p = process.env.QA_SHOT || 'shot';
  await page.screenshot({path:`/private/tmp/claude-501/-Users-mahmud-Projects-testing/ea7548f3-2f65-44bb-af90-5caa1d521e16/scratchpad/${p}.png`, fullPage:false});
  return {url: page.url(), pages: pages.map(x=>x.url()), title: await page.title()};
};
