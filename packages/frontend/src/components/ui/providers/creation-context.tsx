"use client"
import { createContext, useEffect, useRef, useState } from "react"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "../dialog"
import { CheckCircle } from "lucide-react"
import { Button } from "../button"
import { AlertDialogCancel, AlertDialog, AlertDialogFooter, AlertDialogContent, AlertDialogAction, AlertDialogTitle } from "../alert-dialog"
import { useParams, useRouter } from "next/navigation"
import { beginTask, getUserProducts, pollTask, updateTaskShouldEmailUser, updateUserEmail } from "@/gateway/tasks"
import { TaskStatus, Product, ImagineData, TaskType } from "@prisma/client"
import { getProductsById } from "@/gateway/store"
import { GetProductsByIdQuery } from "@/lib/types/graphql"
import { Form, FormDescription, FormField, FormLabel } from "../form"
import { SubmitHandler, useForm } from "react-hook-form"
import * as yup from "yup"
import { yupResolver } from "@hookform/resolvers/yup"
import { Progress } from "../progress"
import { getUser } from "@/gateway/custom"
import { Checkbox } from "../checkbox"

export const CreationContext = createContext<{
  create: (prompt: string) => Promise<void>,
  vary: (index: number, imagineData: ImagineData, prompt: string) => Promise<void>,
  refreshProducts: () => Promise<void>
  inProgress: boolean,
  products: ProductWithImagineData[],
  progress: number,
}
>({
  create: async (prompt: string) => { },
  vary: async (index: number, imagineData: ImagineData, prompt: string) => { },
  refreshProducts: async () => { },
  inProgress: false,
  products: [],
  progress: 0
}
)

export type ProductWithImagineData = ({ imagineData: ImagineData | null, shopifyProduct: GetProductsByIdQuery["nodes"][0] | undefined } & (Product | null))

const emailSchema = yup.object({
  email: yup.string().email().optional(),
  shouldEmail: yup.bool().optional().default(false)
})

