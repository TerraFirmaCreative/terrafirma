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

export type GetLocalizadBannerQueryVariables = StorefrontTypes.Exact<{ [key: string]: never; }>;


export type GetLocalizadBannerQuery = { localization: { market: (
      Pick<StorefrontTypes.Market, 'id' | 'handle'>
      & { banner?: StorefrontTypes.Maybe<Pick<StorefrontTypes.Metafield, 'value' | 'type'>> }
    ) } };

export type GetBannerQueryVariables = StorefrontTypes.Exact<{
  handle: StorefrontTypes.MetaobjectHandleInput;
}>;


export type GetBannerQuery = { metaobject?: StorefrontTypes.Maybe<(
    Pick<StorefrontTypes.Metaobject, 'id'>
    & { fields: Array<Pick<StorefrontTypes.MetaobjectField, 'key' | 'value'>> }
  )> };

export type SearchPredictionsQueryVariables = StorefrontTypes.Exact<{
  query: StorefrontTypes.Scalars['String']['input'];
  countryCode?: StorefrontTypes.InputMaybe<StorefrontTypes.CountryCode>;
}>;


export type SearchPredictionsQuery = { predictiveSearch?: StorefrontTypes.Maybe<{ queries: Array<Pick<StorefrontTypes.SearchQuerySuggestion, 'text' | 'styledText'>>, products: Array<(
      Pick<StorefrontTypes.Product, 'id' | 'title'>
      & { featuredImage?: StorefrontTypes.Maybe<Pick<StorefrontTypes.Image, 'url'>> }
    )> }> };

export type SearchPaginatedProductsQueryVariables = StorefrontTypes.Exact<{
  first?: StorefrontTypes.InputMaybe<StorefrontTypes.Scalars['Int']['input']>;
  sortKey?: StorefrontTypes.InputMaybe<StorefrontTypes.SearchSortKeys>;
  query: StorefrontTypes.Scalars['String']['input'];
  reverse?: StorefrontTypes.InputMaybe<StorefrontTypes.Scalars['Boolean']['input']>;
  after?: StorefrontTypes.InputMaybe<StorefrontTypes.Scalars['String']['input']>;
  productFilters?: StorefrontTypes.InputMaybe<Array<StorefrontTypes.ProductFilter> | StorefrontTypes.ProductFilter>;
  countryCode?: StorefrontTypes.InputMaybe<StorefrontTypes.CountryCode>;
}>;


export type SearchPaginatedProductsQuery = { search: { edges: Array<(
      Pick<StorefrontTypes.SearchResultItemEdge, 'cursor'>
      & { node: (
        Pick<StorefrontTypes.Product, 'id' | 'title'>
        & { featuredImage?: StorefrontTypes.Maybe<Pick<StorefrontTypes.Image, 'url'>>, priceRange: { maxVariantPrice: Pick<StorefrontTypes.MoneyV2, 'amount' | 'currencyCode'> } }
      ) }
    )> } };

export type RandomProductsQueryVariables = StorefrontTypes.Exact<{ [key: string]: never; }>;


export type RandomProductsQuery = { products: { edges: Array<(
      Pick<StorefrontTypes.ProductEdge, 'cursor'>
      & { node: (
        Pick<StorefrontTypes.Product, 'id' | 'title'>
        & { featuredImage?: StorefrontTypes.Maybe<Pick<StorefrontTypes.Image, 'url'>>, priceRange: { maxVariantPrice: Pick<StorefrontTypes.MoneyV2, 'amount' | 'currencyCode'> } }
      ) }
    )> } };

export type PaginatedProductsQueryVariables = StorefrontTypes.Exact<{
  first?: StorefrontTypes.InputMaybe<StorefrontTypes.Scalars['Int']['input']>;
  sortKey?: StorefrontTypes.InputMaybe<StorefrontTypes.ProductSortKeys>;
  query?: StorefrontTypes.InputMaybe<StorefrontTypes.Scalars['String']['input']>;
  reverse?: StorefrontTypes.InputMaybe<StorefrontTypes.Scalars['Boolean']['input']>;
  after?: StorefrontTypes.InputMaybe<StorefrontTypes.Scalars['String']['input']>;
  countryCode?: StorefrontTypes.InputMaybe<StorefrontTypes.CountryCode>;
}>;


