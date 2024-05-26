export const revalidate = 60

import { getPage } from "@/gateway/cms"
import { ResolvingMetadata } from "next"
import { notFound } from "next/navigation"
import { MDXRemote } from 'next-mdx-remote/rsc'
import { components } from './mdx-components'
import { defListHastHandlers, remarkDefinitionList } from 'remark-definition-list'

export async function generateMetadata({ params }: { params: { handle: string } }, parent: ResolvingMetadata) {
  const page = await getPage(params.handle)

  return {
    title: page?.title ?? (await parent).title,
    description: page?.description ?? (await parent).description
  }
}

const Page = async ({ params }: { params: { handle: string } }) => {
  const page = await getPage(params.handle)
  if (page == null) notFound()

  return (
    <div id="wrapper" className="w-full mt-20 py-20">
      <section id="page" className="flex flex-col items-center justify-start md:px-20 px-4">
        {page.title && <h1 className="text-5xl text-center font-bold p-12">{page.headline}</h1>}
        {page.description && <h2 className=" max-w-xl text-center text-xl pt-4 text-gray-600 ">{page.description}</h2>}
        {/* TODO:  {page.media && } */}
        <div className="w-full flex flex-col items-center">
          <MDXRemote options={{
            "mdxOptions": {
              "format": "mdx",
              "remarkPlugins": [remarkDefinitionList],
              "remarkRehypeOptions": {
                "handlers": {
                  ...(defListHastHandlers as Record<string, any>)
                }
              }
            }
          }} components={components} source={page.content ?? ""} />
        </div>
      </section>
    </div>
  )
}

export default Page