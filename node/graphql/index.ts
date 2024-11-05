
const routes = {
    baseUrl: (account: string) => `https://${account}.vtexcommercestable.com.br/api`,
    orderAPIBaseUrl: (account: string, orderId: string) => `${routes.baseUrl(account)}/oms/pvt/orders/${orderId}`,
    giftCardAPIBaseUrl: (account: string) => `${routes.baseUrl(account)}/giftcards`,
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
        // getEventsBySearch
    },
    Mutation: {
        postNewGiftCard: async (_: any, params: any, ctx: any) => {
            const {
                vtex: ioContext,
                clients: { hub },
            } = ctx

            const { account } = ioContext

            const headers = defaultHeadersGiftCards()

            // console.log({params})

            const { data } = await hub.post(routes.giftCardAPIBaseUrl(account), headers, {
                "relationName": "GiftCard from Store 1",
                "expiringDate": "2024-12-30T13:15:30Z",
                "caption": "Giftcard to Client",
                "profileId": params?.userProfileId,
                "currencyCode": "COP",
                "restrictedToOwner": false,
                "multipleCredits": false,
                "multipleRedemptions": true
            })

            const { data: newTransactionData } = await resolvers.Mutation.postNewTransactionGiftCard(null, {
                "operation": "Credit",
                "value": params?.value,
                "description": "New Transaction",
                "requestId": "98765432",
                "redemptionCode": data?.redemptionCode,
                "redemptionToken": data?.redemptionToken,
                "idGiftCard": data?.id,
            }, ctx)

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
                "description": "New Transaction",
                "requestId": "12345678910",
                "redemptionCode": params.redemptionCode,
                "redemptionToken": params.redemptionToken,
            })

            // const dataMessageToSend = {
            //     "accountName": "vtexiosprueba2022",
            //     "serviceType": 0,
            //     "templateName": "giftcard-notification",
            //     "jsonData": {
            //         "email": "alejandroveracarrasquilla01@gmail.com",
            //         "value": params.value,
            //         "description": "New Transaction",
            //         "requestId": "12345678910",
            //         "redemptionCode": params.redemptionCode,
            //         "redemptionToken": params.redemptionToken,
            //     }
            // }

            // const messageRequest = await hub.post(routes.sendNotificationMessageCenter(account), dataMessageToSend, headers)

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
                "Domain":params.Domain, 
                "OrderId":params.OrderId, 
                "State":params.State, 
            })

            console.log({ data })

            return data
        },
        // deleteNewEvent
        // putEvent
    }
}