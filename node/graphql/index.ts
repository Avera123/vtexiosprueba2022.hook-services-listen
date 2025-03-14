import { v5 as uuidv5 } from 'uuid'
import bwipjs from 'bwip-js'

const MY_NAMESPACE = 'f83d8282-2924-4a94-b93d-14910fbfbd8d'

const routes = {
  baseUrl: (account: string) => `https://${account}.vtexcommercestable.com.br/api`,
  orderAPIBaseUrl: (account: string, orderId: string) => `${routes.baseUrl(account)}/oms/pvt/orders/${orderId}`,
  giftCardAPIBaseUrl: (account: string) => `${routes.baseUrl(account)}/giftcards`,
  clientEntityBaseUrl: (account: string) => `${routes.baseUrl(account)}/dataentities/CL`,
  checkoutProfileUser: (account: string, email: string) => `${routes.baseUrl(account)}/checkout/pub/profiles?email=${email}`,
  giftCardTransactionAPIBaseUrl: (account: string, giftCardId: string) => `${routes.giftCardAPIBaseUrl(account)}/${giftCardId}/transactions`,
  sendNotificationMessageCenter: (account: string) => `${routes.baseUrl(account)}/mail-service/pvt/sendmail`,
  baseUrlGiftCardSimpleEntity: (account: string, schema: string, id: string) => `${routes.baseUrl(account)}/dataentities/giftcards_fds/documents/${id}?_schema=${schema}`,
  baseUrlEventsEntity: (account: string, schema: string) => `${routes.baseUrl(account)}/dataentities/giftcards_fds/documents?_schema=${schema}`,
  baseUrlGiftCardEntity: (account: string, schema: string, code: string) => `${routes.baseUrl(account)}/dataentities/giftcards_fds/search?_fields=_all&_where=redemptionCode="${code}"&_schema=${schema}`,
  transactionNofity: (account: string, orderId: string, paymentId: string) => `${routes.baseUrl(account)}/oms/pvt/orders/${orderId}/payments/${paymentId}/payment-notification`,
}

const defaultHeaders = (authToken: string) => ({
  'Content-Type': 'application/json',
  'Accept': 'application/vnd.vtex.ds.v10+json',
  'VtexIdclientAutCookie': authToken,
  'Proxy-Authorization': authToken,
  'Pragma': 'no-cache',
  'Cache-Control': 'no-cache'
})

const defaultHeadersGiftCards = () => ({
  'Content-Type': 'application/json',
  'Accept': 'application/vnd.vtex.giftcard.v1+json',
  'Pragma': 'no-cache',
  'Cache-Control': 'no-cache',
  'X-VTEX-API-AppKey': 'vtexappkey-vtexiosprueba2022-WDRTGP',
  'X-VTEX-API-AppToken': 'TUUQOVIOKMIYKGVAHTDKELZLLIJRWDRGJCWZMWITNOHSVPAUCSVYHQVELPJHWHKAQGBOSNENPDLGTEYQETVUJLJWPWBHUJJYSSBXZQSYVYAZWBQXWFIJPQKTZWCLPYVO'
})

/*
    Consultar detalles de la Orden => GetOrder
    Guardar Orden en MD => POST Document (event_hook)
*/

