import { json } from "co-body"
import { resolvers } from '../graphql'

export async function giftcardphisicaltransaction(ctx: Context, next: () => Promise<any>) {

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

  console.log(body)

  const dataForGiftCard = {
    "operation": body.operation,
    "value": body.value,
    "description": "Nueva recarga para generación de GiftCard",
    "redemptionCode": body.redemptionCode,
    "redemptionToken": body.redemptionToken
  }

  const getGiftCardMDByCode = await resolvers.Query.getGiftCardByCode(null, dataForGiftCard.redemptionCode, ctx)

  console.log({ getGiftCardMDByCode })

  const createdNewGiftCardTransaction = await resolvers.Mutation.postNewTransactionGiftCard(null,
    {
      "idGiftCard": getGiftCardMDByCode[0].idGiftCard,
      "operation": body.operation,
      "value": body.value,
      "description": "Nueva recarga para generación de GiftCard",
      "redemptionCode": body.redemptionCode,
      "redemptionToken": body.redemptionToken
    }, ctx)

  console.log({ createdNewGiftCardTransaction })

  if (getGiftCardMDByCode[0].id) {
    const updatedGiftCard = await resolvers.Mutation.patchNewGiftCardAmountMD(null, {
      "id": getGiftCardMDByCode[0].id,
      "amount": Number(getGiftCardMDByCode[0].amount) - Number(dataForGiftCard.value) || 0,
      "order": getGiftCardMDByCode[0].order,
      "email": getGiftCardMDByCode[0].email,
      "userId": getGiftCardMDByCode[0].userId,
      "firstName": getGiftCardMDByCode[0].firstName,
      "lastName": getGiftCardMDByCode[0].lastName,
      "document": getGiftCardMDByCode[0].document,
      "idCustomer": getGiftCardMDByCode[0].idCustomer,
      "idGiftCard": getGiftCardMDByCode[0].idGiftCard,
      "redemptionCode": getGiftCardMDByCode[0].redemptionCode,
    }, ctx)

    console.log({ updatedGiftCard })
  }

  ctx.status = 200
  ctx.body = {
    "message": "OK",
    "initialData": body,
    "createdNewGiftCardTransaction": createdNewGiftCardTransaction,
    "getGiftCardMDByCode": getGiftCardMDByCode
  }

  await next()
}