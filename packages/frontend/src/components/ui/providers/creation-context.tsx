"use client"
import { createContext, useEffect, useRef, useState } from "react"
import { AlertDialogCancel, AlertDialog, AlertDialogFooter, AlertDialogContent, AlertDialogAction, AlertDialogTitle } from "../alert-dialog"
import { useParams, useRouter } from "next/navigation"
import { beginTask, getUserProducts, pollTask } from "@/gateway/tasks"
import { TaskStatus, Product, ImagineData, TaskType } from "@prisma/client"
import { getProductsById } from "@/gateway/store"
import { GetProductsByIdQuery } from "@/lib/types/graphql"
import { useForm } from "react-hook-form"
import * as yup from "yup"
import { yupResolver } from "@hookform/resolvers/yup"
import { Progress } from "../progress"
import { useInterval } from "@/hooks/use-interval"

import { socket } from "@/app/ws"

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
  const [finishedOpen, setFinishedOpen] = useState<boolean>(false)
  const [errorOpen, setErrorOpen] = useState<boolean>(false)
  const [progress, setProgress] = useState<number>(0)
  const [userEmail, setUserEmail] = useState<string | null | undefined>()
  const currentTaskRef = useRef<string>()

  const { locale }: { locale: string } = useParams()

  const router = useRouter()

  const [isConnected, setIsConnected] = useState(false);

  const form = useForm<yup.InferType<typeof emailSchema>>({
    resolver: yupResolver(emailSchema)
  })

  useEffect(() => {
    if (socket.connected) {
      onConnect();
    }

    function onConnect() {
      setIsConnected(true);
    }

    function onDisconnect() {
      setIsConnected(false);
    }

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("task-update", handleTaskUpdate)

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
    };
  }, []);

  // const onSubmit: SubmitHandler<yup.InferType<typeof emailSchema>> = (data) => {
  //   if (data.email && !userEmail) {
  //     setUserEmail(data.email)
  //     updateUserEmail(data.email)
  //     currentTaskId && updateTaskShouldEmailUser(currentTaskId, true)
  //   }
  //   if (userEmail && data.shouldEmail && currentTaskId) {
  //     updateTaskShouldEmailUser(currentTaskId, data.shouldEmail)
  //   }
  // }

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
    if (inProgress) {
      setProgress(20)
    }
    else if (currentTaskRef.current) {
      socket.emit("unsubscribe", currentTaskRef.current, (response: string) => {
        console.log(response)
      })
    }

    const onVisibilityChange = () => {
      if (inProgress && currentTaskRef.current && document.visibilityState == "visible") {
        poll()
      }
    }
    document.addEventListener('visibilitychange', onVisibilityChange)

    return () => {
      document.removeEventListener('visibilitychange', onVisibilityChange)
    }
  }, [inProgress])

  useInterval(() => {
    setProgress(Math.max(20, Math.min(progress + (100 / 30) + Math.random() * (100 / 60), 90)))
  }, inProgress ? 2000 : null)

  const handleTaskUpdate = async (status?: TaskStatus) => {
    console.log("Task status: ", status)
    switch (status) {
      case TaskStatus.Complete:
        await refreshProducts()
        setInProgress(false)
        setFinishedOpen(true)
        break
      case TaskStatus.Failed:
      case undefined:
        setInProgress(false)
        setErrorOpen(true)
        break
      default:
        break
    }
  }

  // Fallback for lack of ws
  const poll = async () => {
    console.log(currentTaskRef.current)
    if (currentTaskRef.current) {
      const task = await pollTask(currentTaskRef.current)
      console.log("Polling...", task?.status)
      handleTaskUpdate(task?.status)
    }
  }

  // We dont use this anymore. We only poll when visibility changes.
  // useInterval(poll, (currentTaskRef.current && inProgress && document.visibilityState == "visible") ? 5000 : null)

  const create = async (prompt: string) => {
    beginTask({
      prompt: prompt,
      type: TaskType.Imagine
    }).then((res) => {
      if (res.status !== TaskStatus.Failed && res.id) {
        currentTaskRef.current = res.id
        socket.emit("subscribe", res.id, (response: string) => {
          console.log(response)
        })
      }
      else {
        setInProgress(false)
        setErrorOpen(true)
      }
    })
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
        currentTaskRef.current = res.id
        socket.emit("subscribe", res.id, (response: string) => {
          console.log(response)
        })
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

      {!inProgress &&
        <div className="fixed z-10 bottom-5 left-5 right-5">
          <div className="flex flex-col items-center w-fit mx-auto justify-start gap-4 p-4 bg-white border border-gray-300 rounded-md shadow-gray-600 drop-shadow-lg">
            <div className="flex flex-row gap-4">
              <h2 className="my-auto">{"We're working on your design..."}</h2>
              <div className="animate-spin border-r-2 border-t-2 h-6 min-w-6 border-black rounded-[50%]" />
            </div>
            <p className="text-xs text-center">{"This usually takes under a minute. "}<br /><span className="font-bold hover:underline cursor-pointer">{"Notify me when my design is ready."}</span></p>
            <Progress value={progress} />
          </div>
        </div >
      }
    </>
  )
}

export default CreationProvider