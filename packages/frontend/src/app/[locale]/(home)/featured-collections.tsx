"use client"

import Responsive from "@/components/ui/util/responsive"
import { GetCollectionsQuery } from "@/lib/types/graphql"
import { cn } from "@/lib/utils"
import { ArrowRightIcon } from "lucide-react"
import Image from 'next/image'
import Link from "next/link"

const FeaturedCollections = ({ collections }: { collections: GetCollectionsQuery["collections"]["nodes"] }) => {
  return (
    <div className="flex flex-col justify-start pt-16">
      {collections.map((collection, i) =>
        <Responsive
          key={collection.id}
          desktop={<div className={cn("flex flex-row justify-between md:w-3/5 w-full bg-white", i % 2 == 0 ? "self-start" : "self-end")}>
            <div className="w-full">
              <h1 className="text-5xl font-serif py-16 px-4">{collection.title.split("FEATURED ").at(1)}</h1>
              <p className="max-w-xl p-4">{collection.description}</p>
            </div>
            <div className="relative w-full bg-black overflow-clip">
              <div className="cursor-pointer relative w-[200%] bg-black h-full z-50 -translate-x-1/2 hover:translate-x-0 bg-opacity-0 hover:bg-opacity-50 transition-all">
                <ArrowRightIcon className="w-1/2 h-full stroke-white stroke-[0.2]" />
              </div>
              {collection.image && <Image className="object-cover" fill alt="Cover Image" src={collection.image?.url} />}
            </div>
          </div>}
        />
      )}
    </div>
  )
}

export default FeaturedCollections