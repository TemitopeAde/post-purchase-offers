// Mounts the real Editor settings panel, pre-filled with the brand theme.
import { createRoot } from 'react-dom/client';
import Panel from '../../../src/extensions/site/plugins/post-purchase-offers/post-purchase-offers.panel';

createRoot(document.getElementById('root')!).render(<Panel />);
