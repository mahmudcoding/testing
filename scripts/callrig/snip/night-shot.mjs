export default async ({page}) => {
  const p = process.env.QA_SHOT || '/private/tmp/claude-501/-Users-mahmud-Projects-testing/8ef88f77-45ad-41ea-8ff3-6792c93c559d/scratchpad/shot.png';
  await page.screenshot({path: p, fullPage: false});
  return {saved: p, url: page.url(), size: page.viewportSize()};
};
