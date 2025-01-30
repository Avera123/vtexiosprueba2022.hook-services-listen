import { json } from "co-body"
import { resolvers } from '../graphql'

export async function validateuser(ctx: Context, next: () => Promise<any>) {
  const {
    req
  } = ctx

  // const secure_code = String(req.headers['fds-secure-code'])

  // if (secure_code !== '6ee1c07b-a3f5-4941-b9d9-80dc55a76dbe') {
  //   ctx.status = 403
  //   ctx.body = {
  //     "message": `No tienes permiso para acceder a este recurso.`
  //   }

  //   return await next()
  // }

  const body = await json(req)
  // console.log(body, secure_code)

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
