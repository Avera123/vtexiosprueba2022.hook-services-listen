import { v5 as uuidv5 } from 'uuid';

const MY_NAMESPACE = 'f83d8282-2924-4a94-b93d-14910fbfbd8d'

const routes = {
    baseUrl: (account: string) => `https://${account}.vtexcommercestable.com.br/api`,
    orderAPIBaseUrl: (account: string, orderId: string) => `${routes.baseUrl(account)}/oms/pvt/orders/${orderId}`,
    giftCardAPIBaseUrl: (account: string) => `${routes.baseUrl(account)}/giftcards`,
    clientEntityBaseUrl: (account: string) => `${routes.baseUrl(account)}/dataentities/CL`,
    checkoutProfileUser: (account: string, email: string) => `${routes.baseUrl(account)}/checkout/pub/profiles?email=${email}`,
    giftCardTransactionAPIBaseUrl: (account: string, giftCardId: string) => `${routes.giftCardAPIBaseUrl(account)}/${giftCardId}/transactions`,
    sendNotificationMessageCenter: (account: string) => `${routes.baseUrl(account)}/mail-service/pvt/sendmail`,
    baseUrlEventsEntity: (account: string, schema: string) => `${routes.baseUrl(account)}/dataentities/hook_events/documents?_schema=${schema}`,
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
                "expiringDate": "2024-12-30T13:15:30Z",
                "caption": `Giftcard to Client ${uuidv5(`${new Date().getTime()}`, MY_NAMESPACE)}`,
                "profileId": params?.userProfileId,
                "currencyCode": "COP",
                "restrictedToOwner": params.restrictedToOwner,
                "multipleCredits": params.multipleCredits,
                "multipleRedemptions": params.multipleRedemptions
            })

            const { data: newTransactionData } = await resolvers.Mutation.postNewTransactionGiftCard(null, {
                "operation": "Credit",
                "value": params?.value,
                "description": "New Transaction",
                "redemptionCode": data?.redemptionCode,
                "redemptionToken": data?.redemptionToken,
                "idGiftCard": data?.id,
                "profileId": params?.userProfileId,
            }, ctx)

            
            const dataMessageToSend = {
                "accountName": "vtexiosprueba2022",
                "serviceType": 0,
                "templateName": "giftcard-notification",
                "jsonData": {
                    "email": "*testmail@gmail.com",
                    "value": params.value,
                    "description": "New Transaction",
                    "requestId": "12345678910",
                    "redemptionCode": params.redemptionCode,
                    "redemptionToken": params.redemptionToken,
                    "data": data
                }
            }

            const messageRequest = await hub.post(routes.sendNotificationMessageCenter(account), dataMessageToSend, headers)

            console.log({ messageRequest })

            console.log({ data, newTransactionData })

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
                "operation": "Credit",
                "value": params.value,
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
    }
}