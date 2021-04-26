import { Counter, Gauge, Histogram } from 'prom-client'

export class ApiMetrics {
  private lastBlockNotified: Gauge<string>
  private numberSuccessfulNotifications: Counter<string>
  private numberUnsuccessfulNotifications: Counter<string>
  private pendingRequestsSize: Gauge<string>
  private numberUnnotifiedRequests: Gauge<string>
  private blockDelay: Histogram<string>
  private latestTokenTransfersDuration: Histogram<string>
  private notificationLatency: Histogram<string>
  private exchangeQueryDuration: Histogram<string>

  constructor() {
    this.lastBlockNotified = new Gauge({
      name: 'last_block_notified',
      help: 'The most recent block observed, used for checkpointing when polling blockscout.',
    })

    this.numberSuccessfulNotifications = new Counter({
      name: 'num_successful_notifications',
      help: 'Increments the Notifications Service successfully dispatches a notification.',
      labelNames: ['notification_type'],
    })

    this.numberUnsuccessfulNotifications = new Counter({
      name: 'num_unsuccessful_notifications',
      help:
        'Increments the Notifications Service encounters an error while dispatching a notification.',
      labelNames: ['notification_type'],
    })

    this.pendingRequestsSize = new Gauge({
      name: 'pending_requests_count',
      help:
        'The current size of pendingRequestsRef, the reference to the pending requests array in Firebase.',
    })

    this.numberUnnotifiedRequests = new Gauge({
      name: 'num_unnotified_requests',
      help: 'The current number of pending requests where request.notified == false.',
    })

    this.blockDelay = new Histogram({
      name: 'block_delay',
      help:
        'The number of blocks that exist to be processed, sampled for each notification as it is sent.',
      buckets: [0, 1, 5, 10, 20, 50, 100],
    })

    this.notificationLatency = new Histogram({
      name: 'notification_latency_secs',
      help:
        'Samples the difference in seconds between when the notification was sent and the timestamp on the event that is being notified for',
      buckets: [0.1, 1, 5, 10, 25, 75, 200, 500],
      labelNames: ['notification_type'],
    })

    this.latestTokenTransfersDuration = new Histogram({
      name: 'latest_token_transfers_ms',
      help: 'Samples the execution duration of the getLatestTokenTransfers query to blockscout.',
      buckets: [10, 50, 100, 250, 500, 1000, 5000, 10000],
    })

    this.exchangeQueryDuration = new Histogram({
      name: 'handle_exchange_query_ms',
      help:
        'Samples the execution duration of the query within handleExchangeQuery, a measure of how long it takes to retrieve external exchange rates.',
      buckets: [10, 50, 100, 250, 500, 1000, 5000, 10000],
    })
  }

  setLastBlockNotified(lastBlockNotified: number) {
    this.lastBlockNotified.inc(lastBlockNotified)
  }

  sentNotification(notificationType: string) {
    this.numberSuccessfulNotifications.inc({ notification_type: notificationType })
  }

  failedNotification(notificationType: string) {
    this.numberUnsuccessfulNotifications.inc({ notification_type: notificationType })
  }

  setPendingRequestsSize(count: number) {
    this.pendingRequestsSize.set(count)
  }

  setNumberUnnotifiedRequests(count: number) {
    this.numberUnnotifiedRequests.set(count)
  }

  setBlockDelay(count: number) {
    this.blockDelay.observe(count)
  }

  setNotificationLatency(durationSeconds: number, notificationType: string) {
    this.notificationLatency.observe({ notification_type: notificationType }, durationSeconds)
  }

  setLatestTokenTransfersDuration(durationSeconds: number) {
    this.latestTokenTransfersDuration.observe(durationSeconds)
  }

  setExchangeQueryDuration(durationSeconds: number) {
    this.exchangeQueryDuration.observe(durationSeconds)
  }
}
export const metrics = new ApiMetrics()