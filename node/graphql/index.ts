
const routes = {
    baseUrl: (account: string) => `http://${account}.vtexcommercestable.com.br/api`,
    orderAPIBaseUrl: (account: string, orderId: string) => `${routes.baseUrl(account)}/oms/pvt/orders/${orderId}`,
    giftCardAPIBaseUrl: (account: string) => `${routes.baseUrl(account)}/giftcards`,
    giftCardTransactionAPIBaseUrl: (account: string, giftCardId: string) => `${routes.giftCardAPIBaseUrl(account)}/${giftCardId}/transactions`
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
        }
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

            const {data: newTransactionData} = await resolvers.Mutation.postNewTransactionGiftCard(null,{
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

            console.log({ data })

            return data
        }
    }
}