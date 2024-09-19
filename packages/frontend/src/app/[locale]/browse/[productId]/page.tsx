export const revalidate = 60

import { CartControls } from "@/components/ui/providers/cart-context"
import { getProduct } from "@/gateway/store"
import { cn, formatPrice, formatTitle, trimPrompt, urlIdToShopifyId } from "@/lib/utils"
import { Metadata, ResolvingMetadata } from "next"
import Preview from "./preview"
import { getUserProduct } from "@/gateway/tasks"
import DesignControls from "./design-controls"
import ClipboardBadge from "@/components/ui/badge-clipboard"
import { CopyIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "@/hooks/use-toast"
import { TooltipTrigger, TooltipContent, TooltipProvider, Tooltip } from "@/components/ui/tooltip"
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
      <div>
        <section className={"flex lg:flex-row flex-col"}>
          <Preview product={product} />
          <div className="p-16 lg:w-1/2 border-l bg-white min-h-[calc(100vh-5rem)]">
            <h1 className={cn("text-slate-800 font-medium text-4xl")}>{formatTitle(product.title)}</h1>
            <div className="pt-4 text-lg"><i>{formatPrice(product.priceRange.maxVariantPrice)}</i></div>
            <div className="flex flex-col gap-2 py-4">
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
        </section>
      </div>
    )
  }

  return <div className="flex flex-col min-h-screen justify-center text-center">Oops! Product not found</div>
}

export default ProductPage