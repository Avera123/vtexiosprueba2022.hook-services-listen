import type { ClientsConfig, ServiceContext, RecorderState } from '@vtex/api'
import { LRUCache, method, Service } from '@vtex/api'

import { Clients } from './clients'
import { hooklistener } from './middlewares/hooklistener'
import { validateuser } from './middlewares/validateuser'
import { giftcardphisicalcreate } from './middlewares/giftcardphisicalcreate'
import { giftcardphisicaltransaction } from './middlewares/giftcardphisicaltransaction'
import {giftcardphisicalgetbyid} from './middlewares/giftcardphisicalgetbyid'
import {giftcardphisicalgetbycode} from './middlewares/giftcardphisicalgetbycode'

import { resolvers } from './graphql'

const TIMEOUT_MS = 800

const memoryCache = new LRUCache<string, any>({ max: 5000 })

metrics.trackCache('status', memoryCache)

// This is the configuration for clients available in `ctx.clients`.
const clients: ClientsConfig<Clients> = {
  // We pass our custom implementation of the clients bag, containing the Status client.
  implementation: Clients,
  options: {
    // All IO Clients will be initialized with these options, unless otherwise specified.
    default: {
      retries: 2,
      timeout: TIMEOUT_MS,
    },
    // This key will be merged with the default options and add this cache to our Status client.
    status: {
      memoryCache,
    },
  },
}

declare global {
  // We declare a global Context type just to avoid re-writing ServiceContext<Clients, State> in every handler and resolver
  type Context = ServiceContext<Clients, State>

  // The shape of our State object found in `ctx.state`. This is used as state bag to communicate between middlewares.
  interface State extends RecorderState {
    code: number
  }
}

// Export a service that defines route handlers and client options.
export default new Service({
  clients,
  graphql: {
    resolvers: {
      Query: resolvers.Query,
      Mutation: resolvers.Mutation
    },
  },
  routes: {
    validateuser: method({
      POST: [validateuser],
    }),
    hooklistener: method({
      POST: [hooklistener],
    }),
    giftcardphisicalcreate: method({
      POST: [giftcardphisicalcreate],
    }),
    giftcardphisicaltransaction: method({
      POST: [giftcardphisicaltransaction],
    }),
    giftcardphisicalgetbyid: method({
      POST: [giftcardphisicalgetbyid],
    }),
    giftcardphisicalgetbycode: method({
      POST: [giftcardphisicalgetbycode],
    }),
  },
})
