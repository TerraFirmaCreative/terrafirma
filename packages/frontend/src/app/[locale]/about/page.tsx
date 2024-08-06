import PaginatedProducts from "@/components/app/browse/paginated-products"
import HeroCarousel from "@/components/ui/custom/hero-carousel"
import { SelectGroup, SelectTrigger, Select, SelectContent, SelectLabel, SelectValue, SelectItem } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { getPaginatedProducts } from "@/gateway/store"
import { Label } from "@radix-ui/react-select"
import { cookies } from "next/headers"

const BrowsePage = async ({ params }: { params: { locale: string } }) => {
  const _cookies = cookies() // Disable SSG
  const initialProducts = await getPaginatedProducts({}, params.locale)

  return (
    <>
      <section className="py-20 border-b">
        <h1 className="text-5xl font-extralight text-gray-700 p-12">Best Sellers</h1>
        <HeroCarousel />
      </section>
      <PaginatedProducts initialProducts={initialProducts} />
    </>
  )
}

export default BrowsePage