import { json } from "co-body"
import { resolvers } from '../graphql'

export async function giftcardphisicalcreate(ctx: Context, next: () => Promise<any>) {

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
  console.info({ body })

  const userProfile = await resolvers.Query.getUserByEmail(null, body.email, ctx)

  console.log({ userProfile })

  const dataForGiftCard = {
    "quantity": 1,
    "value": body?.amount ?? 0,
    "userProfileId": userProfile[0].userId ?? "",
    "restrictedToOwner": body.restrictedToOwner,
    "multipleCredits": body.multipleCredits,
    "multipleRedemptions": body.multipleRedemptions,
    "expiringDate": body.expiringDate
  }

  const createdNewGiftCard = await resolvers.Mutation.postNewGiftCard(null, dataForGiftCard, ctx)

  console.log({ createdNewGiftCard })

  const createNewGiftCardMD = await resolvers.Mutation.postNewGiftCardMD(null, {
    "email": body.email,
    "order": "DEFAULT",
    "userId": userProfile[0].userId ?? 'DEFAULT',
    "firstName": body.name,
    "lastName": body.lastName,
    "document": body.document,
    "idCustomer": userProfile[0].id ?? 'DEFAULT' ,
    "idGiftCard": createdNewGiftCard.id,
    "redemptionCode": createdNewGiftCard.redemptionCode,
    "amount": body.amount,
    "amount_formatted": String(Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0}).format(Number(body.amount) ?? 0)),
    "store":"Venta Online",
    "seller":"Ecommerce"
  }, ctx)

  console.log({ createNewGiftCardMD })

  ctx.status = 200
  ctx.body = {
    "message": "OK",
    "initialData": body,
    "userProfile": userProfile,
    "createdNewGiftCard": createdNewGiftCard,
    "createNewGiftCardMD": createNewGiftCardMD
  }

  await next()
}
