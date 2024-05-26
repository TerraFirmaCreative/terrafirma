export type GenerateImageParams = {
  prompt: string
}

export type GeneratedImageDto = {
  url?: string
  description?: string
  imagineId?: string,
  imagineHash?: string,
  imagineFlags?: number
  index?: 1 | 3 | 2 | 4,
  prompt?: string
}

export type ImagineData = {
  imagineId: string,
  imagineHash: string,
  imagineFlags: number,
  imaginePrompt: string
}

export type GeneratedItemDto = {
  title: string,
  description: string,
  url: string,
  variantId: string
  imagineData?: ImagineData
  allowVariants: boolean
}