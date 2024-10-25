
const routes = {
    baseUrl: (account: string) => `http://${account}.vtexcommercestable.com.br/api`,
    orderAPIBaseUrl: (account: string, orderId: string) => `${routes.baseUrl(account)}/oms/pvt/orders/${orderId}`,
    giftCardAPIBaseUrl: (account: string) => `${routes.baseUrl(account)}/giftcards`
}

const defaultHeaders = (authToken: string) => ({
    'Content-Type': 'application/json',
    'Accept': 'application/vnd.vtex.ds.v10+json',
    'VtexIdclientAutCookie': authToken,
    'Proxy-Authorization': authToken,
    'Pragma': 'no-cache',
    'Cache-Control': 'no-cache',
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

            // console.log({params})
            const { data } = await hub.post(routes.giftCardAPIBaseUrl(account), defaultHeadersGiftCards, {
                "relationName": "GiftCard from Store",
                "expiringDate": "2024-12-30T13:15:30Z",
                "caption": "Giftcard to Client",
                "profileId": params?.dataForGiftCard?.userProfileId,
                "currencyCode": "COP",
                "restrictedToOwner": false,
                "multipleCredits": true,
                "multipleRedemptions": true
            })

            console.log({ data })

            return data
        }
    }
}