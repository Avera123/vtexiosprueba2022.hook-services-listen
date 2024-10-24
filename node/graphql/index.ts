
const routes = {
    baseUrl: (account: string) => `http://${account}.vtexcommercestable.com.br/api`,
    orderAPIBaseUrl: (account:string, orderId: string) => `${routes.baseUrl(account)}/oms/pvt/orders/${orderId}`
}

const defaultHeaders = (authToken: string) => ({
    'Content-Type': 'application/json',
    'Accept': 'application/vnd.vtex.ds.v10+json',
    'VtexIdclientAutCookie': authToken,
    'Proxy-Authorization': authToken,
    'Pragma': 'no-cache',
    'Cache-Control': 'no-cache',
})

/* 
    Consultar detalles de la Orden => GetOrder
    Guardar Orden en MD => POST Document (event_hook)
*/

export const resolvers = {
    Query:{
        getOrderDetails: async (_:any, params:any, ctx:any) =>{
            const {
                vtex: ioContext,
                clients: { hub },
            } = ctx
            const {account, authToken} = ioContext

            const headers = defaultHeaders(authToken)

            const { data } = await hub.get(routes.orderAPIBaseUrl(account, params.orderId), headers)

            console.log({data})

            return data
        }
    },
    Mutation:{

    }
}