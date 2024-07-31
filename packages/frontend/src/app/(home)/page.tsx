export const revalidate = 60

import { getPrompts } from "@/gateway/custom"
import BrowseProducts from "./browse-section"
import PromptForm from "./prompt-form"
import { getCollections, getPaginatedProducts } from "@/gateway/store"
import { cookies } from "next/headers"

export default async function HomePage() {
  const _cookies = cookies() // Disable SSG
  const [initialProducts, prompts, featuredCollections] = await Promise.all([
    getPaginatedProducts({}),
    getPrompts(),
    getCollections("title:='FEATURED Home'")
  ])

  return (
    <div className="bg-gradient-to-b from-[#eda96d] to-orange-50 to-[50vh] flex w-full min-h-screen flex-col items-center justify-start border-b pt-20">
      <PromptForm prompts={prompts} />
      <div className="flex flex-col justify-between w-full">
        <div className="text-gray-600 p-8">
          <span className="underline">{"Created by others >"}</span>
        </div>
        <BrowseProducts initialProducts={initialProducts} collections={featuredCollections} />
      </div>
    </div>
  )
}
