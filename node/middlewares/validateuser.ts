import { json } from "co-body"
import { resolvers } from '../graphql'

export async function validateuser(ctx: Context, next: () => Promise<any>) {
  const {
    req,
  } = ctx

  const body = await json(req)
  // console.info({ body })

  //Validate email on body
  if (!body.email || body.email == null || body.email == '') {
    ctx.status = 500;
    ctx.body = {
      message: 'Error: El correo electrónico es obligatorio',
      status: 500
    }
    return
  }

  const userProfile = await resolvers.Query.getUserByEmail(null, body.email, ctx)

  if (userProfile.length > 0) {
    if (userProfile[0].userId != null) {
      console.info({ userProfile })
      ctx.status = 200
      ctx.body = {
        "message": `OK, usuario existente => ${body.email}`,
        "userProfile": userProfile,
        "initialData": body
      }
      return await next()
    } else {
      await resolvers.Query.generateUserId(null, body.email, ctx)

      ctx.status = 200
      ctx.body = {
        "message": `OK, usuario existente => ${body.email}`,
        "userProfile": userProfile,
        "initialData": body
      }
      return await next()
    }
  } else {
    console.error(`Creación del usuario: ${body.email}`)
    await resolvers.Mutation.postNewUser(null, body, ctx)
    await resolvers.Query.generateUserId(null, body.email, ctx)

    ctx.status = 200
    ctx.body = {
      "message": `OK, usuario existente => ${body.email}`,
      "userProfile": userProfile,
      "initialData": body
    }
  }

  return await next()
}
