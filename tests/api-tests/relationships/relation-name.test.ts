import { list } from '@keystone-6/core';
import { allowAll } from '@keystone-6/core/access';
import { relationship } from '@keystone-6/core/fields';
import { getPrismaSchema, apiTestConfig, dbProvider } from '../utils';

test('when not specifying relationName in a many to many relationship, the name is picked based on the lexicographic list key + field key ordering', async () => {
  const prismaSchema = await getPrismaSchema(
    apiTestConfig({
      lists: {
        A: list({
          access: allowAll,
          fields: {
            b: relationship({ ref: 'B.a', many: true }),
          },
        }),
        B: list({
          access: allowAll,
          fields: {
            a: relationship({ ref: 'A.b', many: true }),
          },
        }),
      },
    })
  );
  expect(prismaSchema)
    .toEqual(`// This file is automatically generated by Keystone, do not modify it manually.
// Modify your Keystone config when you want to change this.

datasource ${dbProvider} {
  url               = env("DATABASE_URL")
  shadowDatabaseUrl = env("SHADOW_DATABASE_URL")
  provider          = "${dbProvider}"
}

generator client {
  provider = "prisma-client-js"
}

model A {
  id String @id @default(cuid())
  b  B[]    @relation("A_b")
}

model B {
  id String @id @default(cuid())
  a  A[]    @relation("A_b")
}
`);
});

test("the ordering of the lists doesn't affect the relation name", async () => {
  const prismaSchema = await getPrismaSchema(
    apiTestConfig({
      lists: {
        A: list({
          access: allowAll,
          fields: {
            b: relationship({ ref: 'B.a', many: true }),
          },
        }),
        B: list({
          access: allowAll,
          fields: {
            a: relationship({ ref: 'A.b', many: true }),
          },
        }),
      },
    })
  );
  expect(prismaSchema)
    .toEqual(`// This file is automatically generated by Keystone, do not modify it manually.
// Modify your Keystone config when you want to change this.

datasource ${dbProvider} {
  url               = env("DATABASE_URL")
  shadowDatabaseUrl = env("SHADOW_DATABASE_URL")
  provider          = "${dbProvider}"
}

generator client {
  provider = "prisma-client-js"
}

model A {
  id String @id @default(cuid())
  b  B[]    @relation("A_b")
}

model B {
  id String @id @default(cuid())
  a  A[]    @relation("A_b")
}
`);
});

test('when specifying relationName in a many to many relationship, the relation name is set to that', async () => {
  const prismaSchema = await getPrismaSchema(
    apiTestConfig({
      lists: {
        A: list({
          access: allowAll,
          fields: {
            b: relationship({ ref: 'B.a', many: true }),
          },
        }),
        B: list({
          access: allowAll,
          fields: {
            a: relationship({ ref: 'A.b', many: true, db: { relationName: 'the_relation_name' } }),
          },
        }),
      },
    })
  );
  expect(prismaSchema)
    .toEqual(`// This file is automatically generated by Keystone, do not modify it manually.
// Modify your Keystone config when you want to change this.

datasource ${dbProvider} {
  url               = env("DATABASE_URL")
  shadowDatabaseUrl = env("SHADOW_DATABASE_URL")
  provider          = "${dbProvider}"
}

generator client {
  provider = "prisma-client-js"
}

model A {
  id String @id @default(cuid())
  b  B[]    @relation("the_relation_name")
}

model B {
  id String @id @default(cuid())
  a  A[]    @relation("the_relation_name")
}
`);
});

test('when specifying relationName on both sides of a many to many relationship, an error is thrown', async () => {
  await expect(
    getPrismaSchema(
      apiTestConfig({
        lists: {
          A: list({
            access: allowAll,
            fields: {
              b: relationship({ ref: 'B.a', many: true, db: { relationName: 'blah' } }),
            },
          }),

          B: list({
            access: allowAll,
            fields: {
              a: relationship({ ref: 'A.b', many: true, db: { relationName: 'blah' } }),
            },
          }),
        },
      })
    )
  ).rejects.toMatchInlineSnapshot(
    `[Error: You can only set db.relationName on one side of a many to many relationship, but db.relationName is set on both A.b and B.a]`
  );
});

test('when specifying relationName on the many side of a one to many relationship, an error is thrown', async () => {
  await expect(
    getPrismaSchema(
      apiTestConfig({
        lists: {
          A: list({
            access: allowAll,
            fields: {
              b: relationship({ ref: 'B.a', many: true, db: { relationName: 'blah' } }),
            },
          }),

          B: list({
            access: allowAll,
            fields: {
              a: relationship({ ref: 'A.b' }),
            },
          }),
        },
      })
    )
  ).rejects.toMatchInlineSnapshot(
    `[Error: You can only set db.relationName on one side of a many to many relationship, but db.relationName is set on A.b which is the many side of a many to one relationship with B.a]`
  );
});
