import { json } from "co-body"
import { resolvers } from '../graphql'

export async function hooklistener(ctx: Context, next: () => Promise<any>) {
  const {
    req,
  } = ctx

  const body = await json(req)

  console.info({ body })

  // Validamos si el estado de la orden es el correcto
  if (body.State != 'ready-for-handling') {
    ctx.status = 200
    ctx.body = {
      "message": "OK"
    }
    return
  }

  // Consultamos la información detallada de la orden
  const orderDetails = await resolvers.Query.getOrderDetails(null, {
    "orderId": body.OrderId
  }, ctx)

  // console.log({orderDetails})

  // Validamos si hay GiftCards y seleccionamos los datos para crearla.
  const dataForGiftCard = {
    "quantity": orderDetails?.items[0].quantity ?? 1,
    "value": orderDetails?.items[0].sellingPrice ?? 50000,
    "userProfileId": orderDetails?.clientProfileData?.userProfileId ?? "",
  }

  const createdNewGiftCard = await resolvers.Mutation.postNewGiftCard(null, dataForGiftCard, ctx)

  const createNewEvent = await resolvers.Mutation.postNewEvent(null, {
    "Domain": body.Domain,
    "OrderId": body.OrderId,
    "State": body.State,
  }, ctx)

  console.log({ createdNewGiftCard, createNewEvent })

  ctx.status = 200
  ctx.body = {
    "message": "OK",
    "eventExample": body,
    "dataGiftCards": createdNewGiftCard
  }

  await next()
}
