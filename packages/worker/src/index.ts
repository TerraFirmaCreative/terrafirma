import config, { mjClient, sqsClient } from "./config"
import { ReceiveMessageCommand } from "@aws-sdk/client-sqs"
import { ImagineTask, ImagineVariantsTask, TaskMessage } from "./types/worker"
import { TaskType } from '@prisma/client'
import { imagineTask, imagineVariantsTask } from "./tasks"
import { createProjectionMaps } from "./tasks/shopify"

async function handleMessage(message: TaskMessage) {
  console.log("here", message)
  const task = message
  if (task) {
    switch (task.Body.type) {
      case TaskType.Imagine:
        imagineTask(task as ImagineTask)
        break
      case TaskType.ImagineVariants:
        imagineVariantsTask(task as ImagineVariantsTask)
        break
      default:
        break
    }
  }

  return
}

async function receiveMessages() {
  const response = await sqsClient.send(new ReceiveMessageCommand({
    QueueUrl: process.env.SQS_URL,
    MaxNumberOfMessages: 1,
    WaitTimeSeconds: 1,
  }))

  if (response.Messages) {
    console.info("Messages received: ", response.Messages.length)
    console.log(response.Messages?.at(0)?.Body)
    response.Messages?.map((message) => {
      handleMessage({
        ...message,
        Body: JSON.parse(message.Body!)
      })
    })
  }
}

