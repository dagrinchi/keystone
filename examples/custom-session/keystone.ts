import { config } from '@keystone-6/core';
import { fixPrismaPath } from '../example-utils';
import { lists, Session } from './schema';
import type { Context, TypeInfo } from '.keystone/types';

const sillySessionStrategy = async ({
  context,
}: {
  context: Context;
}): Promise<Session | undefined> => {
  if (!context.req) return;

  // WARNING: for demonstrative purposes only, this has no authentication
  //   use `Cookie:user=clh9v6pcn0000sbhm9u0j6in0` for Alice (admin)
  //   use `Cookie:user=clh9v762w0002sbhmhhyc0340` for Bob
  //
  // in practice, you should use authentication for your sessions, such as OAuth or JWT
  const { cookie = '' } = context.req.headers;
  const [cookieName, id] = cookie.split('=');
  if (cookieName !== 'user') return;

  const who = await context.sudo().db.User.findOne({ where: { id } });
  if (!who) return;
  return {
    id,
    admin: who.admin,
  };
};

export default config<TypeInfo>({
  db: {
    provider: 'sqlite',
    url: process.env.DATABASE_URL || 'file:./keystone-example.db',

    // WARNING: this is only needed for our monorepo examples, dont do this
    ...fixPrismaPath,
  },
  lists,
  getSession: sillySessionStrategy,
});
