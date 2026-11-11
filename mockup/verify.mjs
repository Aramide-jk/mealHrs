import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, extname, join, resolve } from 'node:path';

const root = resolve(import.meta.dirname);
const slices = ['discovery', 'commerce', 'account'];
const htmlFiles = slices.flatMap((slice) => {
  const dir = join(root, slice);
  return existsSync(dir) ? readdirSync(dir).filter((file) => extname(file) === '.html').map((file) => join(dir, file)) : [];
});
const errors = [];

for (const file of htmlFiles) {
  const source = readFileSync(file, 'utf8');
  const hasDirectBase = source.includes('../shared/base.css');
  const linkedStyles = [...source.matchAll(/href="([^"]+\.css)"/g)].map((match) => resolve(dirname(file), match[1]));
  const hasImportedBase = linkedStyles.some((css) => existsSync(css) && readFileSync(css, 'utf8').includes('../shared/base.css'));
  if (!hasDirectBase && !hasImportedBase) errors.push(`${file}: missing shared/base.css`);
  if (!source.includes('../shared/shared.js')) errors.push(`${file}: missing shared/shared.js`);
  if (!/<h1[\s>]/i.test(source)) errors.push(`${file}: missing h1`);
  const references = [...source.matchAll(/(?:href|src)="([^"]+)"/g)].map((match) => match[1]);
  for (const reference of references) {
    if (/^(?:https?:|#|mailto:|tel:|javascript:)/.test(reference)) continue;
    const clean = reference.split('#')[0].split('?')[0];
    if (!clean || !existsSync(resolve(dirname(file), clean))) errors.push(`${file}: broken local reference ${reference}`);
  }
}

for (const slice of [...slices, 'shared']) {
  const dir = join(root, slice);
  if (!existsSync(dir)) continue;
  for (const file of readdirSync(dir)) {
    if (!['.css', '.html'].includes(extname(file))) continue;
    const source = readFileSync(join(dir, file), 'utf8');
    if (/gradient\s*\(/i.test(source)) errors.push(`${join(dir, file)}: gradients are forbidden`);
    if (/font-weight\s*:\s*(?:700|800|900)/i.test(source)) errors.push(`${join(dir, file)}: heavy font weight is forbidden`);
  }
}

const required = {
  discovery: ['discover.html','search.html','results.html','category.html','vendor.html','dish.html','drop.html','saved.html','following.html','notifications.html'],
  commerce: ['cart.html','checkout.html','payment-result.html','confirmation.html','orders.html','order-detail.html','review.html','support.html','dispute.html'],
  account: ['auth.html','profile.html','addresses.html','settings.html'],
};
for (const [slice, files] of Object.entries(required)) {
  for (const file of files) if (!existsSync(join(root, slice, file))) errors.push(`missing required route ${slice}/${file}`);
}

if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}
console.log(`Verified ${htmlFiles.length} customer pages: routes, local references, shared styles, headings, typography and no-gradient constraint.`);
