export const ValidResources = [
  'product',
  'custom_collection',
  'smart_collection',
  'page',
  'blog_post',
  'shop',
  'file',
  'customer',
  'discount_code',
  'draft_order',
  'order',
  'redirect',
]

export const ProductFields = [
  'id',
  'title',
  'body_html',
  'vendor',
  'product_type',
  'handle',
  'published_at',
  'template_suffix',
  'status',
  'published_scope',
  'tags',
  'options',
]

export const MetafieldFields = [
  'id',
  'namespace',
  'key',
  'value',
  'description',
  'owner_id',
  'owner_resource',
  'type',
]

export const VariantFields = [
  'id',
  'product_id',
  'title',
  'price',
  'sku',
  'position',
  'inventory_policy',
  'compare_at_price',
  'fulfillment_service',
  'inventory_management',
  'option1',
  'option2',
  'option3',
  'taxable',
  'barcode',
  'grams',
  'image_id',
  'weight',
  'weight_unit',
  'inventory_item_id',
  'inventory_quantity',
  'old_inventory_quantity',
  'requires_shipping',
]

export const ProductImageFields = ['id', 'position', 'alt', 'width', 'height', 'src', 'variant_ids']

export const CollectionImageFields = ['alt', 'src', 'width', 'height']

export const CustomCollectionFields = [
  'id',
  'handle',
  'title',
  'body_html',
  'published_at',
  'sort_order',
  'template_suffix',
  'published_scope',
]

export const SmartCollectionFields = [
  'id',
  'handle',
  'title',
  'body_html',
  'published_at',
  'sort_order',
  'template_suffix',
  'disjunctive',
  'published_scope',
]

export const SmartCollectionRuleFields = ['column', 'relation', 'condition']

export const PageFields = [
  'id',
  'title',
  'handle',
  'body_html',
  'author',
  'published_at',
  'template_suffix',
]

export const BlogFields = [
  'id',
  'handle',
  'title',
  'commentable',
  'feedburner',
  'feedburner_location',
  'template_suffix',
  'tags',
]

export const ArticleFields = [
  'id',
  'title',
  'body_html',
  'blog_id',
  'author',
  'user_id',
  'published_at',
  'summary_html',
  'template_suffix',
  'handle',
  'tags',
]

export const ArticleImageFields = ['owner_id', 'alt', 'width', 'height', 'src']

export const FileFields = ['id', 'alt', 'url', 'contentType']
