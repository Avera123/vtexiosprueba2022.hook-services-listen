import { json } from "co-body"
import { resolvers } from '../graphql'

export async function giftcardphisicalcreate(ctx: Context, next: () => Promise<any>) {

  const {
    req,
  } = ctx

  const body = await json(req)
  // console.info({ body })

  const userProfile = await resolvers.Query.getUserByEmail(null, body.email, ctx)

  const dataForGiftCard = {
    "quantity": 1,
    "value": body?.amount ?? 50000,
    "userProfileId": userProfile[0].userId ?? "",
    "restrictedToOwner": body.restrictedToOwner,
    "multipleCredits": body.multipleCredits,
    "multipleRedemptions": body.multipleRedemptions
  }

  const createdNewGiftCard = await resolvers.Mutation.postNewGiftCard(null, dataForGiftCard, ctx)

  console.log({createdNewGiftCard})

  // const createNewEvent = await resolvers.Mutation.postNewEvent(null, {
  //   "Domain": body.Domain,
  //   "OrderId": body.OrderId,
  //   "State": body.State,
  // }, ctx)

  // console.log({ createdNewGiftCard, createNewEvent })

  ctx.status = 200
  ctx.body = {
    "message": "OK",
    "initialData": body,
    "userProfile": userProfile,
    "createdNewGiftCard": createdNewGiftCard
  }

  await next()
}