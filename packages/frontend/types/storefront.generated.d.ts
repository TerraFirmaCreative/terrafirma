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

interface GeneratedQueryTypes {
  "#graphql\n    query getPages {\n      metaobjects(first: 10, type: \"Page\") {\n        edges {\n          node {\n            handle\n            fields {\n              key\n              value\n            }\n          }\n        }\n      }\n    }\n  ": {return: GetPagesQuery, variables: GetPagesQueryVariables},
  "#graphql\n    query getPage($handle: MetaobjectHandleInput) {\n      metaobject(handle: $handle) {\n        handle\n        fields {\n          key\n          value\n        }\n      }\n    }\n  ": {return: GetPageQuery, variables: GetPageQueryVariables},
}

interface GeneratedMutationTypes {
}
declare module '@shopify/storefront-api-client' {
  type InputMaybe<T> = StorefrontTypes.InputMaybe<T>;
  interface StorefrontQueries extends GeneratedQueryTypes {}
  interface StorefrontMutations extends GeneratedMutationTypes {}
}