export type PaginatedProductsQuery = { products: { edges: Array<(
      Pick<StorefrontTypes.ProductEdge, 'cursor'>
      & { node: (
        Pick<StorefrontTypes.Product, 'id' | 'title' | 'createdAt' | 'description'>
        & { featuredImage?: StorefrontTypes.Maybe<Pick<StorefrontTypes.Image, 'url'>>, images: { edges: Array<{ node: Pick<StorefrontTypes.Image, 'url' | 'altText'> }> }, priceRange: { maxVariantPrice: Pick<StorefrontTypes.MoneyV2, 'amount' | 'currencyCode'> }, variants: { edges: Array<{ node: Pick<StorefrontTypes.ProductVariant, 'id'> }> } }
      ) }
    )> } };

export type GetProductsByIdQueryVariables = StorefrontTypes.Exact<{
  ids: Array<StorefrontTypes.Scalars['ID']['input']> | StorefrontTypes.Scalars['ID']['input'];
  countryCode?: StorefrontTypes.InputMaybe<StorefrontTypes.CountryCode>;
}>;


export type GetProductsByIdQuery = { nodes: Array<StorefrontTypes.Maybe<(
    Pick<StorefrontTypes.Product, 'id' | 'title' | 'createdAt' | 'description'>
    & { featuredImage?: StorefrontTypes.Maybe<Pick<StorefrontTypes.Image, 'url'>>, images: { edges: Array<{ node: Pick<StorefrontTypes.Image, 'url' | 'altText'> }> }, priceRange: { maxVariantPrice: Pick<StorefrontTypes.MoneyV2, 'amount' | 'currencyCode'> }, variants: { edges: Array<{ node: Pick<StorefrontTypes.ProductVariant, 'id'> }> } }
  )>> };

export type GetProductQueryVariables = StorefrontTypes.Exact<{
  id: StorefrontTypes.Scalars['ID']['input'];
  countryCode?: StorefrontTypes.InputMaybe<StorefrontTypes.CountryCode>;
}>;


export type GetProductQuery = { product?: StorefrontTypes.Maybe<(
    Pick<StorefrontTypes.Product, 'id' | 'title' | 'createdAt' | 'description'>
    & { featuredImage?: StorefrontTypes.Maybe<Pick<StorefrontTypes.Image, 'url'>>, images: { edges: Array<{ node: Pick<StorefrontTypes.Image, 'url' | 'altText'> }> }, priceRange: { maxVariantPrice: Pick<StorefrontTypes.MoneyV2, 'amount' | 'currencyCode'> }, variants: { edges: Array<{ node: Pick<StorefrontTypes.ProductVariant, 'id'> }> } }
  )> };

export type GetCollectionsQueryVariables = StorefrontTypes.Exact<{
  query?: StorefrontTypes.InputMaybe<StorefrontTypes.Scalars['String']['input']>;
  countryCode?: StorefrontTypes.InputMaybe<StorefrontTypes.CountryCode>;
}>;


export type GetCollectionsQuery = { collections: { nodes: Array<(
      Pick<StorefrontTypes.Collection, 'id' | 'title' | 'description'>
      & { image?: StorefrontTypes.Maybe<Pick<StorefrontTypes.Image, 'url'>>, products: { nodes: Array<(
          Pick<StorefrontTypes.Product, 'id' | 'title' | 'createdAt' | 'description'>
          & { featuredImage?: StorefrontTypes.Maybe<Pick<StorefrontTypes.Image, 'url'>>, images: { edges: Array<{ node: Pick<StorefrontTypes.Image, 'url' | 'altText'> }> }, priceRange: { maxVariantPrice: Pick<StorefrontTypes.MoneyV2, 'amount' | 'currencyCode'> }, variants: { edges: Array<{ node: Pick<StorefrontTypes.ProductVariant, 'id'> }> } }
        )> } }
    )> } };

