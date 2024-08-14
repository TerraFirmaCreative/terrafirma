"use client"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { cn, formatTitle } from "@/lib/utils"
import Responsive from "./util/responsive"
import { AlignLeftIcon, ChevronDown, ShoppingCartIcon } from "lucide-react"
import { Sheet, SheetClose, SheetContent, SheetTrigger } from "./sheet"
import { ReactNode, useContext, useEffect, useRef, useState } from "react"
import { CartContext } from "./providers/cart-context"
import { Popover, PopoverContent, PopoverTrigger } from "./popover"
import { Command, CommandDialog, CommandEmpty, CommandInput, CommandItem, CommandList, CommandGroup, CommandSeparator } from "./command"
import { getSearchPredictions } from "@/gateway/store"
import { SearchPredictionsQuery } from "../../../types/storefront.generated"
import Image from "next/image"

type MenuItem = {
  href: string,
  text: string,
  icon?: React.ReactNode
}

const MainMenu = ({ menuItems, moreMenuItems }: { menuItems: MenuItem[], moreMenuItems?: MenuItem[] }) => {
  const pathname = usePathname()!
  const { setCartOpen } = useContext(CartContext)
  const [opaque, setOpaque] = useState<boolean>(false)
  const [searchOpen, setSearchOpen] = useState<boolean>(false)
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [commandQuery, setCommandQuery] = useState<string>("")


  const [searchPredictions, setSearchPredictions] = useState<SearchPredictionsQuery["predictiveSearch"] | null>(null)
  const searchTimeout = useRef<NodeJS.Timeout | undefined>(undefined)

  const updateScrolled = async () => {
    setOpaque(pathname.split("/").length > 2 || window.scrollY > 50)
  }

  const sendQuery = async () => {
    console.log("  setSearchPredictions(await getSearchPredictions(searchQuery))")
    setSearchPredictions(await getSearchPredictions(searchQuery))
  }

  useEffect(() => {
    clearTimeout(searchTimeout.current)
    searchTimeout.current = setTimeout(sendQuery, 500)
  }, [searchQuery])

  useEffect(() => {
    console.log("setCommandQuery(searchQuery)")
    setCommandQuery(searchQuery)
  }, [searchPredictions])

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "j" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setSearchOpen((open) => !open)
      }
    }

    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  useEffect(() => {
    updateScrolled()
    window.addEventListener('scroll', updateScrolled)

    return () => {
      window.removeEventListener('scroll', updateScrolled)
    }
  }, [pathname])

  const DropDownMenu = ({ children, text }: { children: ReactNode, text: string }) => {
    const [open, setOpen] = useState(false)

    return (
      <Popover open={open}>
        <PopoverTrigger onMouseEnter={() => setOpen(true)} onClick={() => setOpen(!open)}>
          <div className={cn(opaque ? "text-gray-700" : "text-zinc-50", "flex flex-row items-center gap-1 px-4 hover:text-black hover:underline")}>{text}<ChevronDown size="16" className={cn("transition-transform", open && "rotate-180")} /></div>
        </PopoverTrigger>
        <PopoverContent onMouseLeave={() => setOpen(false)}>
          <div className="flex flex-col gap-2" onClick={() => setOpen(false)}>
            {children}
          </div>
        </PopoverContent>
      </Popover>
    )
  }
  console.log(searchPredictions)
  return (
    <>
      <header id="header-bar" className={cn(pathname.split("/").length > 2 && "border-b", opaque && "bg-zinc-50", "transition-colors duration-700 w-full fixed top-0 h-20 flex flex-row items-center bg-opacity-70 backdrop-blur-md px-8 z-50")}>
        <Responsive
          desktop={
            <div className="flex flex-row justify-between items-center w-full" >
              <div>
                {menuItems.map((item, i) =>
                  <Link key={i} href={item.href} className={cn(opaque ? "text-gray-700 " : "text-zinc-50", "px-4 hover:text-black hover:underline", (pathname.split("/").at(2) ?? "") == item.href.split("/").at(1) && "text-black font-semibold")}>
                    {item.text}
                  </Link>
                )}
                {moreMenuItems && <DropDownMenu text="More">
                  {moreMenuItems.map((item, i) =>
                    <Link key={i} href={item.href} className={cn("p-4 hover:bg-slate-100 rounded-md text-gray-700 hover:text-black transition-colors", (pathname.split("/").at(2) ?? "") == item.href.split("/").at(1) && "text-black font-semibold")}>
                      {item.text}
                    </Link>)}
                </DropDownMenu>}
              </div>
              <div>
                <ShoppingCartIcon className="cursor-pointer" strokeWidth={1} onClick={() => setCartOpen(true)} />
              </div>
            </div >
          }
          mobile={
            < Sheet >
              <div className="flex flex-row w-full justify-between">
                <div className="flex flex-row gap-4">
                  <SheetTrigger asChild>
                    <AlignLeftIcon strokeWidth="1" className="my-auto" />
                  </SheetTrigger>
                  <span className="text-lg font-light">Terra Firma Creative</span>
                </div>
                <div>
                  <ShoppingCartIcon className="cursor-pointer" strokeWidth={1} onClick={() => setCartOpen(true)} />
                </div>
              </div>
              <SheetContent side="left">
                <div className="flex flex-col gap-2 mt-8 items-between">
                  {menuItems.map((item, i) =>
                    <SheetClose key={i} asChild>
                      <Link href={item.href} className={cn("text-lg text-gray-700 hover:text-black hover:underline", (pathname.split("/").at(2) ?? "") == item.href.split("/").at(1) && "text-black font-semibold")}>
                        <div className="flex flex-row justify-start gap-2"><div className="my-auto">{item.icon}</div>{item.text}</div>
                      </Link>
                    </SheetClose>
                  )}
                  {moreMenuItems &&
                    <div className="flex flex-col gap-2 mt-8 items-start">
                      <h2 className={cn("font-bold")}>More</h2>
                      {
                        moreMenuItems.map((item, i) =>
                          <SheetClose key={i} asChild>
                            <Link href={item.href} className={cn("text-lg text-gray-700 hover:text-black hover:underline", (pathname.split("/").at(2) ?? "") == item.href.split("/").at(1) && "text-black font-semibold")}>
                              <div className="flex flex-row justify-start gap-2"><div className="my-auto">{item.icon}</div>{item.text}</div>
                            </Link>
                          </SheetClose>
                        )
                      }
                    </div>
                  }
                </div>
              </SheetContent>
            </Sheet >
          }
        />
      </header >

      <CommandDialog open={searchOpen} onOpenChange={setSearchOpen}>
        <CommandInput placeholder="Search anything..." value={commandQuery} visibleValue={searchQuery} onVisibleValueChange={(e) => { setSearchQuery(e.target.value) }} />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Suggestions">
            {searchPredictions?.queries.map((query) =>
              <CommandItem key={query.text}><span>{query.styledText}</span></CommandItem>
            )}
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Products">
            {searchPredictions?.products.map((product) =>
              <CommandItem key={product.id}>
                {product?.featuredImage?.url && <>
                  <Image
                    className="m-2"
                    alt="Thumbnail"
                    width="20"
                    height="90"
                    src={product?.featuredImage?.url}
                    sizes="20px"
                  />
                </>}
                <span>{formatTitle(product.title)}</span>
              </CommandItem>
            )}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  )
}

export default MainMenu