async function main() {
  await mjClient.init()

  // const products_s = `
  // {
  //   "data": {
  //     "products": {
  //       "edges": [
  //         {
  //           "cursor": "eyJsYXN0X2lkIjo5MDkzMDQ0OTYxNTg4LCJsYXN0X3ZhbHVlIjoiMjAyNC0wNi0wMSAwNToxNjo0MS4wMDAwMDAifQ==",
  //           "node": {
  //             "id": "gid://shopify/Product/9093044961588",
  //             "title": "Neon City Nights [18B13CEF-28FE-435D-8C68-25CC0C290719]",
  //             "featuredImage": {
  //               "url": "https://cdn.shopify.com/s/files/1/0789/0052/7412/files/hj12342794_neon_95472768-7681-46f7-94cf-a12733bb0d95.png?v=1717219003"
  //             },
  //             "priceRange": {
  //               "maxVariantPrice": {
  //                 "amount": "70.0",
  //                 "currencyCode": "AUD"
  //               }
  //             }
  //           }
  //         },
  //         {
  //           "cursor": "eyJsYXN0X2lkIjo5MDkzMDQ0OTI4ODIwLCJsYXN0X3ZhbHVlIjoiMjAyNC0wNi0wMSAwNToxNjo0MS4wMDAwMDAifQ==",
  //           "node": {
  //             "id": "gid://shopify/Product/9093044928820",
  //             "title": "Nighttime Neon Energy [2C24BCC0-DBE1-49B9-80FE-F3EE607189C0]",
  //             "featuredImage": {
  //               "url": "https://cdn.shopify.com/s/files/1/0789/0052/7412/files/hj12342794_neon_4bd9f447-f35d-4fb3-9ba9-f2a6fe005a8a.png?v=1717219003"
  //             },
  //             "priceRange": {
  //               "maxVariantPrice": {
  //                 "amount": "70.0",
  //                 "currencyCode": "AUD"
  //               }
  //             }
  //           }
  //         },
  //         {
  //           "cursor": "eyJsYXN0X2lkIjo5MDkzMDQ0ODk2MDUyLCJsYXN0X3ZhbHVlIjoiMjAyNC0wNi0wMSAwNToxNjo0MS4wMDAwMDAifQ==",
  //           "node": {
  //             "id": "gid://shopify/Product/9093044896052",
  //             "title": "Neon Nightscape Glow [D82F669A-E6A5-48A3-B169-DED3A7B66C3C]",
  //             "featuredImage": {
  //               "url": "https://cdn.shopify.com/s/files/1/0789/0052/7412/files/hj12342794_neon_28f9aa19-8e69-412f-b969-96fb9ebb9a2b.png?v=1717219003"
  //             },
  //             "priceRange": {
  //               "maxVariantPrice": {
  //                 "amount": "70.0",
  //                 "currencyCode": "AUD"
  //               }
  //             }
  //           }
  //         },
  //         {
  //           "cursor": "eyJsYXN0X2lkIjo5MDkzMDQ0ODYzMjg0LCJsYXN0X3ZhbHVlIjoiMjAyNC0wNi0wMSAwNToxNjo0MS4wMDAwMDAifQ==",
  //           "node": {
  //             "id": "gid://shopify/Product/9093044863284",
  //             "title": "Neon Nightscape Glow [F4FFDF98-7496-4958-9901-9772C46B7B4F]",
  //             "featuredImage": {
  //               "url": "https://cdn.shopify.com/s/files/1/0789/0052/7412/files/hj12342794_neon_20466bee-6aba-483d-a55c-9d5351ad7ccc.png?v=1717219003"
  //             },
  //             "priceRange": {
  //               "maxVariantPrice": {
  //                 "amount": "70.0",
  //                 "currencyCode": "AUD"
  //               }
  //             }
  //           }
  //         },
  //         {
  //           "cursor": "eyJsYXN0X2lkIjo5MDkzMDA5NDA4MzA4LCJsYXN0X3ZhbHVlIjoiMjAyNC0wNi0wMSAwNDowNToxOC4wMDAwMDAifQ==",
  //           "node": {
  //             "id": "gid://shopify/Product/9093009408308",
  //             "title": "Dawn of Hope [7460D9A0-20DE-430C-8344-174DF8C19A02]",
  //             "featuredImage": {
  //               "url": "https://cdn.shopify.com/s/files/1/0789/0052/7412/files/hj12342794_brand_new_beginning_56da9b8d-2721-48f3-8349-5db42c2a6375.png?v=1717214720"
  //             },
  //             "priceRange": {
  //               "maxVariantPrice": {
  //                 "amount": "70.0",
  //                 "currencyCode": "AUD"
  //               }
  //             }
  //           }
  //         },
  //         {
  //           "cursor": "eyJsYXN0X2lkIjo5MDkzMDA5Mzc1NTQwLCJsYXN0X3ZhbHVlIjoiMjAyNC0wNi0wMSAwNDowNToxOC4wMDAwMDAifQ==",
  //           "node": {
  //             "id": "gid://shopify/Product/9093009375540",
  //             "title": "Dawn of Hope [8CF38817-AE88-4A40-95F8-28F99CDD2946]",
  //             "featuredImage": {
  //               "url": "https://cdn.shopify.com/s/files/1/0789/0052/7412/files/hj12342794_brand_new_beginning_cf397acc-3e10-4c78-a6fe-fa931ace5c2c.png?v=1717214721"
  //             },
  //             "priceRange": {
  //               "maxVariantPrice": {
  //                 "amount": "70.0",
  //                 "currencyCode": "AUD"
  //               }
  //             }
  //           }
  //         },
  //         {
  //           "cursor": "eyJsYXN0X2lkIjo5MDkzMDA5MzQyNzcyLCJsYXN0X3ZhbHVlIjoiMjAyNC0wNi0wMSAwNDowNToxOC4wMDAwMDAifQ==",
  //           "node": {
  //             "id": "gid://shopify/Product/9093009342772",
  //             "title": "Radiant Dawn Awakening [F30C1E45-384A-4430-92F2-49F14152E4C0]",
  //             "featuredImage": {
  //               "url": "https://cdn.shopify.com/s/files/1/0789/0052/7412/files/hj12342794_brand_new_beginning_8acf95e0-9ee2-4917-82a7-7417f7080dcf.png?v=1717214720"
  //             },
  //             "priceRange": {
  //               "maxVariantPrice": {
  //                 "amount": "70.0",
  //                 "currencyCode": "AUD"
  //               }
  //             }
  //           }
  //         },
  //         {
  //           "cursor": "eyJsYXN0X2lkIjo5MDkzMDA5MzEwMDA0LCJsYXN0X3ZhbHVlIjoiMjAyNC0wNi0wMSAwNDowNToxOC4wMDAwMDAifQ==",
  //           "node": {
  //             "id": "gid://shopify/Product/9093009310004",
  //             "title": "Renewed Dawn's Promise [44CE0462-22F6-4F13-AB88-D65056F9306F]",
  //             "featuredImage": {
  //               "url": "https://cdn.shopify.com/s/files/1/0789/0052/7412/files/hj12342794_brand_new_beginning_a43480d6-3fc5-40d9-9100-fae455def5ab.png?v=1717214720"
  //             },
  //             "priceRange": {
  //               "maxVariantPrice": {
  //                 "amount": "70.0",
  //                 "currencyCode": "AUD"
  //               }
  //             }
  //           }
  //         },
  //         {
  //           "cursor": "eyJsYXN0X2lkIjo5MDkzMDA3NzY5OTA4LCJsYXN0X3ZhbHVlIjoiMjAyNC0wNi0wMSAwMzo1NDo0NS4wMDAwMDAifQ==",
  //           "node": {
  //             "id": "gid://shopify/Product/9093007769908",
  //             "title": "Urban Neon Pulse [22C2C310-AE9F-49F9-95AD-743D0698B44B]",
  //             "featuredImage": {
  //               "url": "https://cdn.shopify.com/s/files/1/0789/0052/7412/files/hj12342794_neon_cfe7b958-ba92-4195-a81e-000729b70090.png?v=1717214088"
  //             },
  //             "priceRange": {
  //               "maxVariantPrice": {
  //                 "amount": "70.0",
  //                 "currencyCode": "AUD"
  //               }
  //             }
  //           }
  //         },
  //         {
  //           "cursor": "eyJsYXN0X2lkIjo5MDkzMDA3NzM3MTQwLCJsYXN0X3ZhbHVlIjoiMjAyNC0wNi0wMSAwMzo1NDo0NS4wMDAwMDAifQ==",
  //           "node": {
  //             "id": "gid://shopify/Product/9093007737140",
  //             "title": "Neon Nightscape Energy [60B27D70-5947-4A55-B9CC-1F076C6F32C8]",
  //             "featuredImage": {
  //               "url": "https://cdn.shopify.com/s/files/1/0789/0052/7412/files/hj12342794_neon_a0b921ba-73bd-42c1-a332-a7903fb22ff2.png?v=1717214087"
  //             },
  //             "priceRange": {
  //               "maxVariantPrice": {
  //                 "amount": "70.0",
  //                 "currencyCode": "AUD"
  //               }
  //             }
  //           }
  //         },
  //         {
  //           "cursor": "eyJsYXN0X2lkIjo5MDkzMDA3NzA0MzcyLCJsYXN0X3ZhbHVlIjoiMjAyNC0wNi0wMSAwMzo1NDo0NS4wMDAwMDAifQ==",
  //           "node": {
  //             "id": "gid://shopify/Product/9093007704372",
  //             "title": "City Pulse Glow [76213983-FD45-4B44-B6A1-8DA0BE4C24E2]",
  //             "featuredImage": {
  //               "url": "https://cdn.shopify.com/s/files/1/0789/0052/7412/files/hj12342794_neon_731227c9-02e1-438a-9b90-9e7f25458f1b.png?v=1717214087"
  //             },
  //             "priceRange": {
  //               "maxVariantPrice": {
  //                 "amount": "70.0",
  //                 "currencyCode": "AUD"
  //               }
  //             }
  //           }
  //         },
  //         {
  //           "cursor": "eyJsYXN0X2lkIjo5MDkzMDA3NjcxNjA0LCJsYXN0X3ZhbHVlIjoiMjAyNC0wNi0wMSAwMzo1NDo0NS4wMDAwMDAifQ==",
  //           "node": {
  //             "id": "gid://shopify/Product/9093007671604",
  //             "title": "Neon City Pulse [652A902B-0E48-442D-82F2-B2C8309C3A39]",
  //             "featuredImage": {
  //               "url": "https://cdn.shopify.com/s/files/1/0789/0052/7412/files/hj12342794_neon_1b6947b3-662e-4999-9829-26c28d808b52.png?v=1717214087"
  //             },
  //             "priceRange": {
  //               "maxVariantPrice": {
  //                 "amount": "70.0",
  //                 "currencyCode": "AUD"
  //               }
  //             }
  //           }
  //         },
  //         {
  //           "cursor": "eyJsYXN0X2lkIjo5MDkzMDA3MTE0NTQ4LCJsYXN0X3ZhbHVlIjoiMjAyNC0wNi0wMSAwMzo1MTowNi4wMDAwMDAifQ==",
  //           "node": {
  //             "id": "gid://shopify/Product/9093007114548",
  //             "title": "Renewal at Dawn [6982622E-9D44-452B-894E-866DF94DCC83]",
  //             "featuredImage": {
  //               "url": "https://cdn.shopify.com/s/files/1/0789/0052/7412/files/hj12342794_a_brand_new_beginning_6012c63d-52f7-4613-a03b-aa0cff6ebc47.png?v=1717213868"
  //             },
  //             "priceRange": {
  //               "maxVariantPrice": {
  //                 "amount": "70.0",
  //                 "currencyCode": "AUD"
  //               }
  //             }
  //           }
  //         },
  //         {
  //           "cursor": "eyJsYXN0X2lkIjo5MDkzMDA3MDgxNzgwLCJsYXN0X3ZhbHVlIjoiMjAyNC0wNi0wMSAwMzo1MTowNi4wMDAwMDAifQ==",
  //           "node": {
  //             "id": "gid://shopify/Product/9093007081780",
  //             "title": "Golden Horizon Ahead [86B26181-A083-4A13-9DFE-BBC39E5D74C5]",
  //             "featuredImage": {
  //               "url": "https://cdn.shopify.com/s/files/1/0789/0052/7412/files/hj12342794_a_brand_new_beginning_8abec810-df8a-48b3-bef3-3235b398007c.png?v=1717213868"
  //             },
  //             "priceRange": {
  //               "maxVariantPrice": {
  //                 "amount": "70.0",
  //                 "currencyCode": "AUD"
  //               }
  //             }
  //           }
  //         },
  //         {
  //           "cursor": "eyJsYXN0X2lkIjo5MDkzMDA3MDQ5MDEyLCJsYXN0X3ZhbHVlIjoiMjAyNC0wNi0wMSAwMzo1MTowNi4wMDAwMDAifQ==",
  //           "node": {
  //             "id": "gid://shopify/Product/9093007049012",
  //             "title": "Sunrise of Hope [94436D06-C601-43B5-B988-5D6746088A1E]",
  //             "featuredImage": {
  //               "url": "https://cdn.shopify.com/s/files/1/0789/0052/7412/files/hj12342794_a_brand_new_beginning_54a254fb-ad04-4ef1-875a-9d696f6f6766.png?v=1717213868"
  //             },
  //             "priceRange": {
  //               "maxVariantPrice": {
  //                 "amount": "70.0",
  //                 "currencyCode": "AUD"
  //               }
  //             }
  //           }
  //         },
  //         {
  //           "cursor": "eyJsYXN0X2lkIjo5MDkzMDA3MDE2MjQ0LCJsYXN0X3ZhbHVlIjoiMjAyNC0wNi0wMSAwMzo1MTowNS4wMDAwMDAifQ==",
  //           "node": {
  //             "id": "gid://shopify/Product/9093007016244",
  //             "title": "Dawn of Renewal [75A57282-B124-4C0E-8AE6-CD65601E3F1D]",
  //             "featuredImage": {
  //               "url": "https://cdn.shopify.com/s/files/1/0789/0052/7412/files/hj12342794_a_brand_new_beginning_1d7eb679-e24f-4920-baaa-45c56bdb3236.png?v=1717213867"
  //             },
  //             "priceRange": {
  //               "maxVariantPrice": {
  //                 "amount": "70.0",
  //                 "currencyCode": "AUD"
  //               }
  //             }
  //           }
  //         },
  //         {
  //           "cursor": "eyJsYXN0X2lkIjo5MDkzMDA1ODY5MzY0LCJsYXN0X3ZhbHVlIjoiMjAyNC0wNi0wMSAwMzo0MjozNC4wMDAwMDAifQ==",
  //           "node": {
  //             "id": "gid://shopify/Product/9093005869364",
  //             "title": "Infinite Creative Potential [465CF641-B6FB-4A69-9373-A324EF67E9AF]",
  //             "featuredImage": {
  //               "url": "https://cdn.shopify.com/s/files/1/0789/0052/7412/files/hj12342794_a_brand_new_beginning_7b5af701-d583-434c-84bf-764f7ccf1bb1.png?v=1717213356"
  //             },
  //             "priceRange": {
  //               "maxVariantPrice": {
  //                 "amount": "70.0",
  //                 "currencyCode": "AUD"
  //               }
  //             }
  //           }
  //         },
  //         {
  //           "cursor": "eyJsYXN0X2lkIjo5MDkzMDA1ODM2NTk2LCJsYXN0X3ZhbHVlIjoiMjAyNC0wNi0wMSAwMzo0MjozNC4wMDAwMDAifQ==",
  //           "node": {
  //             "id": "gid://shopify/Product/9093005836596",
  //             "title": "Eternal Dawn's Promise [A46A4FBF-0C4A-4922-A34D-1C6F7D44F1B3]",
  //             "featuredImage": {
  //               "url": "https://cdn.shopify.com/s/files/1/0789/0052/7412/files/hj12342794_a_brand_new_beginning_b4ede5f1-44f2-40db-9deb-6ebb28497e1b.png?v=1717213356"
  //             },
  //             "priceRange": {
  //               "maxVariantPrice": {
  //                 "amount": "70.0",
  //                 "currencyCode": "AUD"
  //               }
  //             }
  //           }
  //         },
  //         {
  //           "cursor": "eyJsYXN0X2lkIjo5MDkzMDA1ODAzODI4LCJsYXN0X3ZhbHVlIjoiMjAyNC0wNi0wMSAwMzo0MjozNC4wMDAwMDAifQ==",
  //           "node": {
  //             "id": "gid://shopify/Product/9093005803828",
  //             "title": "Daybreak of Hope [C063EB46-341F-4850-B5D6-CFD7575EFB4B]",
  //             "featuredImage": {
  //               "url": "https://cdn.shopify.com/s/files/1/0789/0052/7412/files/hj12342794_a_brand_new_beginning_41ef5633-85a4-4f8e-8238-51cd367230d9.png?v=1717213356"
  //             },
  //             "priceRange": {
  //               "maxVariantPrice": {
  //                 "amount": "70.0",
  //                 "currencyCode": "AUD"
  //               }
  //             }
  //           }
  //         },
  //         {
  //           "cursor": "eyJsYXN0X2lkIjo5MDkzMDA1NzcxMDYwLCJsYXN0X3ZhbHVlIjoiMjAyNC0wNi0wMSAwMzo0MjozNC4wMDAwMDAifQ==",
  //           "node": {
  //             "id": "gid://shopify/Product/9093005771060",
  //             "title": "Dawn of Exploration [26C0799E-309F-4CFC-AE24-76BA20B1E9A6]",
  //             "featuredImage": {
  //               "url": "https://cdn.shopify.com/s/files/1/0789/0052/7412/files/hj12342794_a_brand_new_beginning_3b831fb2-0233-429c-8dbf-e00a4327f01e.png?v=1717213356"
  //             },
  //             "priceRange": {
  //               "maxVariantPrice": {
  //                 "amount": "70.0",
  //                 "currencyCode": "AUD"
  //               }
  //             }
  //           }
  //         },
  //         {
  //           "cursor": "eyJsYXN0X2lkIjo5MDkzMDA0Mzk0ODA0LCJsYXN0X3ZhbHVlIjoiMjAyNC0wNi0wMSAwMzozNDoxNC4wMDAwMDAifQ==",
  //           "node": {
  //             "id": "gid://shopify/Product/9093004394804",
  //             "title": "Emotive Digital Harmony [FA13D82B-7013-43C2-8941-315C4F2222B7]",
  //             "featuredImage": {
  //               "url": "https://cdn.shopify.com/s/files/1/0789/0052/7412/files/hj12342794_blue_emojis_cgi_digital_art_3dbd649a-4767-41a9-b5b6-66134247536c.png?v=1717212856"
  //             },
  //             "priceRange": {
  //               "maxVariantPrice": {
  //                 "amount": "70.0",
  //                 "currencyCode": "AUD"
  //               }
  //             }
  //           }
  //         },
  //         {
  //           "cursor": "eyJsYXN0X2lkIjo5MDkzMDA0MzYyMDM2LCJsYXN0X3ZhbHVlIjoiMjAyNC0wNi0wMSAwMzozNDoxNC4wMDAwMDAifQ==",
  //           "node": {
  //             "id": "gid://shopify/Product/9093004362036",
  //             "title": "Virtual Emotion Symphony [97095679-9305-487E-AA18-C297186E1DE2]",
  //             "featuredImage": {
  //               "url": "https://cdn.shopify.com/s/files/1/0789/0052/7412/files/hj12342794_blue_emojis_cgi_digital_art_c409a543-9678-40ef-805e-79c9845999ce.png?v=1717212856"
  //             },
  //             "priceRange": {
  //               "maxVariantPrice": {
  //                 "amount": "70.0",
  //                 "currencyCode": "AUD"
  //               }
  //             }
  //           }
  //         },
  //         {
  //           "cursor": "eyJsYXN0X2lkIjo5MDkzMDA0MzI5MjY4LCJsYXN0X3ZhbHVlIjoiMjAyNC0wNi0wMSAwMzozNDoxNC4wMDAwMDAifQ==",
  //           "node": {
  //             "id": "gid://shopify/Product/9093004329268",
  //             "title": "Ethereal Emojiscape Elegance [7D5F71C1-E196-4846-AB99-2583214B2555]",
  //             "featuredImage": {
  //               "url": "https://cdn.shopify.com/s/files/1/0789/0052/7412/files/hj12342794_blue_emojis_cgi_digital_art_8b661992-e56a-4e02-ac99-43182a895b68.png?v=1717212856"
  //             },
  //             "priceRange": {
  //               "maxVariantPrice": {
  //                 "amount": "70.0",
  //                 "currencyCode": "AUD"
  //               }
  //             }
  //           }
  //         },
  //         {
  //           "cursor": "eyJsYXN0X2lkIjo5MDkzMDA0Mjk2NTAwLCJsYXN0X3ZhbHVlIjoiMjAyNC0wNi0wMSAwMzozNDoxNC4wMDAwMDAifQ==",
  //           "node": {
  //             "id": "gid://shopify/Product/9093004296500",
  //             "title": "Emotive Digital Delight [A2CDCAF5-14FD-4CCA-8CB6-EFD75A5C1952]",
  //             "featuredImage": {
  //               "url": "https://cdn.shopify.com/s/files/1/0789/0052/7412/files/hj12342794_blue_emojis_cgi_digital_art_3965a080-5394-428e-b213-91d127f659e6.png?v=1717212856"
  //             },
  //             "priceRange": {
  //               "maxVariantPrice": {
  //                 "amount": "70.0",
  //                 "currencyCode": "AUD"
  //               }
  //             }
  //           }
  //         },
  //         {
  //           "cursor": "eyJsYXN0X2lkIjo5MDkyOTk5OTcxMTI0LCJsYXN0X3ZhbHVlIjoiMjAyNC0wNi0wMSAwMzowMzowMi4wMDAwMDAifQ==",
  //           "node": {
  //             "id": "gid://shopify/Product/9092999971124",
  //             "title": "Whimsical Pink Delight [DDB57E67-C965-4D14-BC64-700702A3C7FF]",
  //             "featuredImage": {
  //               "url": "https://cdn.shopify.com/s/files/1/0789/0052/7412/files/hj12342794_pink_girly_fun_shapes_intricate_design_f334a302-a3ac-411f-8845-0d5fcde395da.png?v=1717210984"
  //             },
  //             "priceRange": {
  //               "maxVariantPrice": {
  //                 "amount": "70.0",
  //                 "currencyCode": "AUD"
  //               }
  //             }
  //           }
  //         },
  //         {
  //           "cursor": "eyJsYXN0X2lkIjo5MDkyOTk5OTM4MzU2LCJsYXN0X3ZhbHVlIjoiMjAyNC0wNi0wMSAwMzowMzowMi4wMDAwMDAifQ==",
  //           "node": {
  //             "id": "gid://shopify/Product/9092999938356",
  //             "title": "Whimsical Pink Patterns [80CE78A7-26D8-48DB-AE54-A53ABFC5525A]",
  //             "featuredImage": {
  //               "url": "https://cdn.shopify.com/s/files/1/0789/0052/7412/files/hj12342794_pink_girly_fun_shapes_intricate_design_cd82c1db-860e-49f4-8a55-6f75494c525e.png?v=1717210984"
  //             },
  //             "priceRange": {
  //               "maxVariantPrice": {
  //                 "amount": "70.0",
  //                 "currencyCode": "AUD"
  //               }
  //             }
  //           }
  //         },
  //         {
  //           "cursor": "eyJsYXN0X2lkIjo5MDkyOTk5OTA1NTg4LCJsYXN0X3ZhbHVlIjoiMjAyNC0wNi0wMSAwMzowMzowMi4wMDAwMDAifQ==",
  //           "node": {
  //             "id": "gid://shopify/Product/9092999905588",
  //             "title": "Whimsical Pink Delight [16BC9CFB-FE10-4C3D-B72B-C32985AEFEB4]",
  //             "featuredImage": {
  //               "url": "https://cdn.shopify.com/s/files/1/0789/0052/7412/files/hj12342794_pink_girly_fun_shapes_intricate_design_cab2e606-8e04-4ced-8a09-6fa4cf5d231f.png?v=1717210984"
  //             },
  //             "priceRange": {
  //               "maxVariantPrice": {
  //                 "amount": "70.0",
  //                 "currencyCode": "AUD"
  //               }
  //             }
  //           }
  //         },
  //         {
  //           "cursor": "eyJsYXN0X2lkIjo5MDkyOTk5ODcyODIwLCJsYXN0X3ZhbHVlIjoiMjAyNC0wNi0wMSAwMzowMzowMi4wMDAwMDAifQ==",
  //           "node": {
  //             "id": "gid://shopify/Product/9092999872820",
  //             "title": "Whimsical Pink Collage [82D48E30-5EE0-4118-9772-1856CDD7893E]",
  //             "featuredImage": {
  //               "url": "https://cdn.shopify.com/s/files/1/0789/0052/7412/files/hj12342794_pink_girly_fun_shapes_intricate_design_b95ee3cb-9b52-4780-8ab5-3f3c955d5487.png?v=1717210984"
  //             },
  //             "priceRange": {
  //               "maxVariantPrice": {
  //                 "amount": "70.0",
  //                 "currencyCode": "AUD"
  //               }
  //             }
  //           }
  //         },
  //         {
  //           "cursor": "eyJsYXN0X2lkIjo5MDkyOTk5NTc3OTA4LCJsYXN0X3ZhbHVlIjoiMjAyNC0wNi0wMSAwMzowMToxNy4wMDAwMDAifQ==",
  //           "node": {
  //             "id": "gid://shopify/Product/9092999577908",
  //             "title": "Digital Culture Collage [6FD55BC9-4281-448D-9EA4-9DDFA9A398A4]",
  //             "featuredImage": {
  //               "url": "https://cdn.shopify.com/s/files/1/0789/0052/7412/files/hj12342794_Emojis_memes_28debab7-8d30-4a36-949c-83c157a0b356.png?v=1717210879"
  //             },
  //             "priceRange": {
  //               "maxVariantPrice": {
  //                 "amount": "70.0",
  //                 "currencyCode": "AUD"
  //               }
  //             }
  //           }
  //         },
  //         {
  //           "cursor": "eyJsYXN0X2lkIjo5MDkyOTk5NTQ1MTQwLCJsYXN0X3ZhbHVlIjoiMjAyNC0wNi0wMSAwMzowMToxNy4wMDAwMDAifQ==",
  //           "node": {
  //             "id": "gid://shopify/Product/9092999545140",
  //             "title": "Digital Expression Collage [D3D9AB05-164E-443E-904D-FBEFE09EFD4B]",
  //             "featuredImage": {
  //               "url": "https://cdn.shopify.com/s/files/1/0789/0052/7412/files/hj12342794_Emojis_memes_02096b3a-a308-4330-9246-3262b20b69f7.png?v=1717210879"
  //             },
  //             "priceRange": {
  //               "maxVariantPrice": {
  //                 "amount": "70.0",
  //                 "currencyCode": "AUD"
  //               }
  //             }
  //           }
  //         },
  //         {
  //           "cursor": "eyJsYXN0X2lkIjo5MDkyOTk5NTEyMzcyLCJsYXN0X3ZhbHVlIjoiMjAyNC0wNi0wMSAwMzowMToxNy4wMDAwMDAifQ==",
  //           "node": {
  //             "id": "gid://shopify/Product/9092999512372",
  //             "title": "Emotive Digital Collage [7F2C3C13-3E5C-432A-AEF5-665351A03070]",
  //             "featuredImage": {
  //               "url": "https://cdn.shopify.com/s/files/1/0789/0052/7412/files/hj12342794_Emojis_memes_5905af9f-76b2-4b59-bea9-757126706b33.png?v=1717210879"
  //             },
  //             "priceRange": {
  //               "maxVariantPrice": {
  //                 "amount": "70.0",
  //                 "currencyCode": "AUD"
  //               }
  //             }
  //           }
  //         },
  //         {
  //           "cursor": "eyJsYXN0X2lkIjo5MDkyOTk5NDc5NjA0LCJsYXN0X3ZhbHVlIjoiMjAyNC0wNi0wMSAwMzowMToxNi4wMDAwMDAifQ==",
  //           "node": {
  //             "id": "gid://shopify/Product/9092999479604",
  //             "title": "Digital Expression Collage [A829AEAA-8629-409A-96F8-E896027812EE]",
  //             "featuredImage": {
  //               "url": "https://cdn.shopify.com/s/files/1/0789/0052/7412/files/hj12342794_Emojis_memes_f1dd4214-adbd-490c-9107-e898c5ca2b50.png?v=1717210879"
  //             },
  //             "priceRange": {
  //               "maxVariantPrice": {
  //                 "amount": "70.0",
  //                 "currencyCode": "AUD"
  //               }
  //             }
  //           }
  //         },
  //         {
  //           "cursor": "eyJsYXN0X2lkIjo5MDkyOTkxNzEzNTg4LCJsYXN0X3ZhbHVlIjoiMjAyNC0wNi0wMSAwMjowNzowMS4wMDAwMDAifQ==",
  //           "node": {
  //             "id": "gid://shopify/Product/9092991713588",
  //             "title": "Urban Ayahuasca Symphony [EBD83441-B656-4C48-BCD3-4DA1A040ED2F]",
  //             "featuredImage": {
  //               "url": "https://cdn.shopify.com/s/files/1/0789/0052/7412/files/hj12342794_Neon_lights._Cityscape._Ayahuasca_ea4ed338-86e6-45a9-9a06-efb7c4968b95.png?v=1717207623"
  //             },
  //             "priceRange": {
  //               "maxVariantPrice": {
  //                 "amount": "70.0",
  //                 "currencyCode": "AUD"
  //               }
  //             }
  //           }
  //         },
  //         {
  //           "cursor": "eyJsYXN0X2lkIjo5MDkyOTkxNjgwODIwLCJsYXN0X3ZhbHVlIjoiMjAyNC0wNi0wMSAwMjowNzowMS4wMDAwMDAifQ==",
  //           "node": {
  //             "id": "gid://shopify/Product/9092991680820",
  //             "title": "Urban Ayahuasca Odyssey [9B7C7012-AFC7-4BF7-8479-0AB3ACF476CE]",
  //             "featuredImage": {
  //               "url": "https://cdn.shopify.com/s/files/1/0789/0052/7412/files/hj12342794_Neon_lights._Cityscape._Ayahuasca_e146c4a0-e2e4-458e-873a-97be957397d8.png?v=1717207623"
  //             },
  //             "priceRange": {
  //               "maxVariantPrice": {
  //                 "amount": "70.0",
  //                 "currencyCode": "AUD"
  //               }
  //             }
  //           }
  //         },
  //         {
  //           "cursor": "eyJsYXN0X2lkIjo5MDkyOTkxNjQ4MDUyLCJsYXN0X3ZhbHVlIjoiMjAyNC0wNi0wMSAwMjowNzowMS4wMDAwMDAifQ==",
  //           "node": {
  //             "id": "gid://shopify/Product/9092991648052",
  //             "title": "Neon Dreamscape Reverie [BC5C12BC-0C51-4A19-8333-E79851A3B8D2]",
  //             "featuredImage": {
  //               "url": "https://cdn.shopify.com/s/files/1/0789/0052/7412/files/hj12342794_Neon_lights._Cityscape._Ayahuasca_5cd5256f-7cf9-4f79-ac5a-61b37c495621.png?v=1717207623"
  //             },
  //             "priceRange": {
  //               "maxVariantPrice": {
  //                 "amount": "70.0",
  //                 "currencyCode": "AUD"
  //               }
  //             }
  //           }
  //         },
  //         {
  //           "cursor": "eyJsYXN0X2lkIjo5MDkyOTkxNjE1Mjg0LCJsYXN0X3ZhbHVlIjoiMjAyNC0wNi0wMSAwMjowNzowMS4wMDAwMDAifQ==",
  //           "node": {
  //             "id": "gid://shopify/Product/9092991615284",
  //             "title": "Neon Urban Reverie [8B65DB73-8D63-45F8-8F62-1E1CB81EACC9]",
  //             "featuredImage": {
  //               "url": "https://cdn.shopify.com/s/files/1/0789/0052/7412/files/hj12342794_Neon_lights._Cityscape._Ayahuasca_3984aaff-da17-4e78-9d3d-33b6d9261d69.png?v=1717207623"
  //             },
  //             "priceRange": {
  //               "maxVariantPrice": {
  //                 "amount": "70.0",
  //                 "currencyCode": "AUD"
  //               }
  //             }
  //           }
  //         }
  //       ]
  //     }
  //   }
  // }
  // `

  // const products = JSON.parse(products_s)

  // products.data.products.edges.map((edge: any) => {
  //   const id: string = edge.node.id
  //   const url: string = edge.node.featuredImage.url
  //   createProjectionMaps(id, url)
  // })

  receiveMessages()
  setInterval(receiveMessages, config.MJ_COOLDOWN_MS)
}

main()
