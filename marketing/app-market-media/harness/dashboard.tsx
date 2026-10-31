// Mounts the real dashboard page. Query params drive it into the state to capture:
//   ?tab=Campaigns           click that tab
//   &create=Campaign%20Name  open the create-campaign form and type a name
import { createRoot } from 'react-dom/client';
import PostPurchaseDashboard from '../../../src/extensions/dashboard/pages/my-page/my-page';

createRoot(document.getElementById('root')!).render(<PostPurchaseDashboard />);

const params = new URLSearchParams(location.search);
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

function findByText(text: string, selector = '*'): HTMLElement | undefined {
  return [...document.querySelectorAll<HTMLElement>(selector)]
    .filter((el) => el.textContent?.trim() === text)
    .pop();
}

function typeInto(input: HTMLInputElement, value: string) {
  const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!;
  setter.call(input, value);
  input.dispatchEvent(new Event('input', { bubbles: true }));
}

(async () => {
  await wait(500);
  const tab = params.get('tab');
  if (tab) findByText(tab)?.click();
  await wait(200);

  const name = params.get('create');
  if (name) {
    findByText('Create Campaign', 'button')?.click();
    await wait(200);
    const input = document.querySelector<HTMLInputElement>('input[placeholder^="e.g."]');
    if (input) typeInto(input, name);
    // Number inputs, in order: discount percentage, minimum order subtotal.
    const [discount, minSubtotal] = document.querySelectorAll<HTMLInputElement>('input[type="number"]');
    if (discount) typeInto(discount, '15');
    if (minSubtotal) typeInto(minSubtotal, '40');
    await wait(100);
    document.querySelector('input[placeholder^="e.g."]')?.scrollIntoView({ block: 'center' });
  }
  document.title = 'ready';
})();