export type CreateCartMutationVariables = StorefrontTypes.Exact<{
  input?: StorefrontTypes.InputMaybe<StorefrontTypes.CartInput>;
}>;


export type CreateCartMutation = { cartCreate?: StorefrontTypes.Maybe<{ cart?: StorefrontTypes.Maybe<(
      Pick<StorefrontTypes.Cart, 'id' | 'checkoutUrl'>
      & { cost: { totalAmount: Pick<StorefrontTypes.MoneyV2, 'amount' | 'currencyCode'> }, buyerIdentity: { customer?: StorefrontTypes.Maybe<Pick<StorefrontTypes.Customer, 'displayName' | 'id' | 'numberOfOrders'>> }, deliveryGroups: { nodes: Array<{ deliveryOptions: Array<(
            Pick<StorefrontTypes.CartDeliveryOption, 'code' | 'deliveryMethodType' | 'handle' | 'title'>
            & { estimatedCost: Pick<StorefrontTypes.MoneyV2, 'amount' | 'currencyCode'> }
          )> }> }, lines: { edges: Array<{ node: (
            Pick<StorefrontTypes.CartLine, 'id' | 'quantity'>
            & { cost: { totalAmount: Pick<StorefrontTypes.MoneyV2, 'amount' | 'currencyCode'> }, merchandise: (
              Pick<StorefrontTypes.ProductVariant, 'id'>
              & { product: Pick<StorefrontTypes.Product, 'title'> }
            ) }
          ) | (
            Pick<StorefrontTypes.ComponentizableCartLine, 'id' | 'quantity'>
            & { cost: { totalAmount: Pick<StorefrontTypes.MoneyV2, 'amount' | 'currencyCode'> }, merchandise: (
              Pick<StorefrontTypes.ProductVariant, 'id'>
              & { product: Pick<StorefrontTypes.Product, 'title'> }
            ) }
          ) }> } }
    )> }> };

export type AddCartMutationVariables = StorefrontTypes.Exact<{
  cartId: StorefrontTypes.Scalars['ID']['input'];
  lines: Array<StorefrontTypes.CartLineInput> | StorefrontTypes.CartLineInput;
}>;


export type AddCartMutation = { cartLinesAdd?: StorefrontTypes.Maybe<{ cart?: StorefrontTypes.Maybe<(
      Pick<StorefrontTypes.Cart, 'id' | 'checkoutUrl'>
      & { cost: { totalAmount: Pick<StorefrontTypes.MoneyV2, 'amount' | 'currencyCode'> }, buyerIdentity: { customer?: StorefrontTypes.Maybe<Pick<StorefrontTypes.Customer, 'displayName' | 'id' | 'numberOfOrders'>> }, deliveryGroups: { nodes: Array<{ deliveryOptions: Array<(
            Pick<StorefrontTypes.CartDeliveryOption, 'code' | 'deliveryMethodType' | 'handle' | 'title'>
            & { estimatedCost: Pick<StorefrontTypes.MoneyV2, 'amount' | 'currencyCode'> }
          )> }> }, lines: { edges: Array<{ node: (
            Pick<StorefrontTypes.CartLine, 'id' | 'quantity'>
            & { cost: { totalAmount: Pick<StorefrontTypes.MoneyV2, 'amount' | 'currencyCode'> }, merchandise: (
              Pick<StorefrontTypes.ProductVariant, 'id'>
              & { product: Pick<StorefrontTypes.Product, 'title'> }
            ) }
          ) | (
            Pick<StorefrontTypes.ComponentizableCartLine, 'id' | 'quantity'>
            & { cost: { totalAmount: Pick<StorefrontTypes.MoneyV2, 'amount' | 'currencyCode'> }, merchandise: (
              Pick<StorefrontTypes.ProductVariant, 'id'>
              & { product: Pick<StorefrontTypes.Product, 'title'> }
            ) }
          ) }> } }
    )> }> };

