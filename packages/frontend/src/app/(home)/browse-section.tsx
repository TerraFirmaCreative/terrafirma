"use client"
import { useEffect, useState } from "react"
import Image from "next/image"
import { FilterParams, getPaginatedProducts } from "@/gateway/store"
import { GetCollectionsQuery, PaginatedProductsQuery } from "@/lib/types/graphql"
import { currencySymbol, formatPrice, shopifyIdToUrlId } from "@/lib/utils"
import Link from "next/link"
import { AspectRatio } from "@radix-ui/react-aspect-ratio"

const BrowseProducts = ({ initialProducts, collections }: {
  initialProducts?: PaginatedProductsQuery["products"]["edges"],
  collections?: GetCollectionsQuery["collections"]["nodes"]
}) => {
  const [products, setProducts] = useState<PaginatedProductsQuery["products"]["edges"]>(initialProducts ?? [])
  const [filterParams, setFilterParams] = useState<FilterParams>({})


  useEffect(() => {
    window.addEventListener('scroll', handleScroll)
    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [products])

  const handleScroll = () => {
    if ((window.scrollY + window.innerHeight) > document.documentElement.scrollHeight - 500) {
      window.removeEventListener('scroll', handleScroll)
      fetchMoreProducts()
    }
  }

  const fetchMoreProducts = () => {
    if (products.length > 9) {
      getPaginatedProducts({
        cursor: products.at(-1)?.cursor,
        ...filterParams
      }).then(
        (ps) => {
          setProducts([...products, ...ps ?? []])
        }
      )
    }
  }

  return (
    <>
      <section id="browse-section">
        <div
          className="
            lg:grid-cols-[repeat(7,1fr)]
            md:grid-cols-[repeat(5,1fr)]
            sm:grid-cols-[repeat(2,1fr)]
            grid-cols-[repeat(2,1fr)]
            grid justify-center grid-flow-row-dense w-full gap-2 h-full p-2
          "
        >
          {collections?.at(0)?.products.nodes.map((product) =>
            <Link key={product.id} href={`/browse/${shopifyIdToUrlId(product.id)}`}>
              <div key={product.id} className="overflow-clip relative border">
                <AspectRatio ratio={1 / 3}>
                  <Image
                    src={product.featuredImage?.url}
                    alt={product.title}
                    fill
                    sizes="20vw"
                  />
                  <div className="relative text-center w-full h-full bottom-0 opacity-0 hover:opacity-100 cursor-pointer transition-all">
                    <div className="flex flex-col h-full justify-end my-auto text-white transition-all">
                      <div className="bg-slate-900 py-6 flex flex-col justify-center">
                        <div className="flex font-serif flex-col justify-center text-wrap text-2xl font-bold">
                          {product.title.toUpperCase().split("[")[0].split("").filter((char: string) => char != '"').join("")}
                        </div>
                        <div className="text-xl h-1/5">{formatPrice(product.priceRange.maxVariantPrice)}</div>
                      </div>
                    </div>
                  </div>
                </AspectRatio>
              </div>
            </Link>
          )}

          {products.map((product) =>
            <Link key={product.node.id} href={`/browse/${shopifyIdToUrlId(product.node.id)}`}>
              <div key={product.cursor} className="overflow-clip relative border">
                <AspectRatio ratio={1 / 3}>
                  <Image
                    src={product.node.featuredImage?.url}
                    alt={product.node.title}
                    fill
                    sizes="20vw"
                  />
                  <div className="relative text-center w-full h-full bottom-0 opacity-0 hover:opacity-100 cursor-pointer transition-all">
                    <div className="flex flex-col h-full justify-end my-auto text-white transition-all">
                      <div className="bg-slate-900 py-6 flex flex-col justify-center">
                        <div className="flex font-serif flex-col justify-center text-wrap text-2xl font-bold">
                          {product.node.title.toUpperCase().split("[")[0].split("").filter((char: string) => char != '"').join("")}
                        </div>
                        <div className="text-xl h-1/5">{formatPrice(product.node.priceRange.maxVariantPrice)}</div>
                      </div>
                    </div>
                  </div>
                </AspectRatio>
              </div>
            </Link>
          )
          }
        </div >
      </section>
    </>
  )
}

export default BrowseProducts
