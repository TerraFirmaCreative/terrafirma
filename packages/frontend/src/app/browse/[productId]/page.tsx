export const revalidate = 60

import { CartControls } from "@/components/ui/store/cart-context"
import { getProduct } from "@/gateway/store"
import { cn, formatPrice, formatTitle, urlIdToShopifyId } from "@/lib/utils"
import { Metadata, ResolvingMetadata } from "next"
import Preview from "./preview"
import { robotoSerif } from "@/lib/fonts"

export async function generateMetadata(
  { params }: { params: { productId: string } },
  parent: ResolvingMetadata
): Promise<Metadata> {
  const product = await getProduct(urlIdToShopifyId(params.productId))

  return {
    title: (await parent).title,
    description: product?.description
  }
}

const ProductPage = async ({ params }: { params: { productId: string } }) => {
  const product = await getProduct(urlIdToShopifyId(params.productId))

  if (product) {
    return (
      <div className="mt-20">
        <section className={"flex lg:flex-row flex-col"}>
          <Preview product={product} />
          <div className="p-16 lg:w-1/2 border-l bg-white min-h-[calc(100vh-5rem)]">
            <h1 className={cn("font-serif text-slate-800 italic font-medium text-4xl")}>{formatTitle(product.title)}</h1>
            <div className="pt-4 text-lg"><i>{formatPrice(product.priceRange.maxVariantPrice)}</i></div>
            <div className="flex flex-col gap-2 py-4">
              <CartControls variantId={product.variants.edges[0].node.id} />
              <p className=" font-light leading-relaxed py-4">
                {product.description}
              </p>
            </div>
          </div>
        </section>
      </div>
    )
  }

  return <div className="flex flex-col min-h-screen justify-center text-center">Oops! Product not found</div>
}

export default ProductPage