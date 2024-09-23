export const revalidate = 60

import { CartControls } from "@/components/ui/providers/cart-context"
import { getProduct } from "@/gateway/store"
import { cn, formatPrice, formatTitle, urlIdToShopifyId } from "@/lib/utils"
import { Metadata, ResolvingMetadata } from "next"
import Preview from "./preview"
import { getUserProduct } from "@/gateway/tasks"
import DesignControls from "./design-controls"
import PromptDescription from "./prompt-description"
import { Button } from "@/components/ui/button"
import { FeatherIcon, Layers3Icon, MoveVerticalIcon, PaintRoller, PaintRollerIcon, RulerIcon, ShellIcon } from "lucide-react"

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
      <div className="flex flex-col">
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
                <h3 className="pt-8">Specifications</h3>
                <div className="flex flex-col md:flex-row leading-loose flex-wrap pt-4 font-light">
                  <div className="flex md:flex-row md:basis-1/2 gap-2"><Layers3Icon className="stroke-1 " />Microfibre Suede Top</div>
                  <div className="flex md:flex-row md:basis-1/2 gap-2"><ShellIcon className="stroke-1" />Natural Rubber Bottom</div>
                  <div className="flex md:flex-row md:basis-1/2 gap-2"><PaintRollerIcon className="stroke-1" />Edge-to-Edge Print</div>
                  <div className="flex md:flex-row md:basis-1/2 gap-2"><FeatherIcon className="stroke-1" />Lightweight (64oz)</div>
                  <div className="flex md:flex-row md:basis-1/2 gap-2"><RulerIcon className="stroke-1" />Dimensions 70"x26"</div>
                  <div className="flex md:flex-row md:basis-1/2 gap-2"><MoveVerticalIcon className="stroke-1" />3mm thick</div>
                </div>
                <a href="/pages/about" className="py-2 font-semibold text-sm hover:underline">Learn more about our mats...</a>
              </div>
            </div>
          </div>
        </section>
      </div>
    )
  }

  return <div className="flex flex-col min-h-screen justify-center text-center">Oops! Product not found</div>
}

export default ProductPage