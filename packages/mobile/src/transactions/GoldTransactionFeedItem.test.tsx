// @ts-ignore
import { toBeDisabled } from '@testing-library/jest-native'
import { render } from '@testing-library/react-native'
import * as React from 'react'
import 'react-native'
import { Provider } from 'react-redux'
import { TokenTransactionType } from 'src/apollo/types'
import GoldTransactionFeedItem from 'src/transactions/GoldTransactionFeedItem'
import { TransactionStatus } from 'src/transactions/types'
import { createMockStore, getMockI18nProps } from 'test/utils'

expect.extend({ toBeDisabled })

const localAmount = {
  value: '1.23',
  exchangeRate: '0.555',
  currencyCode: 'EUR',
}

describe('GoldTransactionFeedItem', () => {
  let dateNowSpy: any
  beforeAll(() => {
    // Lock Time
    dateNowSpy = jest.spyOn(Date, 'now').mockImplementation(() => 1487076708000)
    // set the offset to ALWAYS be Pacific for these tests regardless of where they are run
    // see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/getTimezoneOffset
    jest.spyOn(Date.prototype, 'getTimezoneOffset').mockImplementation(() => 420)
  })

  afterAll(() => {
    // Unlock Time
    dateNowSpy.mockRestore()
  })

  it('renders correctly', () => {
    const tree = render(
      <Provider store={createMockStore({})}>
        <GoldTransactionFeedItem
          status={TransactionStatus.Complete}
          __typename="TokenExchange"
          type={TokenTransactionType.Exchange}
          hash={'0x'}
          amount={{ value: '-1', currencyCode: 'cUSD', localAmount }}
          makerAmount={{ value: '1', currencyCode: 'cUSD', localAmount }}
          takerAmount={{ value: '10', currencyCode: 'cGLD', localAmount }}
          timestamp={1}
          {...getMockI18nProps()}
        />
      </Provider>
    )
    expect(tree).toMatchSnapshot()
  })

  it('tap disabled while pending', () => {
    const { getByTestId } = render(
      <Provider store={createMockStore({})}>
        <GoldTransactionFeedItem
          status={TransactionStatus.Pending}
          __typename="TokenExchange"
          type={TokenTransactionType.Exchange}
          hash={'0x'}
          amount={{ value: '-1', currencyCode: 'cUSD', localAmount }}
          makerAmount={{ value: '1', currencyCode: 'cUSD', localAmount }}
          takerAmount={{ value: '10', currencyCode: 'cGLD', localAmount }}
          timestamp={1}
          {...getMockI18nProps()}
        />
      </Provider>
    )
    expect(getByTestId('GoldTransactionFeedItem')).toBeDisabled()
  })
})
