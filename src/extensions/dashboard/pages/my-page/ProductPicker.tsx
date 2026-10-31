import type { FC } from 'react';
import {
  Badge,
  Box as WdsBox,
  Button,
  Checkbox,
  Image,
  Loader,
  Search,
  Tag,
  Text,
  TextButton,
} from '@wix/design-system';
import type { ProductCandidate } from '../../../../lib/types';

// Same workaround as my-page.tsx: WDS Box's typings clash with this project's React types.
const Box = WdsBox as any;

interface ProductPickerProps {
  products: ProductCandidate[];
  selected: ProductCandidate[];
  onChange: (selected: ProductCandidate[]) => void;
  search: string;
  onSearchChange: (search: string) => void;
  loading: boolean;
  hasNext: boolean;
  onLoadMore: () => void;
}

const formatPrice = (product: ProductCandidate) => `$${product.price.toFixed(2)}`;

export const ProductPicker: FC<ProductPickerProps> = ({
  products,
  selected,
  onChange,
  search,
  onSearchChange,
  loading,
  hasNext,
  onLoadMore,
}) => {
  const selectedIds = new Set(selected.map((product) => product.productId));

  const toggle = (product: ProductCandidate) =>
    onChange(
      selectedIds.has(product.productId)
        ? selected.filter((p) => p.productId !== product.productId)
        : [...selected, product],
    );

  return (
    <Box direction="vertical" gap="SP2">
      <Search
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        onClear={() => onSearchChange('')}
        placeholder="Search products"
      />

      {selected.length > 0 && (
        <Box direction="vertical" gap="SP1">
          <Box verticalAlign="middle" gap="SP2">
            <Text size="small" weight="bold">{selected.length} selected</Text>
            <TextButton size="small" onClick={() => onChange([])}>Clear all</TextButton>
          </Box>
          <Box gap="SP1" style={{ flexWrap: 'wrap' }}>
            {selected.map((product) => (
              <Tag
                key={product.productId}
                id={product.productId}
                size="small"
                removable
                onRemove={() => toggle(product)}
              >
                {product.name}
              </Tag>
            ))}
          </Box>
        </Box>
      )}

      <Box
        direction="vertical"
        border="1px solid"
        borderColor="D60"
        borderRadius="6px"
        maxHeight="280px"
        overflow="auto"
      >
        {products.length === 0 && !loading && (
          <Box padding="SP4" align="center">
            <Text size="small" secondary>
              {search ? `No products match "${search}"` : 'No products found in your store'}
            </Text>
          </Box>
        )}

        {products.map((product, index) => {
          const isSelected = selectedIds.has(product.productId);
          return (
            <Box
              key={product.productId}
              gap="SP3"
              verticalAlign="middle"
              padding="SP2 SP3"
              backgroundColor={isSelected ? 'B50' : undefined}
              borderTop={index > 0 ? '1px solid' : undefined}
              borderTopColor="D70"
              style={{ cursor: 'pointer' }}
              onClick={() => toggle(product)}
            >
              {/* The whole row toggles; keep the checkbox's own clicks from toggling twice. */}
              <Box onClick={(e: { stopPropagation: () => void }) => e.stopPropagation()}>
                <Checkbox checked={isSelected} onChange={() => toggle(product)} />
              </Box>
              {product.imageUrl ? (
                <Image src={product.imageUrl} width={40} height={40} fit="cover" borderRadius="4px" />
              ) : (
                <Box width="40px" height="40px" backgroundColor="D70" borderRadius="4px" />
              )}
              <Box direction="vertical" flexGrow={1} minWidth="0">
                <Text size="small" weight="bold" ellipsis>{product.name}</Text>
                <Text size="tiny" secondary>{formatPrice(product)}</Text>
              </Box>
              {!product.inStock && <Badge size="small" skin="neutralLight">Out of stock</Badge>}
            </Box>
          );
        })}

        {loading && (
          <Box padding="SP3" align="center">
            <Loader size="tiny" />
          </Box>
        )}
      </Box>

      {hasNext && (
        <Box>
          <Button size="small" priority="secondary" disabled={loading} onClick={onLoadMore}>
            Load more products
          </Button>
        </Box>
      )}
    </Box>
  );
};
