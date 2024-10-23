import express from "express"
import { adminClient, adminGqlClient, storefrontClient } from "../../config"


export const router = express.Router()

router.get('/shipping/:code', async (req, res) => {
  try {
    const query = await adminGqlClient.request(`#graphql
    query getShippingRates {
      deliveryProfiles(first:1) {
        nodes {
          zoneCountryCount
          originLocationCount
          locationsWithoutRatesCount
          profileLocationGroups {
            locationGroupZones(first:30) {
              nodes {
                zone {
                  countries {
                    code {
                      countryCode
                    }
                  }
                }
                methodDefinitions(first: 1) {
                  nodes {
                    name
                    rateProvider {
                      ...on DeliveryRateDefinition {
                        id
                        price {
                          amount
                          currencyCode
                        }
                      }
                    }
                  }
                }	
              }
            }
          }
        }
      }
    }
    `)

    const countryCode = req.params.code
    const zones: Array<any> = query.data?.deliveryProfiles.nodes.at(0)?.profileLocationGroups.at(0)?.locationGroupZones?.nodes

    // // Find methodDefinition for countryCode
    let methodDefinition: any
    let zoneIndex = 0
    while (!methodDefinition && zoneIndex < zones.length) {
      const zone = zones.at(zoneIndex)!
      let countryIndex = 0
      while (!methodDefinition && countryIndex < zone.zone.countries.length) {
        if (zone.zone.countries.at(countryIndex)!.code.countryCode == countryCode) {
          methodDefinition = zone.methodDefinitions.nodes.at(0)!
        }
        countryIndex++
      }
      zoneIndex++
    }

    let shippingOption: {
      price: {
        amount: number,
        currencyCode: string
      },
      name: string
    } | undefined

    if (!methodDefinition) throw Error("Price not found")
    shippingOption = {
      name: methodDefinition.name,
      price: methodDefinition.rateProvider.price
    }

    res.status(200).json(shippingOption)
  }
  catch (e) {
    res.status(500).json("Internal Error")
  }
})
