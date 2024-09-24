export const revalidate = 60

import { getPrompts } from "@/gateway/custom"
import BrowseProducts from "./browse-section"
import PromptForm from "./prompt-form"
import { getCollections, getPaginatedProducts } from "@/gateway/store"
import { cookies } from "next/headers"
import FeaturedCollections from "./featured-collections"
import Link from "@/components/ui/util/link-locale"


export default async function HomePage({ params }: { params: { locale: string } }) {
  const _cookies = cookies() // Disable SSG
  const [initialProducts, prompts, browseCollections, featuredCollections] = await Promise.all([
    getPaginatedProducts({}, params.locale),
    getPrompts(),
    getCollections("title:='Home'", params.locale),
    getCollections("title:='FEATURED*'", params.locale)
  ])

  return (
    <div className="bg-gradient-to-b from-[#eda96d] to-orange-50 to-[50vh] flex w-full min-h-screen flex-col items-center justify-start border-b -mt-20 pt-20">
      <PromptForm prompts={prompts} />
      <div className="flex flex-col justify-between w-full">
        <FeaturedCollections collections={featuredCollections} />
        <div className="text-gray-600 p-8">
          <Link href="/browse"><span className="underline">{`Created by others >`}</span></Link>
        </div>
        <BrowseProducts initialProducts={initialProducts} collections={browseCollections} />
      </div>
    </div>
  )
}