export type UpdateCartMutationVariables = StorefrontTypes.Exact<{
  cartId: StorefrontTypes.Scalars['ID']['input'];
  lines: Array<StorefrontTypes.CartLineUpdateInput> | StorefrontTypes.CartLineUpdateInput;
}>;


export type UpdateCartMutation = { cartLinesUpdate?: StorefrontTypes.Maybe<{ cart?: StorefrontTypes.Maybe<(
      Pick<StorefrontTypes.Cart, 'id' | 'checkoutUrl'>
      & { cost: { totalAmount: Pick<StorefrontTypes.MoneyV2, 'amount' | 'currencyCode'> }, lines: { edges: Array<{ node: (
            Pick<StorefrontTypes.CartLine, 'id' | 'quantity'>
            & { cost: { totalAmount: Pick<StorefrontTypes.MoneyV2, 'amount' | 'currencyCode'> }, merchandise: (
              Pick<StorefrontTypes.ProductVariant, 'id'>
              & { product: Pick<StorefrontTypes.Product, 'title'> }
            ) }
          ) | (
            Pick<StorefrontTypes.ComponentizableCartLine, 'id' | 'quantity'>
            & { cost: { totalAmount: Pick<StorefrontTypes.MoneyV2, 'amount' | 'currencyCode'> }, merchandise: (
              Pick<StorefrontTypes.ProductVariant, 'id'>
              & { product: Pick<StorefrontTypes.Product, 'title'> }
            ) }
          ) }> } }
    )> }> };

export type GetLocalizationQueryVariables = StorefrontTypes.Exact<{ [key: string]: never; }>;


export type GetLocalizationQuery = { localization: { availableCountries: Array<(
      Pick<StorefrontTypes.Country, 'isoCode' | 'name'>
      & { currency: Pick<StorefrontTypes.Currency, 'symbol' | 'isoCode' | 'name'> }
    )> } };

