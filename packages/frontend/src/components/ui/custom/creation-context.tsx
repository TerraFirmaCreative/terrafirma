"use client"
import { createContext, useState } from "react"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "../dialog"
import { CheckCircle } from "lucide-react"
import { Button } from "../button"
import { AlertDialogCancel, AlertDialog, AlertDialogFooter, AlertDialogContent, AlertDialogAction, AlertDialogTitle } from "../alert-dialog"
import { useRouter } from "next/navigation"
import { beginTask, getUserProducts, pollTask, updateUserEmail } from "@/gateway/tasks"
import { TaskStatus, Product, ImagineData, TaskType } from "@prisma/client"
import { getProductsById } from "@/gateway/store"
import { GetProductQuery } from "@/lib/types/graphql"
import { Form, FormDescription } from "../form"
import { SubmitHandler, useForm } from "react-hook-form"
import * as yup from "yup"
import { yupResolver } from "@hookform/resolvers/yup"

export const CreationContext = createContext<{
  create: (prompt: string) => Promise<void>,
  vary: (index: number, prompt: string) => Promise<void>,
  refreshProducts: () => Promise<void>
  inProgress: boolean,
  items: ProductUnion[]
}
>({
  create: async (prompt: string) => { },
  vary: async (index: number, prompt: string) => { },
  refreshProducts: async () => { },
  inProgress: false,
  items: []
}
)

export type ProductUnion = ({ imagineData: ImagineData | null, shopifyProduct: GetProductQuery['product'] | undefined } & Product | null)

const emailSchema = yup.object({
  email: yup.string().email().optional()
})

function CreationProvider({ children }: { children: React.ReactNode }) {
  const [inProgress, setInProgress] = useState<boolean>(false)
  const [products, setProducts] = useState<ProductUnion[]>([])
  const [confirmationOpen, setConfirmationOpen] = useState<boolean>(false)
  const [finishedOpen, setFinishedOpen] = useState<boolean>(false)
  const [errorOpen, setErrorOpen] = useState<boolean>(false)

  const form = useForm<yup.InferType<typeof emailSchema>>({
    resolver: yupResolver(emailSchema)
  })

  const onSubmit: SubmitHandler<yup.InferType<typeof emailSchema>> = (data) => {
    if (data.email) {
      updateUserEmail(data.email)
    }
  }

  const router = useRouter()

  const refreshProducts = async () => {

    const userProducts = (await getUserProducts())
    const shopifyProducts = await getProductsById(userProducts.map((product) => product.shopifyProductId))
    const productUnions: ProductUnion[] = userProducts.slice(0, Math.min(shopifyProducts.length, userProducts.length)).map((userProduct, i) => {
      // TODO: Check this! index needs to match when creating variants
      return {
        ...userProduct,
        shopifyProduct: shopifyProducts[i].node
      }
    })

    setProducts(productUnions)
  }

  const poll = async (taskId: string) => {
    const taskStatus = await pollTask(taskId)

    switch (taskStatus) {
      case TaskStatus.Complete:
        await refreshProducts()
        setInProgress(false)
        setConfirmationOpen(false)
        setFinishedOpen(true)
        break
      case TaskStatus.Failed:
        setInProgress(false)
        setErrorOpen(true)
        break
      default:
        setTimeout(poll, 5000, taskId)
        break
    }
  }

  const create = async (prompt: string) => {
    beginTask({
      prompt: prompt,
      type: TaskType.Imagine
    }).then((res) => {
      if (res.status !== TaskStatus.Failed) {
        setConfirmationOpen(true)
        setInProgress(true)
        setTimeout(poll, 5000, res.id)
      }
      else {
        setInProgress(false)
        setErrorOpen(true)
      }
    })
    setInProgress(true)
  }

  const vary = async (index: number, prompt: string) => {
    beginTask({
      prompt: prompt,
      srcImagineData: products.at(index)?.imagineData!,
      index: index + 1,
      type: TaskType.ImagineVariants
    }).then((res) => {
      if (res.status !== TaskStatus.Failed) {
        setConfirmationOpen(true)
        setInProgress(true)
        setTimeout(poll, 5000, res.id)
      }
      else {
        setInProgress(false)
        setErrorOpen(true)
      }
    })
    setInProgress(true)
  }


  return (
    <>
      <CreationContext.Provider value={{
        create: create,
        vary: vary,
        refreshProducts: refreshProducts,
        inProgress: inProgress,
        items: products
      }}>
        {children}
      </CreationContext.Provider>

      <Dialog open={confirmationOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <DialogHeader>
                <DialogTitle>{"We're working on your design"}</DialogTitle>
              </DialogHeader>
              <div className="flex flex-col items-center py-8 text-center gap-2">
                <CheckCircle
                  size="70"
                  strokeWidth={0.5}
                  className=" stroke-green-500"
                />
                <h1 className="text-xl">Thank you</h1>
                <p className="text-gray-500">
                  {"We'll let you know when it's ready. In the meantime, feel free to explore our gallery."}
                </p>
                <h2 className="text-lg pt-2">{"Don't want to wait?"}</h2>
                <input {...form.register('email')} className="w-full border-gray-400 border rounded-md p-2" placeholder="Email"></input>
                <FormDescription className="text-left">{"Enter your email and we'll notify you when it's done."}</FormDescription>
              </div>
              <DialogFooter>
                <Button type="submit" onClick={() => {
                  setConfirmationOpen(false)
                  document.getElementById("browse-section")?.scrollIntoView()
                }}>Got it</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={finishedOpen}>
        <AlertDialogContent className="sm:max-w-[425px]">
          <div className="text-center flex flex-col gap-4">
            <h1 className="text-4xl">🥳</h1>
            <AlertDialogTitle>Hooray!</AlertDialogTitle>
            <p className="text-gray-500">
              Your designs are ready. Click the button below to see the results.
            </p>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setFinishedOpen(false)}>
              View Later
            </AlertDialogCancel>
            <AlertDialogAction onClick={() => {
              setFinishedOpen(false)
              router.push(`/designs`)
            }}>View Now
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={errorOpen}>
        <AlertDialogContent className="sm:max-w-[425px]">
          <div className="text-center flex flex-col gap-4">
            <h1 className="text-4xl">😧</h1>
            <AlertDialogTitle>Oh no!</AlertDialogTitle>
            <p className="text-gray-500">
              {"Something went wrong. We're sorry about the inconvenience, and are actively working to fix it. Please try again in a few minutes."}
            </p>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setErrorOpen(false)}>
              Close
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {inProgress &&
        <div className="fixed z-10 bottom-5 left-5 right-5">
          <div className="flex flex-row items-center w-fit mx-auto justify-start gap-4 p-4 bg-white border border-gray-300 rounded-md shadow-gray-600 drop-shadow-lg">
            <div>{"We're working on your design..."}</div>
            <div className="animate-spin border-r-2 border-t-2 h-6 min-w-6 border-black rounded-[50%]" />
          </div>
        </div>
      }
    </>
  )
}

export default CreationProvider