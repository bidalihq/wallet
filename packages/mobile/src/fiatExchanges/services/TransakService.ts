import { CURRENCY_ENUM } from '@celo/utils'
import { PaymentMethod } from 'src/fiatExchanges/FiatExchangeOptions'
import { CicoService, RequestBody } from 'src/fiatExchanges/services/CicoService.abstract'
import networkConfig from 'src/geth/networkConfig'

export class TransakService extends CicoService {
  static getInstance() {
    if (!this.instance) {
      this.instance = new TransakService()
    }
    return this.instance
  }

  private static instance: TransakService

  private baseUrl: string

  constructor() {
    super()

    this.baseUrl = networkConfig.transakApiUrl
  }

  getFeesPolicy(paymentMethod: PaymentMethod) {
    // From: https://www.notion.so/On-ramp-Buy-Crypto-976ee96fc0764628ba990b550b1310d3
    if (paymentMethod === PaymentMethod.Card) {
      return {
        percentage: 3.9,
        extraPercentage: 0.3,
        minimum: 5,
      }
    }
    if (paymentMethod === PaymentMethod.Bank) {
      return {
        percentage: [0.25, 0.5],
      }
    }
  }

  getFees(
    cryptoAsset: string,
    fiatAsset: string,
    requestedFiatAmount: number,
    paymentMethod: PaymentMethod
  ) {
    const cryptoCurrency =
      {
        [CURRENCY_ENUM.DOLLAR]: 'CUSD',
        [CURRENCY_ENUM.GOLD]: 'CELO',
      }[cryptoAsset] || cryptoAsset
    return this.get('/currencies/price', {
      fiatCurrency: fiatAsset,
      cryptoCurrency,
      isBuyOrSell: 'BUY',
      fiatAmount: requestedFiatAmount,
      paymentMethodId:
        paymentMethod === PaymentMethod.Bank ? 'gbp_bank_transfer' : 'credit_debit_card',
    })
      .then((response) => response.json())
      .then(({ response: { totalFee: fee } }) => ({ fee }))
  }

  private get(path: string, body: RequestBody) {
    return fetch(`${this.baseUrl}${path}?${this.bodyToParams(body)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
  }
}