interface GeneratedQueryTypes {
  "#graphql\n    query getPages {\n      metaobjects(first: 10, type: \"Page\") {\n        edges {\n          node {\n            handle\n            fields {\n              key\n              value\n            }\n          }\n        }\n      }\n    }\n  ": {return: GetPagesQuery, variables: GetPagesQueryVariables},
  "#graphql\n    query getPage($handle: MetaobjectHandleInput) {\n      metaobject(handle: $handle) {\n        handle\n        fields {\n          key\n          value\n        }\n      }\n    }\n  ": {return: GetPageQuery, variables: GetPageQueryVariables},
  "#graphql\n    query getLocalizadBanner{\n      localization {\n        market {\n          id\n          handle\n          banner: metafield(namespace:\"custom\", key: \"banner\") {\n            value\n            type\n          }\n        }\n      }\n    }\n  ": {return: GetLocalizadBannerQuery, variables: GetLocalizadBannerQueryVariables},
  "#graphql\n      query getBanner($handle: MetaobjectHandleInput!){\n        metaobject(handle: $handle) {\n          id\n          fields {\n            key\n            value\n          }\n        }\n      }\n    ": {return: GetBannerQuery, variables: GetBannerQueryVariables},
  "#graphql\n    query searchPredictions($query: String!, $countryCode: CountryCode) @inContext(country: $countryCode) {\n      predictiveSearch(query: $query) {\n        queries {\n          text\n          styledText\n        }\n        products {\n          id\n          title\n          featuredImage {\n            url\n          }\n        }\n      }\n    }\n  ": {return: SearchPredictionsQuery, variables: SearchPredictionsQueryVariables},
  "#graphql\n    query searchPaginatedProducts($first: Int, $sortKey: SearchSortKeys, $query: String!, $reverse: Boolean, $after: String, $productFilters: [ProductFilter!] $countryCode: CountryCode) @inContext(country: $countryCode) {\n      search(first: $first, sortKey: $sortKey, query: $query, reverse: $reverse, after: $after, productFilters: $productFilters, prefix: LAST) {\n        edges {\n          cursor\n          node {\n            ...on Product {\n              id\n              title\n              featuredImage {\n                url\n              }\n              priceRange {\n                maxVariantPrice {\n                  amount\n                  currencyCode\n                }\n              }\n            }\n          }\n        }\n      }\n    }\n": {return: SearchPaginatedProductsQuery, variables: SearchPaginatedProductsQueryVariables},
  "#graphql\n  query randomProducts {\n    products(first: 70, sortKey: ID) {\n      edges {\n        cursor\n        node {\n          id\n          title\n          featuredImage {\n            url\n          }\n          priceRange {\n            maxVariantPrice {\n              amount\n              currencyCode\n            }\n          }\n        }\n      }\n    }\n  }\n": {return: RandomProductsQuery, variables: RandomProductsQueryVariables},
  "#graphql\n    query paginatedProducts($first: Int, $sortKey: ProductSortKeys, $query: String, $reverse: Boolean, $after: String, $countryCode: CountryCode) @inContext(country: $countryCode) {\n      products(first: $first, sortKey: $sortKey, query: $query, reverse: $reverse, after: $after) {\n        edges {\n          cursor\n          node {\n            id\n            title\n            createdAt\n            description\n            featuredImage {\n              url\n            }\n            images(first: 10) {\n              edges {\n                node {\n                  url\n                  altText\n                }\n              }\n            }\n            priceRange {\n              maxVariantPrice {\n                amount\n                currencyCode\n              }\n            }\n            variants(first: 1) {\n              edges {\n                node {\n                  id\n                }\n              }\n            }\n          }\n        }\n      }\n    }\n  ": {return: PaginatedProductsQuery, variables: PaginatedProductsQueryVariables},
  "#graphql\n    query getProductsById($ids: [ID!]!, $countryCode: CountryCode) @inContext(country: $countryCode) {\n      nodes(ids: $ids) {\n        ... on Product {\n          id\n          title\n          createdAt\n          description\n          featuredImage {\n            url\n          }\n          images(first: 10) {\n            edges {\n              node {\n                url\n                altText\n              }\n            }\n          }\n          priceRange {\n            maxVariantPrice {\n              amount\n              currencyCode\n            }\n          }\n          variants(first: 1) {\n            edges {\n              node {\n                id\n              }\n            }\n          }\n        }\n      }\n    }\n  ": {return: GetProductsByIdQuery, variables: GetProductsByIdQueryVariables},
  "#graphql\n    query getProduct($id: ID!, $countryCode: CountryCode) @inContext(country: $countryCode) {\n      product(id: $id) {\n        id\n        title\n        createdAt\n        description\n        featuredImage {\n          url\n        }\n        images(first: 10) {\n          edges {\n            node {\n              url\n              altText\n            }\n          }\n        }\n        priceRange {\n          maxVariantPrice {\n            amount\n            currencyCode\n          }\n        }\n        variants(first: 1) {\n          edges{\n            node {\n              id\n            }\n          }\n        }\n      }\n    }\n  ": {return: GetProductQuery, variables: GetProductQueryVariables},
  "#graphql\n    query getCollections($query: String, $countryCode: CountryCode) @inContext(country: $countryCode) {\n      collections(first:20, query: $query) {\n        nodes {\n          id\n          title\n          description\n          image {\n            url\n          }\n          products(first:100) {\n            nodes {\n              id\n              title\n              createdAt\n              description\n              featuredImage {\n                url\n              }\n              images(first: 10) {\n                edges {\n                  node {\n                    url\n                    altText\n                  }\n                }\n              }\n              priceRange {\n                maxVariantPrice {\n                  amount\n                  currencyCode\n                }\n              }\n              variants(first: 1) {\n                edges {\n                  node {\n                    id\n                  }\n                }\n              }\n            }\n          }\n        }\n      }\n    }\n  ": {return: GetCollectionsQuery, variables: GetCollectionsQueryVariables},
  "#graphql\n    query GetLocalization {\n      localization {\n        availableCountries {\n          isoCode\n          name\n          currency {\n            symbol\n            isoCode\n            name\n          }\n        }\n      }\n    }\n  ": {return: GetLocalizationQuery, variables: GetLocalizationQueryVariables},
}

