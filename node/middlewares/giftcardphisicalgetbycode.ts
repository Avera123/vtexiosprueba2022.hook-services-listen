import { json } from "co-body"
import { resolvers } from '../graphql'

export async function giftcardphisicalgetbycode(ctx: Context, next: () => Promise<any>) {

  const {
    req,
  } = ctx

  // const secure_code = String(req.headers['fds-secure-code'])

  // if (secure_code !== '6ee1c07b-a3f5-4941-b9d9-80dc55a76dbe') {
  //   ctx.status = 403
  //   ctx.body = {
  //     "message": `No tienes permiso para acceder a este recurso.`
  //   }

  //   return await next()
  // }


  const body = await json(req)

  console.log({body})

  const dataGiftCard = await resolvers.Query.getGiftCardByCode(null, body.code || "GIFT", ctx)

  console.log({dataGiftCard})

  ctx.status = 200
  ctx.body = {
    "message": "OK",
    "initialData": body,
    "dataGiftCard": dataGiftCard
  }

  await next()
}