/* eslint-disable eslint-comments/disable-enable-pair */
/* eslint-disable eslint-comments/no-unlimited-disable */
/* eslint-disable */
import * as StorefrontTypes from './storefront.types.d.ts';

export type GetPagesQueryVariables = StorefrontTypes.Exact<{ [key: string]: never; }>;


export type GetPagesQuery = { metaobjects: { edges: Array<{ node: (
        Pick<StorefrontTypes.Metaobject, 'handle'>
        & { fields: Array<Pick<StorefrontTypes.MetaobjectField, 'key' | 'value'>> }
      ) }> } };

export type GetPageQueryVariables = StorefrontTypes.Exact<{
  handle?: StorefrontTypes.InputMaybe<StorefrontTypes.MetaobjectHandleInput>;
}>;


export type GetPageQuery = { metaobject?: StorefrontTypes.Maybe<(
    Pick<StorefrontTypes.Metaobject, 'handle'>
    & { fields: Array<Pick<StorefrontTypes.MetaobjectField, 'key' | 'value'>> }
  )> };

export type CustomProductsQueryVariables = StorefrontTypes.Exact<{
  first?: StorefrontTypes.InputMaybe<StorefrontTypes.Scalars['Int']['input']>;
  sortKey?: StorefrontTypes.InputMaybe<StorefrontTypes.ProductSortKeys>;
  query?: StorefrontTypes.InputMaybe<StorefrontTypes.Scalars['String']['input']>;
}>;


export type CustomProductsQuery = { products: { edges: Array<{ node: (
        Pick<StorefrontTypes.Product, 'id' | 'title'>
        & { featuredImage?: StorefrontTypes.Maybe<Pick<StorefrontTypes.Image, 'url'>>, priceRange: { maxVariantPrice: Pick<StorefrontTypes.MoneyV2, 'currencyCode' | 'amount'> } }
      ) }> } };

export type PaginatedProductsQueryVariables = StorefrontTypes.Exact<{
  first?: StorefrontTypes.InputMaybe<StorefrontTypes.Scalars['Int']['input']>;
  sortKey?: StorefrontTypes.InputMaybe<StorefrontTypes.ProductSortKeys>;
  query?: StorefrontTypes.InputMaybe<StorefrontTypes.Scalars['String']['input']>;
  reverse?: StorefrontTypes.InputMaybe<StorefrontTypes.Scalars['Boolean']['input']>;
  after?: StorefrontTypes.InputMaybe<StorefrontTypes.Scalars['String']['input']>;
}>;


export type PaginatedProductsQuery = { products: { edges: Array<(
      Pick<StorefrontTypes.ProductEdge, 'cursor'>
      & { node: (
        Pick<StorefrontTypes.Product, 'id' | 'title'>
        & { featuredImage?: StorefrontTypes.Maybe<Pick<StorefrontTypes.Image, 'url'>>, priceRange: { maxVariantPrice: Pick<StorefrontTypes.MoneyV2, 'amount' | 'currencyCode'> } }
      ) }
    )> } };

export type GetProductsByIdQueryVariables = StorefrontTypes.Exact<{
  query?: StorefrontTypes.InputMaybe<StorefrontTypes.Scalars['String']['input']>;
}>;


export type GetProductsByIdQuery = { products: { edges: Array<{ node: (
        Pick<StorefrontTypes.Product, 'id' | 'title' | 'description'>
        & { featuredImage?: StorefrontTypes.Maybe<Pick<StorefrontTypes.Image, 'url'>>, priceRange: { maxVariantPrice: Pick<StorefrontTypes.MoneyV2, 'amount' | 'currencyCode'> }, variants: { edges: Array<{ node: Pick<StorefrontTypes.ProductVariant, 'id'> }> } }
      ) }> } };

export type GetProductQueryVariables = StorefrontTypes.Exact<{
  id: StorefrontTypes.Scalars['ID']['input'];
}>;


export type GetProductQuery = { product?: StorefrontTypes.Maybe<(
    Pick<StorefrontTypes.Product, 'id' | 'title' | 'description'>
    & { featuredImage?: StorefrontTypes.Maybe<Pick<StorefrontTypes.Image, 'url'>>, priceRange: { maxVariantPrice: Pick<StorefrontTypes.MoneyV2, 'amount' | 'currencyCode'> }, variants: { edges: Array<{ node: Pick<StorefrontTypes.ProductVariant, 'id'> }> } }
  )> };

interface GeneratedQueryTypes {
  "#graphql\n    query getPages {\n      metaobjects(first: 10, type: \"Page\") {\n        edges {\n          node {\n            handle\n            fields {\n              key\n              value\n            }\n          }\n        }\n      }\n    }\n  ": {return: GetPagesQuery, variables: GetPagesQueryVariables},
  "#graphql\n    query getPage($handle: MetaobjectHandleInput) {\n      metaobject(handle: $handle) {\n        handle\n        fields {\n          key\n          value\n        }\n      }\n    }\n  ": {return: GetPageQuery, variables: GetPageQueryVariables},
  "#graphql\n    query customProducts($first: Int, $sortKey: ProductSortKeys, $query: String) {\n      products(first: $first, sortKey: $sortKey, query: $query) {\n        edges {\n          node {\n            id\n            title\n            featuredImage {\n              url\n            }\n            priceRange {\n              maxVariantPrice {\n                currencyCode\n                amount\n              }\n            }\n          }\n        }\n      }\n    }\n  ": {return: CustomProductsQuery, variables: CustomProductsQueryVariables},
  "#graphql\n    query paginatedProducts($first: Int, $sortKey: ProductSortKeys, $query: String, $reverse: Boolean, $after: String) {\n      products(first: $first, sortKey: $sortKey, query: $query, reverse: $reverse, after: $after) {\n        edges {\n          cursor\n          node {\n            id\n            title\n            featuredImage {\n              url\n            }\n            priceRange {\n              maxVariantPrice {\n                amount\n                currencyCode\n              }\n            }\n          }\n        }\n      }\n    }\n  ": {return: PaginatedProductsQuery, variables: PaginatedProductsQueryVariables},
  "#graphql\n    query getProductsById($query: String) {\n      products(first: 10, query: $query) {\n        edges {\n          node {\n            id\n            title\n            description\n            featuredImage {\n              url\n            }\n            priceRange {\n              maxVariantPrice {\n                amount\n                currencyCode\n              }\n            }\n            variants(first: 1) {\n              edges{\n                node {\n                  id\n                }\n              }\n            }\n          }\n        }\n      }\n    }\n  ": {return: GetProductsByIdQuery, variables: GetProductsByIdQueryVariables},
  "#graphql\n    query getProduct($id: ID!) {\n      product(id: $id) {\n        id\n        title\n        description\n        featuredImage {\n          url\n        }\n        priceRange {\n          maxVariantPrice {\n            amount\n            currencyCode\n          }\n        }\n        variants(first: 1) {\n          edges{\n            node {\n              id\n            }\n          }\n        }\n      }\n    }\n  ": {return: GetProductQuery, variables: GetProductQueryVariables},
}

interface GeneratedMutationTypes {
}
declare module '@shopify/storefront-api-client' {
  type InputMaybe<T> = StorefrontTypes.InputMaybe<T>;
  interface StorefrontQueries extends GeneratedQueryTypes {}
  interface StorefrontMutations extends GeneratedMutationTypes {}
}
