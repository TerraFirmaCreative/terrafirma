import PaginatedProducts from "@/components/ui/paginated-products"
import { getPaginatedProducts } from "@/gateway/store"
import { cookies } from "next/headers"

const BrowsePage = async ({ params }: { params: { locale: string } }) => {
  const _cookies = cookies() // Disable SSG
  const initialProducts = await getPaginatedProducts({}, params.locale)

  return (
    <PaginatedProducts initialProducts={initialProducts} />
  )
}

export default BrowsePage