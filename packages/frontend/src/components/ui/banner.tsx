export const revalidate = 60

import { getBannerMessage } from "@/gateway/cms"

const Banner = async () => {
  const bannerMessage = await getBannerMessage()
  console.log("banner", bannerMessage)
  if (!bannerMessage) return

  return (
    <div className="w-full bg-black text-center p-1">
      <span className="text-white">{bannerMessage}</span>
    </div>
  )
}

export default Banner