interface GeneratedMutationTypes {
  "#graphql \n    mutation createCart($input: CartInput) {\n      cartCreate(input: $input) {\n        cart {\n          id\n          cost {\n            totalAmount {\n              amount\n              currencyCode\n            }\n          }\n          buyerIdentity {\n            customer {\n              displayName\n              id\n              numberOfOrders\n\n            }\n          }\n          deliveryGroups(first:10) {\n            nodes {\n              deliveryOptions {\n                code\n                deliveryMethodType\n                estimatedCost {\n                  amount\n                  currencyCode\n                }\n                handle\n                title\n              }\n            }\n          }\n          checkoutUrl\n          lines(first: 100) {\n            edges {\n              node {\n                id\n                quantity\n                cost {\n                  totalAmount {\n                    amount\n                    currencyCode\n                  }\n                }\n                merchandise {\n                  ...on ProductVariant {\n                    id\n                    product {\n                      title\n                    }\n                  }\n                }\n              }\n            }\n          }\n        }\n      }\n    }\n  ": {return: CreateCartMutation, variables: CreateCartMutationVariables},
  "#graphql\n    mutation addCart($cartId: ID!, $lines: [CartLineInput!]!) {\n      cartLinesAdd(cartId: $cartId, lines: $lines) {\n        cart {\n          id\n          cost {\n            totalAmount {\n              amount\n              currencyCode\n            }\n          }\n          buyerIdentity {\n            customer {\n              displayName\n              id\n              numberOfOrders\n\n            }\n          }\n          deliveryGroups(first:10) {\n            nodes {\n              deliveryOptions {\n                code\n                deliveryMethodType\n                estimatedCost {\n                  amount\n                  currencyCode\n                }\n                handle\n                title\n              }\n            }\n          }\n          checkoutUrl\n          lines(first: 100) {\n            edges {\n              node {\n                id\n                quantity\n                cost {\n                  totalAmount {\n                    amount\n                    currencyCode\n                  }\n                }\n                merchandise {\n                  ...on ProductVariant {\n                    id\n                    product {\n                      title\n                    }\n                  }\n                }\n              }\n            }\n          }\n        }\n      }\n    }\n  ": {return: AddCartMutation, variables: AddCartMutationVariables},
  "#graphql\n    mutation updateCart($cartId: ID!, $lines: [CartLineUpdateInput!]!) {\n      cartLinesUpdate(cartId: $cartId, lines: $lines) {\n        cart {\n          id\n          cost {\n            totalAmount {\n              amount\n              currencyCode\n            }\n          }\n          checkoutUrl\n          lines(first: 100) {\n            edges {\n              node {\n                id\n                quantity\n                cost {\n                  totalAmount {\n                    amount\n                    currencyCode\n                  }\n                }\n                merchandise {\n                  ...on ProductVariant {\n                    id\n                    product {\n                      title\n                    }\n                  }\n                }\n              }\n            }\n          }\n        }\n      }\n    }\n  ": {return: UpdateCartMutation, variables: UpdateCartMutationVariables},
}
declare module '@shopify/storefront-api-client' {
  type InputMaybe<T> = StorefrontTypes.InputMaybe<T>;
  interface StorefrontQueries extends GeneratedQueryTypes {}
  interface StorefrontMutations extends GeneratedMutationTypes {}
}
