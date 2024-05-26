export const revalidate = 60

import BrowseProducts from "./browse-section"
import PromptForm from "./prompt-form"
import { getPaginatedProducts } from "@/gateway/store"
import { cookies } from "next/headers"

export default async function HomePage() {
  const _cookies = cookies() // Disable SSG
  const initialProducts = await getPaginatedProducts({})

  return (
    <div className="flex w-full min-h-screen flex-col items-center justify-start pt-20 border-b">
      <PromptForm />
      <div className="flex flex-col justify-between w-full">
        <div className="text-gray-600 p-8">
          <span className="underline">{"Created by others >"}</span>
        </div>
        <BrowseProducts initialProducts={initialProducts} />
      </div>
    </div>
  )
}
