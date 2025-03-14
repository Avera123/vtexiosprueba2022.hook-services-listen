import { json } from "co-body"
import { resolvers } from '../graphql'
import bwipjs from 'bwip-js'

export async function hooklistener(ctx: Context, next: () => Promise<any>) {
  const {
    req,
  } = ctx

  const body = await json(req)

  console.info({ body })

  const svg = bwipjs.toSVG({
    bcid: 'code128',       // Barcode type
    text: 'FCHQ-UHVK-HDYJ-MBCL',    // Text to encode
    height: 12,              // Bar height, in millimeters
    includetext: false,            // Show human-readable text
    textxalign: 'center',        // Always good to set this
    textcolor: 'ff0000',        // Red text
  });

  console.log(svg)

  // const buf:any = await new Promise((resolve, reject) => {
  //   bwipjs.toBuffer({
  //     bcid: 'code128',       // Tipo de código de barras
  //     text: 'FCHQ-UHVK-HDYJ-MBCL',    // Texto a codificar
  //     scale: 3,               // Factor de escala 3x
  //     height: 10,             // Altura de las barras en milímetros
  //     includetext: true,      // Incluir texto legible
  //     textxalign: 'center',   // Alineación del texto
  //   }, function (err, png) {
  //     if (err) {
  //       reject(err); // Si hay un error, rechaza la Promise
  //     } else {
  //       resolve(png); // Si todo va bien, resuelve la Promise con el buffer
  //     }
  //   });
  // });

  // // var atob = require('atob');
  // console.log(String(buf))

  // return

  // ctx.status = 200
  // ctx.body = {
  //   "hookConfig": "ping"
  // }

  // console.log(body.State)

  if (body.State == 'payment-pending') {
    // Consultamos la información detallada de la orden
    const orderDetails = await resolvers.Query.getOrderDetails(null, {
      "orderId": body.OrderId
    }, ctx)

    // console.log({ orderDetails })

    const isOverPayment = orderDetails.paymentData.transactions[0].payments.filter((item: any) => item.paymentSystem === '201')
    const items = orderDetails.items.filter((item: any) => item.additionalInfo.categories[0].id === 50)

    console.log({ isOverPayment, items })

    if (items.length >= 1 && isOverPayment.length >= 1) {
      console.error("No se debe procesar el pago")
    } else {
      console.error("Se debe procesar el pago")
      if (isOverPayment.length >= 1) {
        await resolvers.Mutation.transactionNofityPayment(null, {
          orderId: body.OrderId,
          paymentId: isOverPayment[0].id
        }, ctx)
      }
    }

    ctx.status = 200
    ctx.body = {
      "message": "OK",
      "order": orderDetails,
      "payments": isOverPayment,
      "items": items
    }
    return
  }

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

  console.log({ orderDetails })

  // Validamos si hay GiftCards y seleccionamos los datos para crearla.
  const dataForGiftCard = {
    "quantity": orderDetails?.items[0].quantity ?? 1,
    "value": Number(orderDetails?.items[0].sellingPrice / 100) ?? 0,
    "userProfileId": orderDetails?.clientProfileData?.userProfileId ?? "",
  }

  //Filtramos los productos
  const items = orderDetails.items.filter((item: any) => item.additionalInfo.categories[0].id === 50)

  let giftCardsResult: any[] = []

  items.forEach(async (giftcard: any) => {
    console.log({ giftcard })

    for (let index = 1; index <= giftcard.quantity; index++) {
      setTimeout(async () => {
        const createdNewGiftCard = await resolvers.Mutation.postNewGiftCard(null, dataForGiftCard, ctx)

        console.log({ createdNewGiftCard })

        const createNewGiftCardMD = await resolvers.Mutation.postNewGiftCardMD(null, {
          "email": String(orderDetails?.clientProfileData?.email).split("-")[0],
          "order": body.OrderId,
          "userId": orderDetails?.clientProfileData?.userProfileId ?? 'DEFAULT',
          "firstName": orderDetails?.clientProfileData?.firstName,
          "lastName": orderDetails?.clientProfileData?.lastName,
          "document": orderDetails?.clientProfileData?.document,
          "idCustomer": orderDetails?.clientProfileData?.userProfileId ?? 'DEFAULT',
          "idGiftCard": createdNewGiftCard.id,
          "redemptionCode": createdNewGiftCard.redemptionCode,
          "amount": Number(orderDetails?.items[0].sellingPrice / 100) ?? 0,
          "amount_formatted": String(Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0}).format(Number(orderDetails?.items[0].sellingPrice / 100) ?? 0)),
          "store": "Venta Online",
          "seller": "Ecommerce"
        }, ctx)

        giftCardsResult.push(createdNewGiftCard)

        console.log({ createNewGiftCardMD })
      }, 5000)
    }
  })

  const giftCardsOnUse = orderDetails.paymentData.giftCards.filter((item: any) => item.inUse)

  giftCardsOnUse.forEach(async (giftCardUsed: any) => {
    const giftCard = await resolvers.Query.getGiftCardById(null, giftCardUsed.id, ctx)

    console.log({ giftCard })

    const getGiftCardMDByCode = await resolvers.Query.getGiftCardByCode(null, giftCard.redemptionCode, ctx)

    console.log({ getGiftCardMDByCode })

    if (getGiftCardMDByCode.length >= 1 && getGiftCardMDByCode[0]?.id) {
      const updatedGiftCard = await resolvers.Mutation.patchNewGiftCardAmountMD(null, {
        "id": getGiftCardMDByCode[0].id,
        "amount": giftCard.balance || 0,
        "order": getGiftCardMDByCode[0].order,
        "email": getGiftCardMDByCode[0].email,
        "userId": getGiftCardMDByCode[0].userId,
        "firstName": getGiftCardMDByCode[0].firstName,
        "lastName": getGiftCardMDByCode[0].lastName,
        "document": getGiftCardMDByCode[0].document,
        "idCustomer": getGiftCardMDByCode[0].idCustomer,
        "idGiftCard": getGiftCardMDByCode[0].idGiftCard,
        "redemptionCode": getGiftCardMDByCode[0].redemptionCode,
        "amount_formatted": String(Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0}).format(Number(giftCard.balance) ?? 0)),
        "store": "Venta Online",
        "seller": "Ecommerce"
      }, ctx)

      console.log({ updatedGiftCard })
    }
  })

  ctx.status = 200
  ctx.body = {
    "message": "OK",
    "eventExample": body,
    "dataGiftCards": giftCardsResult,
    "orderDetails": orderDetails
  }

  await next()
}
