import {json} from "co-body"

import {resolvers} from '../graphql'

export async function hooklistener(ctx: Context, next: () => Promise<any>) {
  const {
    req,
  } = ctx

  const body = await json(req)

  const orderDetails = resolvers.Query.getOrderDetails(null, {
    "orderId":"1467650501956-01"
  }, null)

  console.log(body, orderDetails)

  ctx.status = 200
  ctx.body = {
    "message":"OK"
  }

  await next()
}