export const resolvers = {
  Query: {
    getOrderDetails: async (_: any, params: any, ctx: any) => {
      const {
        vtex: ioContext,
        clients: { hub },
      } = ctx

      const { account, authToken } = ioContext

      const headers = defaultHeaders(authToken)

      const { data } = await hub.get(routes.orderAPIBaseUrl(account, params.orderId), headers)

      return data
    },
    getUserByEmail: async (_: any, params: any, ctx: any) => {
      const {
        vtex: ioContext,
        clients: { hub },
      } = ctx

      const { account, authToken } = ioContext

      const headers = defaultHeaders(authToken)

      const { data } = await hub.get(`${routes.clientEntityBaseUrl(account)}/search?email=${params}&_fields=_all`, headers)

      console.log({ data })

      return data
    },
    getUserById: async (_: any, params: any, ctx: any) => {
      const {
        vtex: ioContext,
        clients: { hub },
      } = ctx

      const { account, authToken } = ioContext

      const headers = defaultHeaders(authToken)

      const { data } = await hub.get(`${routes.clientEntityBaseUrl(account)}/documents/${params}?_fields=_all`, headers)

      return data
    },
    generateUserId: async (_: any, params: any, ctx: any) => {
      const {
        vtex: ioContext,
        clients: { hub },
      } = ctx

      const { account, authToken } = ioContext

      const headers = defaultHeaders(authToken)

      const { data } = await hub.get(routes.checkoutProfileUser(account, params), headers)

      return data
    },
    getGiftCardById: async (_: any, params: any, ctx: any) => {
      const {
        vtex: ioContext,
        clients: { hub },
      } = ctx

      const { account } = ioContext

      const headers = defaultHeadersGiftCards()

      const { data } = await hub.get(`${routes.giftCardAPIBaseUrl(account)}/${params}`, headers)

      return data
    },
    getGiftCardByCode: async (_: any, params: any, ctx: any) => {
      const {
        vtex: ioContext,
        clients: { hub },
      } = ctx

      const { account } = ioContext

      const headers = defaultHeadersGiftCards()

      const { data } = await hub.get(`${routes.baseUrlGiftCardEntity(account, "giftcards_fds_v1", params)}`, headers)

      console.log({ data })

      return data
    },
  },
  Mutation: {
    postNewGiftCard: async (_: any, params: any, ctx: any) => {
      const {
        vtex: ioContext,
        clients: { hub },
      } = ctx

      const { account } = ioContext

      const headers = defaultHeadersGiftCards()

      // console.log({ params })

      const { data } = await hub.post(routes.giftCardAPIBaseUrl(account), headers, {
        "relationName": `GiftCard from Store ${new Date().getTime()}`,
        "expiringDate": params.expiringDate,
        "caption": `Giftcard to Client ${uuidv5(`${new Date().getTime()}`, MY_NAMESPACE)}`,
        "profileId": params?.userProfileId,
        "currencyCode": "COP",
        "restrictedToOwner": params.restrictedToOwner,
        "multipleCredits": params.multipleCredits,
        "multipleRedemptions": params.multipleRedemptions
      })

      // const { data: newTransactionData } = await resolvers.Mutation.postNewTransactionGiftCard(null, {
      //     "operation": "Credit",
      //     "value": Number(params?.value),
      //     "description": "New Transaction",
      //     "redemptionCode": data?.redemptionCode,
      //     "redemptionToken": data?.redemptionToken,
      //     "idGiftCard": data?.id,
      //     "profileId": params?.userProfileId,
      // }, ctx)

      console.log({
        data,
        // newTransactionData
      })

      return data
    },
    postNewTransactionGiftCard: async (_: any, params: any, ctx: any) => {
      const {
        vtex: ioContext,
        clients: { hub },
      } = ctx

      const { account } = ioContext

      const headers = defaultHeadersGiftCards()

      const { data } = await hub.post(routes.giftCardTransactionAPIBaseUrl(account, params.idGiftCard), headers, {
        "operation": params.operation,
        "value": Number(params.value),
        "description": "Nueva recarga para generación de GiftCard",
        "requestId": `${uuidv5(`${new Date().getTime()}`, MY_NAMESPACE)}`,
        "redemptionCode": params.redemptionCode,
        "redemptionToken": params.redemptionToken,
      })

      console.log({ data })

      return data
    },
    postNewEvent: async (_: any, params: any, ctx: any) => {
      const {
        vtex: ioContext,
        clients: { hub },
      } = ctx

      const { account } = ioContext

      const headers = defaultHeadersGiftCards()

      // console.log({params})

      const { data } = await hub.post(routes.baseUrlEventsEntity(account, "hook_events_schema_v1"), headers, {
        "Domain": params.Domain,
        "OrderId": params.OrderId,
        "State": params.State,
      })

      console.log({ data })

      return data
    },
    postNewGiftCardMD: async (_: any, params: any, ctx: any) => {
      const {
        vtex: ioContext,
        clients: { hub },
      } = ctx

      const { account } = ioContext

      const headers = defaultHeadersGiftCards()

      console.log({ params })

      const barcodeBuffer = await bwipjs.toBuffer({
        bcid: 'code128',   
        text: params.redemptionCode, 
        scale: 2,
        height: 8,
        includetext: false,
      })
    
      let gifBase64 = `data:image/png;base64,${barcodeBuffer.toString('base64')}`

      const { data } = await hub.post(routes.baseUrlEventsEntity(account, "giftcards_fds_v1"), headers, {
        "email": params.email ?? "DEFAULT",
        "order": params.order ?? "DEFAULT",
        "userId": params.userId ?? "DEFAULT",
        "firstName": params.firstName ?? "DEFAULT",
        "lastName": params.lastName ?? "DEFAULT",
        "document": params.document ?? "DEFAULT",
        "idCustomer": params.idCustomer ?? "DEFAULT",
        "idGiftCard": params.idGiftCard ?? "DEFAULT",
        "redemptionCode": params.redemptionCode ?? "DEFAULT",
        "amount": Number(params.amount) || 0,
        "amount_formatted": params.amount_formatted || "DEFAULT",
        "store": params.store || "Venta Online",
        "seller": params.seller || "Ecommerce",
        "codebar_code": gifBase64 || "DEFAULT",
      })

      console.log({ data })

      return data
    },
    patchNewGiftCardAmountMD: async (_: any, params: any, ctx: any) => {
      const {
        vtex: ioContext,
        clients: { hub },
      } = ctx

      const { account } = ioContext

      const headers = defaultHeadersGiftCards()

      console.log({ params })

      const barcodeBuffer = await bwipjs.toBuffer({
        bcid: 'code128',   
        text: params.redemptionCode, 
        scale: 2,
        height: 8,
        includetext: false,
      })
    
      let gifBase64 = `data:image/png;base64,${barcodeBuffer.toString('base64')}`

      const { data } = await hub.patch(routes.baseUrlGiftCardSimpleEntity(account, "giftcards_fds_v1", params.id), headers, {
        "amount": Number(params.amount) || 0,
        "order": params.order,
        "email": params.email,
        "userId": params.userId,
        "firstName": params.firstName,
        "lastName": params.lastName,
        "document": params.document,
        "idCustomer": params.idCustomer,
        "idGiftCard": params.idGiftCard,
        "redemptionCode": params.redemptionCode,
        "amount_formatted": params.amount_formatted,
        "store": params.store || "Venta Online",
        "seller": params.seller || "Ecommerce",
        "codebar_code": gifBase64 || "DEFAULT",
      })

      console.log({ data })

      return data
    },
    postNewUser: async (_: any, params: any, ctx: any) => {
      const {
        vtex: ioContext,
        clients: { hub },
      } = ctx

      const { account } = ioContext

      const headers = defaultHeadersGiftCards()

      const { data } = await hub.post(`${routes.clientEntityBaseUrl(account)}/documents`, headers, {
        "email": params.email,
        "document": params.document,
        "documentType": "cedulaCOL",
        "firstName": params.name,
        "lastName": params.lastName
      })

      await resolvers.Query.generateUserId(null, params, ctx)

      return data
    },
    postUserIdUser: async (_: any, params: any, ctx: any) => {
      const {
        vtex: ioContext,
        clients: { hub },
      } = ctx

      const { account } = ioContext

      const headers = defaultHeadersGiftCards()

      // console.log({params})

      const { data } = await hub.patch(`${routes.clientEntityBaseUrl(account)}/documents/${params}`, headers, {
        "userId": params
      })

      console.log({ data })

      return data
    },
    transactionNofityPayment: async (_: any, params: any, ctx: any) => {
      const {
        vtex: ioContext,
        clients: { hub },
      } = ctx

      const { account } = ioContext

      const headers = defaultHeadersGiftCards()

      const { data } = await hub.post(`${routes.transactionNofity(account, params.orderId, params.paymentId)}`, headers)

      return data
    },
  }
}
