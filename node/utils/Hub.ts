import { ExternalClient, InstanceOptions, IOContext } from '@vtex/api'

export default class RequestHub extends ExternalClient {
    constructor(context: IOContext, options?:InstanceOptions){
        super(
            `http://${context.account}.vtexcommercestable.com.br/api/`,
            context,
            options
        )
    }

    public authToken() {
        return this.context.authToken
    }

    public account(){
        this.context.account
    }

    public get(url:string, headers:any, data?:any){
        return this.http.getRaw(url,{
            headers,
            data,
        })
    }

    public post(url:string, headers:any, data?:any){
        return this.http.postRaw(url, data, {
            headers,
        })
    }

    public put(url:string, headers:any, data?:any){
        return this.http.putRaw(url, data,{
            headers,
        })
    }

    public patch(url:string, headers:any, data?:any){
        return this.http.patch(url, data,{
            headers,
        })
    }

    public delete(url:string, headers?:any){
        return this.http.delete(url,{
            headers,
        })
    }
}