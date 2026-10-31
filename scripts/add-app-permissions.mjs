// Adds every permission this app needs via the Wix App Permissions REST API.
// Docs: https://dev.wix.com/docs/api-reference/app-management/app-permissions/introduction
//
// Requires an account-level API key with the "Manage Custom Apps" permission,
// created in the account that owns the app:
//   WIX_API_KEY=... WIX_ACCOUNT_ID=... npm run permissions:add
//
// Where a Wix method accepts several scopes, the least-privileged one is used.
import { readFileSync } from 'node:fs';

const API_URL = 'https://www.wixapis.com/apps/v1/app-permissions/v1/app-permissions';

const PERMISSIONS = [
  // @wix/data items.query
  'SCOPE.DC-DATA.READ',
  // @wix/data items.insert / update / save / remove
  'SCOPE.DC-DATA.WRITE',
  // @wix/ecom orders.getOrder
  'SCOPE.DC-STORES.READ-ORDERS',
  // @wix/ecom cartV2.createCart
  'SCOPE.ECOM.WRITE-CARTS-V2_LIMITED',
  // @wix/ecom cartV2.createCart with catalogOverrideFields (offer price);
  // Wix requires ECOM.ADMIN_MODIFY_CHECKOUTS for price overrides.
  'SCOPE.ECOM.MANAGE-ADMIN',
  // @wix/ecom cartV2.getCheckoutUrl
  'SCOPE.ECOM.READ-CARTS-V2_LIMITED',
  // @wix/stores catalogVersioning.getCatalogVersion
  'SCOPE.STORES.CATALOG_READ_LIMITED',
  // Get App Instance endpoint
  'SCOPE.DC.MANAGE-YOUR-APP',
  // @wix/stores products.queryProducts / getProduct (Catalog V1)
  'SCOPE.DC-STORES.READ-PRODUCTS',
  // @wix/stores productsV3.getProduct (Catalog V3)
  'SCOPE.STORES.PRODUCT_READ',
];

const { WIX_API_KEY, WIX_ACCOUNT_ID } = process.env;
if (!WIX_API_KEY || !WIX_ACCOUNT_ID) {
  console.error('Set WIX_API_KEY and WIX_ACCOUNT_ID before running this script.');
  process.exit(1);
}

const { appId } = JSON.parse(readFileSync(new URL('../wix.config.json', import.meta.url), 'utf8'));

const headers = {
  'Content-Type': 'application/json',
  Authorization: WIX_API_KEY,
  'wix-account-id': WIX_ACCOUNT_ID,
};

async function listExisting() {
  const existing = new Set();
  let cursor;
  do {
    const params = new URLSearchParams({ appId, consistent: 'true', 'paging.limit': '100' });
    if (cursor) params.set('paging.cursor', cursor);
    const res = await fetch(`${API_URL}?${params}`, { headers });
    if (!res.ok) throw new Error(`List failed (${res.status}): ${await res.text()}`);
    const body = await res.json();
    for (const p of body.appPermissions ?? []) existing.add(p.permission.permissionId);
    cursor = body.pagingMetadata?.hasNext ? body.pagingMetadata.cursors?.next : undefined;
  } while (cursor);
  return existing;
}

async function addPermission(permissionId) {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers,
    body: JSON.stringify({ appPermission: { appId, permission: { permissionId } } }),
  });
  if (res.ok) return { ok: true };
  const text = await res.text();
  return { ok: false, status: res.status, error: text };
}

const existing = await listExisting();
console.log(`App ${appId} currently has ${existing.size} permission(s).`);

let failed = 0;
for (const permissionId of PERMISSIONS) {
  if (existing.has(permissionId)) {
    console.log(`= ${permissionId} (already added)`);
    continue;
  }
  const result = await addPermission(permissionId);
  if (result.ok) {
    console.log(`+ ${permissionId}`);
  } else {
    failed++;
    console.error(`! ${permissionId} -> ${result.status} ${result.error}`);
  }
}

console.log('Note: changes can take up to 5 minutes to propagate across Wix.');
process.exit(failed ? 1 : 0);
