"use client"
import { useEffect, useRef, useState } from "react"
import { Dialog } from "./dialog"
import { Popover, PopoverTrigger, PopoverContent } from "./popover"
import { SearchPredictionsQuery } from "../../../types/storefront.generated"
import { getSearchPredictions } from "@/gateway/store"
import { useParams } from "next/navigation"
import Image from "next/image"
import { useOutsideAlerter } from "./outside-alerter"
import { cn } from "@/lib/utils"

const SearchDialog = () => {
  const [searchOpen, setSearchOpen] = useState<boolean>(false)
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [searchPredictions, setSearchPredictions] = useState<SearchPredictionsQuery["predictiveSearch"] | null>(null)
  const searchTimeout = useRef<NodeJS.Timeout | undefined>(undefined)
  const params: { locale: string } | null = useParams()

  const [selectedIndex, setSelectedIndex] = useState<number>(0)

  const searchRef = useRef(null)
  const contentRef = useRef(null)
  useOutsideAlerter(contentRef, () => setSearchOpen(false))

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "/") {
        e.preventDefault()
        setSearchOpen((open) => !open)
      }
    }

    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  useEffect(() => {
    searchOpen && document.getElementById("search-bar")?.focus()
  }, [searchOpen])

  const sendQuery = async () => {
    setSearchPredictions(await getSearchPredictions(searchQuery, params?.locale ?? "AU"))
  }

  useEffect(() => {
    clearTimeout(searchTimeout.current)
    searchTimeout.current = setTimeout(sendQuery, 200)
  }, [searchQuery])

  return (
    <>
      <Popover open={searchOpen}>
        <PopoverTrigger>
          <input id="search-bar" ref={searchRef} className={cn("w-[478px] placeholder-gray-700  shrink-0 bg-transparent border-gray-700 border-b p-4 h-8")} placeholder="Press / to search" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} onClick={() => setSearchOpen(true)} />
        </PopoverTrigger>
        <PopoverContent ref={contentRef} className="w-[478px]" onOpenAutoFocus={(e) => e.preventDefault()}>
          <div className="w-full max-h-96 flex flex-col gap-2 overflow-y-scroll">
            {searchPredictions && searchPredictions.products.length > 0 ?
              searchPredictions.products.map((product, i) =>
                <div key={product.id} className={cn(selectedIndex == i && "border-4 border-gray-300", "flex flex-row gap-4 h-[calc(478px/3)] w-full items-center justify-center overflow-clip")}>
                  <div className="relative h-[478px] w-[calc(478px/3)]  rotate-90 overflow-clip rounded-md">
                    <Image
                      className="w-full h-auto object-cover"
                      alt="Thumbnail"
                      // width="80"
                      // height="240"
                      fill
                      objectFit="cover"
                      src={product?.featuredImage?.url}
                      sizes="20vw"
                    />
                    <div className="w-full h-full b-gray-300 animate-pulse"></div>
                  </div>
                </div>
              )
              :
              <div>No results</div>
            }
          </div>
        </PopoverContent>

      </Popover >
    </>
  )
}

export default SearchDialog