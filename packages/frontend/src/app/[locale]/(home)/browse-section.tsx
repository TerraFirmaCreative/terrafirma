"use client"
import { useEffect, useState } from "react"
import { FilterParams, ProductEdgeWithPrompt, getPaginatedProducts } from "@/gateway/store"
import { GetCollectionsQuery, PaginatedProductsQuery } from "@/lib/types/graphql"
import { useParams } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import ProductTile from "@/components/ui/product-tile"

const BrowseProducts = ({ initialProducts, collections }: {
  initialProducts?: ProductEdgeWithPrompt[],
  collections?: GetCollectionsQuery["collections"]["nodes"]
}) => {
  const [products, setProducts] = useState<PaginatedProductsQuery["products"]["edges"]>(initialProducts ?? [])
  const [filterParams, setFilterParams] = useState<FilterParams>({})
  const params: { locale: string } = useParams()
  const { toast } = useToast()

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
      }, params?.locale ?? "AU").then(
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
          {collections?.at(0)?.products.nodes.map((product) => <ProductTile key={product.id} product={product} />)}

          {products.map((product) => <ProductTile key={product.cursor} product={product.node} />)}
        </div >
      </section >
    </>
  )
}

export default BrowseProducts
