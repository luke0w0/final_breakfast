// import { PrismaClient } from '@prisma/client';

// const globalForPrisma = globalThis;

// // ✅ 不要放 connectionLimit/pool
// const prisma =
//   globalForPrisma.prisma ??
//   new PrismaClient({
//     log: ['query', 'error', 'warn'],
//     datasources: {
//       db: {
//         url: process.env.DATABASE_URL
//       }
//     }
//   });

// if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// export { prisma };

import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis;

const prismaClientSingleton = () => {
    return new PrismaClient({
        log: ['query', 'error', 'warn'],
        datasources: {
            db: {
                url: process.env.DATABASE_URL
            }
        },
        connectionLimit: 5,
        pool: {
            min: 0,
            max: 5,
            idleTimeoutMillis: 30000,
            acquireTimeoutMillis: 30000,
        }
    });
};

export const prisma = globalForPrisma.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma; 