function CreationProvider({ children }: { children: React.ReactNode }) {
  const [inProgress, setInProgress] = useState<boolean>(false)
  const [products, setProducts] = useState<ProductWithImagineData[]>([])
  const [confirmationOpen, setConfirmationOpen] = useState<boolean>(false)
  const [finishedOpen, setFinishedOpen] = useState<boolean>(false)
  const [errorOpen, setErrorOpen] = useState<boolean>(false)
  const [progress, setProgress] = useState<number>(0)
  const [userEmail, setUserEmail] = useState<string | null | undefined>()
  const [currentTaskId, setCurrentTaskId] = useState<string | undefined | null>()

  const pollTimeoutRef = useRef<NodeJS.Timeout>()

  const { locale }: { locale: string } = useParams()

  const router = useRouter()

  const form = useForm<yup.InferType<typeof emailSchema>>({
    resolver: yupResolver(emailSchema)
  })

  const onSubmit: SubmitHandler<yup.InferType<typeof emailSchema>> = (data) => {
    if (data.email && !userEmail) {
      setUserEmail(data.email)
      updateUserEmail(data.email)
      currentTaskId && updateTaskShouldEmailUser(currentTaskId, true)
    }
    if (userEmail && data.shouldEmail && currentTaskId) {
      updateTaskShouldEmailUser(currentTaskId, data.shouldEmail)
    }
  }


  const refreshProducts = async () => {
    const userProducts = (await getUserProducts())
    const shopifyProducts = await (await getProductsById(userProducts.map((product) => product.shopifyProductId), locale ?? "AU"))
    console.log(userProducts, shopifyProducts)
    let shopifyProductsMap: Map<string, GetProductsByIdQuery["nodes"][0]> = new Map<string, GetProductsByIdQuery["nodes"][0]>
    for (const shopifyProduct of shopifyProducts) {
      shopifyProductsMap.set(shopifyProduct?.id!, shopifyProduct)
    }

    const productsWithImagineData: ProductWithImagineData[] = userProducts.slice(0, Math.min(shopifyProducts.length, userProducts.length)).map((userProduct, i) => {
      return {
        ...userProduct,
        shopifyProduct: shopifyProductsMap.get(userProduct.shopifyProductId)
      }
    }).sort((a, b) => b.createdAt.valueOf() - a.createdAt.valueOf())

    setProducts(productsWithImagineData)
  }

  useEffect(() => {
    inProgress && setTimeout(updateProgress, 2000)
  }, [progress])

  const updateProgress = () => {
    setProgress(Math.max(20, Math.min(progress + (100 / 30) + Math.random() * (100 / 60), 90)))
  }

  useEffect(() => {
    if (inProgress) {
      updateProgress()
    }
    else {
      setProgress(0)
    }
  }, [inProgress])

  // Fallback for lack of service worker
  const poll = async (taskId: string) => {
    const task = await pollTask(taskId)
    console.log("Polling...", task?.status)

    switch (task?.status) {
      case TaskStatus.Complete:
        await refreshProducts()
        setInProgress(false)
        setConfirmationOpen(false)
        setFinishedOpen(true)
        break
      case TaskStatus.Failed:
      case undefined:
        setInProgress(false)
        setConfirmationOpen(false)
        setErrorOpen(true)
        break
      default:
        pollTimeoutRef.current = setTimeout(poll, 5000, taskId)
        break
    }
  }

  const onVisibilityChange = (e: Event) => {
    if (pollTimeoutRef.current) {
      clearTimeout(pollTimeoutRef.current)
      console.log("Clearing timeout")
    }
    if (document.visibilityState == "visible" && currentTaskId) {
      poll(currentTaskId)

    }
  }
  useEffect(() => {
    if (inProgress && currentTaskId) {
      document.addEventListener('visibilitychange', onVisibilityChange)
    }

    return () => {
      document.removeEventListener('visibilitychange', onVisibilityChange)
    }
  }, [inProgress, currentTaskId])

  const create = async (prompt: string) => {
    beginTask({
      prompt: prompt,
      type: TaskType.Imagine
    }).then((res) => {
      if (res.status !== TaskStatus.Failed && res.id) {
        console.log("taskStatus setInProgress(true)", res.id)
        setCurrentTaskId(res.id)
        setConfirmationOpen(true)
        pollTimeoutRef.current = setTimeout(poll, 5000, res.id)
      }
      else {
        console.log("Create setInProgress(false)", res.id)
        setInProgress(false)
        setErrorOpen(true)
      }
    })
    console.log("create end setInProgress(true)")
    setInProgress(true)
  }

  const vary = async (index: number, imagineData: ImagineData, prompt: string) => {
    beginTask({
      prompt: prompt,
      srcImagineData: imagineData,
      index: index,
      type: TaskType.ImagineVariants
    }).then((res) => {
      if (res.status !== TaskStatus.Failed && res.id) {
        setCurrentTaskId(res.id)
        setConfirmationOpen(true)
        pollTimeoutRef.current = setTimeout(poll, 5000, res.id)
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
        products: products,
        progress: progress,
      }}>
        {children}
      </CreationContext.Provider>

      <Dialog open={confirmationOpen} onOpenChange={setConfirmationOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <DialogHeader>
                <DialogTitle>{ }</DialogTitle>
              </DialogHeader>
              <div className="flex flex-col items-center py-8 text-center gap-2">
                <CheckCircle
                  size="70"
                  strokeWidth={0.5}
                  className=" stroke-green-500"
                />
                <div className="py-4">
                  <h1 className="text-xl">{"We're working on your design"}</h1>
                  <p className="text-gray-500">
                    {"Feel free to explore our gallery while you wait"}<br />
                  </p>
                </div>
                {!userEmail ?
                  <>
                    <h2 className="text-lg pt-2">{"Don't want to wait?"}</h2>
                    <input {...form.register('email')} className="w-full border-gray-400 border rounded-md p-2" placeholder="Email"></input>
                    <FormDescription className="text-left">{"Enter your email and we'll notify you when it's done."}</FormDescription>
                  </>
                  :
                  <FormField
                    control={form.control}
                    name="shouldEmail"
                    render={({ field }) =>
                      <div className="flex flex-row gap-2 text-left">
                        <Checkbox id={"shouldEmail"} checked={field.value} onCheckedChange={field.onChange} />
                        <FormLabel htmlFor="shouldEmail">Email me once my design is ready.</FormLabel>
                      </div>
                    }
                  />
                }
              </div>
              <DialogFooter>
                <Button type="submit" onClick={() => {
                  console.log(form.getValues())
                  setConfirmationOpen(false)
                }}>Got it</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={finishedOpen} onOpenChange={setFinishedOpen}>
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
          <div className="flex flex-col items-center w-fit mx-auto justify-start gap-4 p-4 bg-white border border-gray-300 rounded-md shadow-gray-600 drop-shadow-lg">
            <div className="flex flex-row gap-4">
              <h2>{"We're working on your design..."}</h2>
              <div className="animate-spin border-r-2 border-t-2 h-6 min-w-6 border-black rounded-[50%]" />
            </div>
            <Progress value={progress} />
          </div>
        </div >
      }
    </>
  )
}

export default CreationProvider