export const revalidate = 60

import ImageMagnifier from "@/components/ui/image-magnifier"
import { CartControls } from "@/components/ui/store/cart-context"
import { getProduct } from "@/gateway/store"
import { formatPrice, formatTitle, urlIdToShopifyId } from "@/lib/utils"
import { Metadata, ResolvingMetadata } from "next"
import Link from "next/link"

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
      <section className="pt-20 flex lg:flex-row flex-col">
        <div className="flex flex-col p-8 justify-center items-center lg:w-1/2">
          <div className="relative w-[250px] h-[750px] drop-shadow-md">
            <Link href={product?.featuredImage?.url} target="_blank">
              <ImageMagnifier
                alt={`Product image for ${params.productId}`}
                src={product.featuredImage?.url}
                fill
                sizes={"20vw"}
                className="rounded-lg cursor-zoom-in"
              />
            </Link>
          </div>
        </div>
        <div className="p-16 lg:w-1/2 border-l bg-white">
          <h1 className=" text-slate-800 font-semibold text-4xl">{formatTitle(product.title)}</h1>
          <div className="pt-4 text-lg"><i>{formatPrice(product.priceRange.maxVariantPrice)}</i></div>
          <div className="flex flex-col gap-2 py-4">
            <CartControls variantId={product.variants.edges[0].node.id} />
            <p className=" font-light leading-relaxed py-4">
              {product.description}
            </p>
          </div>
        </div>
      </section>
    )
  }

  return <div className="flex flex-col min-h-screen justify-center text-center">Oops! Product not found</div>
}

export default ProductPage