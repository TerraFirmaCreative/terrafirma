"use client"
import { useEffect, useState } from "react"
import Image from "next/image"
import { FilterParams, getPaginatedProducts } from "@/gateway/store"
import { PaginatedProductsQuery, ProductSortKeys } from "@/lib/types/graphql"
import { formatPrice, shopifyIdToUrlId } from "@/lib/utils"
import Link from "next/link"
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { FormItem } from "@/components/ui/form"
import { Toggle } from "@/components/ui/toggle"
import { ArrowDownWideNarrowIcon, ArrowUpNarrowWideIcon } from "lucide-react"
import { TooltipContent, Tooltip, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import Responsive from "@/components/ui/util/responsive"
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer"
import { AspectRatio } from "@/components/ui/aspect-ratio"
import { useParams } from "next/navigation"

const FilterControls = ({ filterParams, filterSubmit }: { filterParams: FilterParams, filterSubmit: (kv: any) => void }) => {
  return (
    <div className="mt-8 flex flex-col gap-4">
      <div>
        <div className="flex flex-row justify-between py-2">
          <label className="block py-2">Sort</label>
          <TooltipProvider>
            <Tooltip>
              <FormItem>
                <TooltipTrigger>
                  <Toggle
                    className="stroke-1"
                    defaultPressed={filterParams.reverse ?? false}
                    onPressedChange={(value) => filterSubmit({ reverse: !(filterParams.reverse ?? true) })}
                  >
                    {filterParams.reverse ? <ArrowDownWideNarrowIcon strokeWidth="1" /> : <ArrowUpNarrowWideIcon strokeWidth="1" />}
                  </Toggle>
                </TooltipTrigger>
              </FormItem>
              <TooltipContent>{filterParams.reverse ? "Descending" : "Ascending"}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <Select defaultValue={ProductSortKeys.CreatedAt} onValueChange={(value) => filterSubmit({ sortKey: value })}>
          <SelectTrigger>
            <SelectValue placeholder="Sort" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Sort</SelectLabel>
              <SelectItem value={ProductSortKeys.CreatedAt}>Date Created</SelectItem>
              <SelectItem value={ProductSortKeys.BestSelling}>Best Selling</SelectItem>
              <SelectItem value={ProductSortKeys.Price}>Price</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="block py-2">Collection</label>
        <Select defaultValue="Public" onValueChange={(value) => filterSubmit({ productTag: value })}>
          <SelectTrigger>
            <SelectValue placeholder="Select Collection" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Collection</SelectLabel>
              <SelectItem value="Public">All</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="block py-2">Price</label>
        <Slider step={10} defaultValue={[0, 200]} max={200} onValueChange={(value) => filterSubmit({ priceRange: value })} />
        <label className="text-center block py-2 text-gray-600">${filterParams.priceRange?.at(0) ?? 0} - ${filterParams.priceRange?.at(1) ?? 200}</label>
      </div>
    </div>
  )
}

const PaginatedProducts = ({ initialProducts }: { initialProducts?: PaginatedProductsQuery["products"]["edges"] }) => {
  const [products, setProducts] = useState<PaginatedProductsQuery["products"]["edges"]>(initialProducts ?? [])
  const [filterParams, setFilterParams] = useState<FilterParams>({})

  const params: { locale: string } = useParams()

  useEffect(() => {
    window.addEventListener('scroll', handleScroll)
    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [products])

  const handleScroll = () => {
    if ((window.scrollY + window.innerHeight) > document.documentElement.scrollHeight - 100) {
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

  const filterSubmit = (kv: any) => {
    setFilterParams({ ...filterParams, ...kv })
  }

  useEffect(() => {
    getPaginatedProducts({ ...filterParams }, params?.locale ?? "AU").then(products => { setProducts(products ?? []) })
  }, [filterParams])

  return (
    <div className="-mt-20 pt-20 w-full bg-zinc-50">
      <Responsive
        desktop={
          <section className="sticky float-left pt-20 px-8 top-0 w-60 min-h-screen">
            <FilterControls filterParams={filterParams} filterSubmit={filterSubmit} />
          </section >
        }

        mobile={
          <Drawer>
            <DrawerTrigger>
              <div className="fixed z-50 bottom-0 w-full border-t bg-slate-50 py-4">
                Filter
              </div>
            </DrawerTrigger>
            <DrawerContent>
              <DrawerHeader>
                <DrawerTitle>Filter</DrawerTitle>
                <DrawerDescription>{"Apply filters to help you find what's right for you."}</DrawerDescription>
              </DrawerHeader>
              <div className="px-8">
                <FilterControls filterParams={filterParams} filterSubmit={filterSubmit} />
              </div>
            </DrawerContent>
          </Drawer>
        }
      />

      <section className="sm:ml-60 ">
        <h1 className="text-5xl font-light text-gray-700 px-8 pt-8">Browse</h1>
        {/* <div className="p-16 grid grid-cols-[repeat(auto-fill,250px)] justify-center sm:justify-start grid-flow-row-dense w-full gap-6 h-full"> */}
        <div
          className="
            xl:grid-cols-[repeat(7,1fr)]
            lg:grid-cols-[repeat(5,1fr)]
            md:grid-cols-[repeat(3,1fr)]
            sm:grid-cols-[repeat(2,1fr)]
            grid-cols-[repeat(2,1fr)]
            grid justify-center grid-flow-row-dense w-full gap-2 h-full p-8
          "
        >
          {products.map((product: PaginatedProductsQuery["products"]["edges"][0]) => {
            return <Link key={product.node.id} href={`/browse/${shopifyIdToUrlId(product.node.id)}`}>
              <div key={product.cursor} className="bg-white overflow-clip rounded-md relative border">
                <AspectRatio ratio={1 / 3}>
                  <Image
                    src={product.node.featuredImage?.url}
                    alt={product.node.title}
                    fill
                    sizes="(max-width: 640px) 80vw, (max-width: 800px) 40vw, 20vw" />
                  <div className="relative text-center w-full h-full bottom-0 opacity-0 hover:opacity-100 cursor-pointer transition-all">
                    <div className="flex flex-col h-full  justify-end my-auto text-white transition-all">
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
          }
          )
          }
        </div >
      </section>
    </div>
  )
}

export default PaginatedProducts
