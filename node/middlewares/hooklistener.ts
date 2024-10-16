import {json} from "co-body"

export async function hooklistener(ctx: Context, next: () => Promise<any>) {
  const {
    req
  } = ctx

  const body = await json(req)

  console.log(body)

  ctx.status = 200
  ctx.body = {
    "message":"OK"
  }

  await next()
}
