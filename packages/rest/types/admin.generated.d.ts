/* eslint-disable eslint-comments/disable-enable-pair */
/* eslint-disable eslint-comments/no-unlimited-disable */
/* eslint-disable */
import * as AdminTypes from './admin.types.d.ts';

export type CreateProductMutationVariables = AdminTypes.Exact<{
  input: AdminTypes.ProductInput;
  media?: AdminTypes.InputMaybe<Array<AdminTypes.CreateMediaInput> | AdminTypes.CreateMediaInput>;
}>;


export type CreateProductMutation = { productCreate?: AdminTypes.Maybe<{ product?: AdminTypes.Maybe<(
      Pick<AdminTypes.Product, 'id'>
      & { variants: { edges: Array<{ node: Pick<AdminTypes.ProductVariant, 'id'> }> } }
    )> }> };

export type ProductPublishMutationVariables = AdminTypes.Exact<{
  input: AdminTypes.ProductPublishInput;
}>;


export type ProductPublishMutation = { productPublish?: AdminTypes.Maybe<{ productPublications?: AdminTypes.Maybe<Array<{ channel: Pick<AdminTypes.Channel, 'name'> }>> }> };

interface GeneratedQueryTypes {
}

interface GeneratedMutationTypes {
  "\n    mutation createProduct($input: ProductInput!, $media: [CreateMediaInput!]) {\n      productCreate(input: $input, media: $media) {\n        product {\n          id\n          variants(first: 1) {\n            edges {\n              node {\n                id\n              }\n            }\n          }\n        }\n      }\n    }\n  ": {return: CreateProductMutation, variables: CreateProductMutationVariables},
  "\n    mutation productPublish($input: ProductPublishInput!) {\n      productPublish(input: $input) {\n        productPublications {\n          channel {\n            name\n          }\n        }\n      }\n    }\n  ": {return: ProductPublishMutation, variables: ProductPublishMutationVariables},
}
declare module 'admin' {
  type InputMaybe<T> = AdminTypes.InputMaybe<T>;
  interface AdminQueries extends GeneratedQueryTypes {}
  interface AdminMutations extends GeneratedMutationTypes {}
}
