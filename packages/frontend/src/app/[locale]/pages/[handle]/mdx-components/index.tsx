import { AccordionItem, Accordion, AccordionContent, AccordionTrigger } from "@/components/ui/accordion"
import { Separator } from "@/components/ui/separator"
import { TypographyA, TypographyBlockquote, TypographyH1, TypographyH2, TypographyH3, TypographyH4, TypographyOL, TypographyP, TypographyUL } from "@/components/ui/typography"
import { randomUUID } from "crypto"
import { Children, Component, DetailedHTMLProps, HTMLAttributes, ReactNode } from "react"
import Image from "next/image"

const CustomDL = (props: DetailedHTMLProps<HTMLAttributes<HTMLDListElement>, HTMLDListElement>) => {
  const groups: React.ReactNode[][] = Children.toArray(props.children).reduce((acc: React.ReactNode[][], child, i, children) => {
    if (typeof child == typeof [CustomDT] && (child as any).type === CustomDT) {
      acc.push([child])
    }
    else if (typeof child == typeof [CustomDT] && (child as any).type === CustomDD) {
      acc.at(-1)?.push(child)
    }

    return acc
  }, [])

  return (<Accordion type="single" collapsible className="w-full max-w-5xl">
    {
      groups.map((group, i) => {
        return <AccordionItem key={i} value={`item-${i}`}>
          {group}
        </AccordionItem>
      })
    }
  </Accordion>)
}

const CustomDT = ({ children }: any) => <AccordionTrigger className="text-left">
  {children}
</AccordionTrigger>

const CustomDD = ({ children }: any) => <AccordionContent>
  {children}
</AccordionContent>


export const components = {
  h1: (props: any) => <TypographyH1 {...props} />,
  h2: (props: any) => <TypographyH2 {...props} />,
  h3: (props: any) => <TypographyH3 {...props} />,
  h4: (props: any) => <TypographyH4 {...props} />,
  blockquote: (props: any) => <TypographyBlockquote {...props} />,
  ol: (props: any) => <TypographyOL {...props} />,
  ul: (props: any) => <TypographyUL {...props} />,
  p: (props: any) => <TypographyP {...props} />,
  hr: ({ children }: any) => <Separator className="my-4" />,
  a: (props: any) => <TypographyA {...props} />,
  img: (props: any) => <div className="relative h-96 my-8">
    <Image alt={props.alt} src={props.src} fill objectFit="contain" sizes="70vw" />,
  </div>,
  dl: CustomDL,
  dt: CustomDT,
  dd: CustomDD
}