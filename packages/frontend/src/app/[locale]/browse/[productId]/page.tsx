export const revalidate = 60

import { CartControls } from "@/components/ui/providers/cart-context"
import { getProduct } from "@/gateway/store"
import { cn, formatPrice, formatTitle, urlIdToShopifyId } from "@/lib/utils"
import { Metadata, ResolvingMetadata } from "next"
import Preview from "./preview"
import { getUserProduct } from "@/gateway/tasks"
import DesignControls from "./design-controls"
import PromptDescription from "./prompt-description"

export async function generateMetadata(
  { params }: { params: { productId: string, locale: string } },
  parent: ResolvingMetadata
): Promise<Metadata> {
  const product = await getProduct(urlIdToShopifyId(params.productId), params.locale)

  return {
    title: (await parent).title,
    description: product?.description
  }
}

const ProductPage = async ({ params }: { params: { productId: string, locale: string } }) => {
  const product = await getProduct(urlIdToShopifyId(params.productId), params.locale)
  const userProduct = await getUserProduct(urlIdToShopifyId(params.productId))

  if (product) {
    return (
      <section className={"flex lg:flex-row flex-col lg:max-h-full min-h-[calc(100vh-5rem)]"}>
        <Preview product={product} />
        <div className="lg:w-3/5 min-h-full lg:max-h-full">
          <div className="p-16 h-full border-l bg-white">
            <h1 className={cn("text-slate-800 font-medium text-4xl")}>{formatTitle(product.title)}</h1>
            <div className="pt-4 text-lg"><i>{formatPrice(product.priceRange.maxVariantPrice)}</i></div>
            <div className="flex flex-col gap-2 py-4 w-full">
              <div className="flex flex-row flex-wrap gap-2">
                <CartControls variantId={product.variants.edges[0].node.id} />
                <DesignControls product={userProduct} />
              </div>
              <p className="font-light py-8 leading-relaxed">
                {product.description}
              </p>
              {userProduct?.imagineData &&
                <PromptDescription prompt={userProduct!.imagineData!.imaginePrompt} />
              }
            </div>
          </div>
        </div>
      </section>
    )
  }

  return <div className="flex flex-col min-h-screen justify-center text-center">Oops! Product not found</div>
}

export default ProductPage