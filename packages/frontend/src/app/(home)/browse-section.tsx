"use client"
import { useEffect, useState } from "react"
import Image from "next/image"
import { FilterParams, getPaginatedProducts } from "@/gateway/store"
import { PaginatedProductsQuery } from "@/lib/types/graphql"
import { currencySymbol, formatPrice, shopifyIdToUrlId } from "@/lib/utils"
import Link from "next/link"
import { AspectRatio } from "@radix-ui/react-aspect-ratio"

const BrowseProducts = ({ initialProducts }: { initialProducts?: PaginatedProductsQuery["products"]["edges"] }) => {
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
          {products.map((product: PaginatedProductsQuery["products"]["edges"][0]) =>
            <Link key={product.node.id} href={`/browse/${shopifyIdToUrlId(product.node.id)}`} >
              <div key={product.cursor} className="rounded-lg overflow-clip relative border">
                <AspectRatio ratio={1 / 3}>
                  <Image
                    src={product.node.featuredImage?.url}
                    alt={product.node.title}
                    fill
                    sizes="20vw"
                  />
                  <div className="relative bg-slate-800 text-center p-4 w-full h-full bg-opacity-0 hover:bg-opacity-50 cursor-pointer transition-all">
                    <div className="flex flex-col h-full justify-center my-auto text-white opacity-0 hover:opacity-100 transition-all mix-blend-difference">
                      <div className="flex flex-col justify-center text-4xl font-bold h-3/5">
                        {product.node.title.toUpperCase().split("[")[0].split("").filter((char: string) => char != '"').join("")}
                      </div>
                      <div className="text-xl h-1/5">{formatPrice(product.node.priceRange.maxVariantPrice)}</div>
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
