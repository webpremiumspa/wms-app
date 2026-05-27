
/**
 * Client
**/

import * as runtime from './runtime/library.js';
import $Types = runtime.Types // general types
import $Public = runtime.Types.Public
import $Utils = runtime.Types.Utils
import $Extensions = runtime.Types.Extensions
import $Result = runtime.Types.Result

export type PrismaPromise<T> = $Public.PrismaPromise<T>


/**
 * Model UserMeta
 * 
 */
export type UserMeta = $Result.DefaultSelection<Prisma.$UserMetaPayload>
/**
 * Model ProductMeta
 * 
 */
export type ProductMeta = $Result.DefaultSelection<Prisma.$ProductMetaPayload>
/**
 * Model Order
 * 
 */
export type Order = $Result.DefaultSelection<Prisma.$OrderPayload>
/**
 * Model OrderItem
 * 
 */
export type OrderItem = $Result.DefaultSelection<Prisma.$OrderItemPayload>
/**
 * Model Sequence
 * 
 */
export type Sequence = $Result.DefaultSelection<Prisma.$SequencePayload>
/**
 * Model SequenceOrder
 * 
 */
export type SequenceOrder = $Result.DefaultSelection<Prisma.$SequenceOrderPayload>
/**
 * Model Event
 * 
 */
export type Event = $Result.DefaultSelection<Prisma.$EventPayload>

/**
 * Enums
 */
export namespace $Enums {
  export const Warehouse: {
  B1: 'B1',
  B2: 'B2'
};

export type Warehouse = (typeof Warehouse)[keyof typeof Warehouse]


export const OrderStatus: {
  received: 'received',
  sequenced: 'sequenced',
  picked: 'picked',
  packed: 'packed',
  classified: 'classified',
  loaded: 'loaded',
  delivered: 'delivered'
};

export type OrderStatus = (typeof OrderStatus)[keyof typeof OrderStatus]


export const SequenceStatus: {
  open: 'open',
  closed: 'closed'
};

export type SequenceStatus = (typeof SequenceStatus)[keyof typeof SequenceStatus]

}

export type Warehouse = $Enums.Warehouse

export const Warehouse: typeof $Enums.Warehouse

export type OrderStatus = $Enums.OrderStatus

export const OrderStatus: typeof $Enums.OrderStatus

export type SequenceStatus = $Enums.SequenceStatus

export const SequenceStatus: typeof $Enums.SequenceStatus

/**
 * ##  Prisma Client ʲˢ
 * 
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient()
 * // Fetch zero or more UserMetas
 * const userMetas = await prisma.userMeta.findMany()
 * ```
 *
 * 
 * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
 */
export class PrismaClient<
  ClientOptions extends Prisma.PrismaClientOptions = Prisma.PrismaClientOptions,
  U = 'log' extends keyof ClientOptions ? ClientOptions['log'] extends Array<Prisma.LogLevel | Prisma.LogDefinition> ? Prisma.GetEvents<ClientOptions['log']> : never : never,
  ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
> {
  [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['other'] }

    /**
   * ##  Prisma Client ʲˢ
   * 
   * Type-safe database client for TypeScript & Node.js
   * @example
   * ```
   * const prisma = new PrismaClient()
   * // Fetch zero or more UserMetas
   * const userMetas = await prisma.userMeta.findMany()
   * ```
   *
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
   */

  constructor(optionsArg ?: Prisma.Subset<ClientOptions, Prisma.PrismaClientOptions>);
  $on<V extends U>(eventType: V, callback: (event: V extends 'query' ? Prisma.QueryEvent : Prisma.LogEvent) => void): void;

  /**
   * Connect with the database
   */
  $connect(): $Utils.JsPromise<void>;

  /**
   * Disconnect from the database
   */
  $disconnect(): $Utils.JsPromise<void>;

  /**
   * Add a middleware
   * @deprecated since 4.16.0. For new code, prefer client extensions instead.
   * @see https://pris.ly/d/extensions
   */
  $use(cb: Prisma.Middleware): void

/**
   * Executes a prepared raw query and returns the number of affected rows.
   * @example
   * ```
   * const result = await prisma.$executeRaw`UPDATE User SET cool = ${true} WHERE email = ${'user@email.com'};`
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Executes a raw query and returns the number of affected rows.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$executeRawUnsafe('UPDATE User SET cool = $1 WHERE email = $2 ;', true, 'user@email.com')
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Performs a prepared raw query and returns the `SELECT` data.
   * @example
   * ```
   * const result = await prisma.$queryRaw`SELECT * FROM User WHERE id = ${1} OR email = ${'user@email.com'};`
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<T>;

  /**
   * Performs a raw query and returns the `SELECT` data.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$queryRawUnsafe('SELECT * FROM User WHERE id = $1 OR email = $2;', 1, 'user@email.com')
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<T>;


  /**
   * Allows the running of a sequence of read/write operations that are guaranteed to either succeed or fail as a whole.
   * @example
   * ```
   * const [george, bob, alice] = await prisma.$transaction([
   *   prisma.user.create({ data: { name: 'George' } }),
   *   prisma.user.create({ data: { name: 'Bob' } }),
   *   prisma.user.create({ data: { name: 'Alice' } }),
   * ])
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/concepts/components/prisma-client/transactions).
   */
  $transaction<P extends Prisma.PrismaPromise<any>[]>(arg: [...P], options?: { isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<runtime.Types.Utils.UnwrapTuple<P>>

  $transaction<R>(fn: (prisma: Omit<PrismaClient, runtime.ITXClientDenyList>) => $Utils.JsPromise<R>, options?: { maxWait?: number, timeout?: number, isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<R>


  $extends: $Extensions.ExtendsHook<"extends", Prisma.TypeMapCb, ExtArgs>

      /**
   * `prisma.userMeta`: Exposes CRUD operations for the **UserMeta** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more UserMetas
    * const userMetas = await prisma.userMeta.findMany()
    * ```
    */
  get userMeta(): Prisma.UserMetaDelegate<ExtArgs>;

  /**
   * `prisma.productMeta`: Exposes CRUD operations for the **ProductMeta** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more ProductMetas
    * const productMetas = await prisma.productMeta.findMany()
    * ```
    */
  get productMeta(): Prisma.ProductMetaDelegate<ExtArgs>;

  /**
   * `prisma.order`: Exposes CRUD operations for the **Order** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Orders
    * const orders = await prisma.order.findMany()
    * ```
    */
  get order(): Prisma.OrderDelegate<ExtArgs>;

  /**
   * `prisma.orderItem`: Exposes CRUD operations for the **OrderItem** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more OrderItems
    * const orderItems = await prisma.orderItem.findMany()
    * ```
    */
  get orderItem(): Prisma.OrderItemDelegate<ExtArgs>;

  /**
   * `prisma.sequence`: Exposes CRUD operations for the **Sequence** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Sequences
    * const sequences = await prisma.sequence.findMany()
    * ```
    */
  get sequence(): Prisma.SequenceDelegate<ExtArgs>;

  /**
   * `prisma.sequenceOrder`: Exposes CRUD operations for the **SequenceOrder** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more SequenceOrders
    * const sequenceOrders = await prisma.sequenceOrder.findMany()
    * ```
    */
  get sequenceOrder(): Prisma.SequenceOrderDelegate<ExtArgs>;

  /**
   * `prisma.event`: Exposes CRUD operations for the **Event** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Events
    * const events = await prisma.event.findMany()
    * ```
    */
  get event(): Prisma.EventDelegate<ExtArgs>;
}

export namespace Prisma {
  export import DMMF = runtime.DMMF

  export type PrismaPromise<T> = $Public.PrismaPromise<T>

  /**
   * Validator
   */
  export import validator = runtime.Public.validator

  /**
   * Prisma Errors
   */
  export import PrismaClientKnownRequestError = runtime.PrismaClientKnownRequestError
  export import PrismaClientUnknownRequestError = runtime.PrismaClientUnknownRequestError
  export import PrismaClientRustPanicError = runtime.PrismaClientRustPanicError
  export import PrismaClientInitializationError = runtime.PrismaClientInitializationError
  export import PrismaClientValidationError = runtime.PrismaClientValidationError
  export import NotFoundError = runtime.NotFoundError

  /**
   * Re-export of sql-template-tag
   */
  export import sql = runtime.sqltag
  export import empty = runtime.empty
  export import join = runtime.join
  export import raw = runtime.raw
  export import Sql = runtime.Sql



  /**
   * Decimal.js
   */
  export import Decimal = runtime.Decimal

  export type DecimalJsLike = runtime.DecimalJsLike

  /**
   * Metrics 
   */
  export type Metrics = runtime.Metrics
  export type Metric<T> = runtime.Metric<T>
  export type MetricHistogram = runtime.MetricHistogram
  export type MetricHistogramBucket = runtime.MetricHistogramBucket

  /**
  * Extensions
  */
  export import Extension = $Extensions.UserArgs
  export import getExtensionContext = runtime.Extensions.getExtensionContext
  export import Args = $Public.Args
  export import Payload = $Public.Payload
  export import Result = $Public.Result
  export import Exact = $Public.Exact

  /**
   * Prisma Client JS version: 5.22.0
   * Query Engine version: 605197351a3c8bdd595af2d2a9bc3025bca48ea2
   */
  export type PrismaVersion = {
    client: string
  }

  export const prismaVersion: PrismaVersion 

  /**
   * Utility Types
   */


  export import JsonObject = runtime.JsonObject
  export import JsonArray = runtime.JsonArray
  export import JsonValue = runtime.JsonValue
  export import InputJsonObject = runtime.InputJsonObject
  export import InputJsonArray = runtime.InputJsonArray
  export import InputJsonValue = runtime.InputJsonValue

  /**
   * Types of the values used to represent different kinds of `null` values when working with JSON fields.
   * 
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  namespace NullTypes {
    /**
    * Type of `Prisma.DbNull`.
    * 
    * You cannot use other instances of this class. Please use the `Prisma.DbNull` value.
    * 
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class DbNull {
      private DbNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.JsonNull`.
    * 
    * You cannot use other instances of this class. Please use the `Prisma.JsonNull` value.
    * 
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class JsonNull {
      private JsonNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.AnyNull`.
    * 
    * You cannot use other instances of this class. Please use the `Prisma.AnyNull` value.
    * 
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class AnyNull {
      private AnyNull: never
      private constructor()
    }
  }

  /**
   * Helper for filtering JSON entries that have `null` on the database (empty on the db)
   * 
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const DbNull: NullTypes.DbNull

  /**
   * Helper for filtering JSON entries that have JSON `null` values (not empty on the db)
   * 
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const JsonNull: NullTypes.JsonNull

  /**
   * Helper for filtering JSON entries that are `Prisma.DbNull` or `Prisma.JsonNull`
   * 
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const AnyNull: NullTypes.AnyNull

  type SelectAndInclude = {
    select: any
    include: any
  }

  type SelectAndOmit = {
    select: any
    omit: any
  }

  /**
   * Get the type of the value, that the Promise holds.
   */
  export type PromiseType<T extends PromiseLike<any>> = T extends PromiseLike<infer U> ? U : T;

  /**
   * Get the return type of a function which returns a Promise.
   */
  export type PromiseReturnType<T extends (...args: any) => $Utils.JsPromise<any>> = PromiseType<ReturnType<T>>

  /**
   * From T, pick a set of properties whose keys are in the union K
   */
  type Prisma__Pick<T, K extends keyof T> = {
      [P in K]: T[P];
  };


  export type Enumerable<T> = T | Array<T>;

  export type RequiredKeys<T> = {
    [K in keyof T]-?: {} extends Prisma__Pick<T, K> ? never : K
  }[keyof T]

  export type TruthyKeys<T> = keyof {
    [K in keyof T as T[K] extends false | undefined | null ? never : K]: K
  }

  export type TrueKeys<T> = TruthyKeys<Prisma__Pick<T, RequiredKeys<T>>>

  /**
   * Subset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection
   */
  export type Subset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
  };

  /**
   * SelectSubset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection.
   * Additionally, it validates, if both select and include are present. If the case, it errors.
   */
  export type SelectSubset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    (T extends SelectAndInclude
      ? 'Please either choose `select` or `include`.'
      : T extends SelectAndOmit
        ? 'Please either choose `select` or `omit`.'
        : {})

  /**
   * Subset + Intersection
   * @desc From `T` pick properties that exist in `U` and intersect `K`
   */
  export type SubsetIntersection<T, U, K> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    K

  type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };

  /**
   * XOR is needed to have a real mutually exclusive union type
   * https://stackoverflow.com/questions/42123407/does-typescript-support-mutually-exclusive-types
   */
  type XOR<T, U> =
    T extends object ?
    U extends object ?
      (Without<T, U> & U) | (Without<U, T> & T)
    : U : T


  /**
   * Is T a Record?
   */
  type IsObject<T extends any> = T extends Array<any>
  ? False
  : T extends Date
  ? False
  : T extends Uint8Array
  ? False
  : T extends BigInt
  ? False
  : T extends object
  ? True
  : False


  /**
   * If it's T[], return T
   */
  export type UnEnumerate<T extends unknown> = T extends Array<infer U> ? U : T

  /**
   * From ts-toolbelt
   */

  type __Either<O extends object, K extends Key> = Omit<O, K> &
    {
      // Merge all but K
      [P in K]: Prisma__Pick<O, P & keyof O> // With K possibilities
    }[K]

  type EitherStrict<O extends object, K extends Key> = Strict<__Either<O, K>>

  type EitherLoose<O extends object, K extends Key> = ComputeRaw<__Either<O, K>>

  type _Either<
    O extends object,
    K extends Key,
    strict extends Boolean
  > = {
    1: EitherStrict<O, K>
    0: EitherLoose<O, K>
  }[strict]

  type Either<
    O extends object,
    K extends Key,
    strict extends Boolean = 1
  > = O extends unknown ? _Either<O, K, strict> : never

  export type Union = any

  type PatchUndefined<O extends object, O1 extends object> = {
    [K in keyof O]: O[K] extends undefined ? At<O1, K> : O[K]
  } & {}

  /** Helper Types for "Merge" **/
  export type IntersectOf<U extends Union> = (
    U extends unknown ? (k: U) => void : never
  ) extends (k: infer I) => void
    ? I
    : never

  export type Overwrite<O extends object, O1 extends object> = {
      [K in keyof O]: K extends keyof O1 ? O1[K] : O[K];
  } & {};

  type _Merge<U extends object> = IntersectOf<Overwrite<U, {
      [K in keyof U]-?: At<U, K>;
  }>>;

  type Key = string | number | symbol;
  type AtBasic<O extends object, K extends Key> = K extends keyof O ? O[K] : never;
  type AtStrict<O extends object, K extends Key> = O[K & keyof O];
  type AtLoose<O extends object, K extends Key> = O extends unknown ? AtStrict<O, K> : never;
  export type At<O extends object, K extends Key, strict extends Boolean = 1> = {
      1: AtStrict<O, K>;
      0: AtLoose<O, K>;
  }[strict];

  export type ComputeRaw<A extends any> = A extends Function ? A : {
    [K in keyof A]: A[K];
  } & {};

  export type OptionalFlat<O> = {
    [K in keyof O]?: O[K];
  } & {};

  type _Record<K extends keyof any, T> = {
    [P in K]: T;
  };

  // cause typescript not to expand types and preserve names
  type NoExpand<T> = T extends unknown ? T : never;

  // this type assumes the passed object is entirely optional
  type AtLeast<O extends object, K extends string> = NoExpand<
    O extends unknown
    ? | (K extends keyof O ? { [P in K]: O[P] } & O : O)
      | {[P in keyof O as P extends K ? K : never]-?: O[P]} & O
    : never>;

  type _Strict<U, _U = U> = U extends unknown ? U & OptionalFlat<_Record<Exclude<Keys<_U>, keyof U>, never>> : never;

  export type Strict<U extends object> = ComputeRaw<_Strict<U>>;
  /** End Helper Types for "Merge" **/

  export type Merge<U extends object> = ComputeRaw<_Merge<Strict<U>>>;

  /**
  A [[Boolean]]
  */
  export type Boolean = True | False

  // /**
  // 1
  // */
  export type True = 1

  /**
  0
  */
  export type False = 0

  export type Not<B extends Boolean> = {
    0: 1
    1: 0
  }[B]

  export type Extends<A1 extends any, A2 extends any> = [A1] extends [never]
    ? 0 // anything `never` is false
    : A1 extends A2
    ? 1
    : 0

  export type Has<U extends Union, U1 extends Union> = Not<
    Extends<Exclude<U1, U>, U1>
  >

  export type Or<B1 extends Boolean, B2 extends Boolean> = {
    0: {
      0: 0
      1: 1
    }
    1: {
      0: 1
      1: 1
    }
  }[B1][B2]

  export type Keys<U extends Union> = U extends unknown ? keyof U : never

  type Cast<A, B> = A extends B ? A : B;

  export const type: unique symbol;



  /**
   * Used by group by
   */

  export type GetScalarType<T, O> = O extends object ? {
    [P in keyof T]: P extends keyof O
      ? O[P]
      : never
  } : never

  type FieldPaths<
    T,
    U = Omit<T, '_avg' | '_sum' | '_count' | '_min' | '_max'>
  > = IsObject<T> extends True ? U : T

  type GetHavingFields<T> = {
    [K in keyof T]: Or<
      Or<Extends<'OR', K>, Extends<'AND', K>>,
      Extends<'NOT', K>
    > extends True
      ? // infer is only needed to not hit TS limit
        // based on the brilliant idea of Pierre-Antoine Mills
        // https://github.com/microsoft/TypeScript/issues/30188#issuecomment-478938437
        T[K] extends infer TK
        ? GetHavingFields<UnEnumerate<TK> extends object ? Merge<UnEnumerate<TK>> : never>
        : never
      : {} extends FieldPaths<T[K]>
      ? never
      : K
  }[keyof T]

  /**
   * Convert tuple to union
   */
  type _TupleToUnion<T> = T extends (infer E)[] ? E : never
  type TupleToUnion<K extends readonly any[]> = _TupleToUnion<K>
  type MaybeTupleToUnion<T> = T extends any[] ? TupleToUnion<T> : T

  /**
   * Like `Pick`, but additionally can also accept an array of keys
   */
  type PickEnumerable<T, K extends Enumerable<keyof T> | keyof T> = Prisma__Pick<T, MaybeTupleToUnion<K>>

  /**
   * Exclude all keys with underscores
   */
  type ExcludeUnderscoreKeys<T extends string> = T extends `_${string}` ? never : T


  export type FieldRef<Model, FieldType> = runtime.FieldRef<Model, FieldType>

  type FieldRefInputType<Model, FieldType> = Model extends never ? never : FieldRef<Model, FieldType>


  export const ModelName: {
    UserMeta: 'UserMeta',
    ProductMeta: 'ProductMeta',
    Order: 'Order',
    OrderItem: 'OrderItem',
    Sequence: 'Sequence',
    SequenceOrder: 'SequenceOrder',
    Event: 'Event'
  };

  export type ModelName = (typeof ModelName)[keyof typeof ModelName]


  export type Datasources = {
    db?: Datasource
  }

  interface TypeMapCb extends $Utils.Fn<{extArgs: $Extensions.InternalArgs, clientOptions: PrismaClientOptions }, $Utils.Record<string, any>> {
    returns: Prisma.TypeMap<this['params']['extArgs'], this['params']['clientOptions']>
  }

  export type TypeMap<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, ClientOptions = {}> = {
    meta: {
      modelProps: "userMeta" | "productMeta" | "order" | "orderItem" | "sequence" | "sequenceOrder" | "event"
      txIsolationLevel: Prisma.TransactionIsolationLevel
    }
    model: {
      UserMeta: {
        payload: Prisma.$UserMetaPayload<ExtArgs>
        fields: Prisma.UserMetaFieldRefs
        operations: {
          findUnique: {
            args: Prisma.UserMetaFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserMetaPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.UserMetaFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserMetaPayload>
          }
          findFirst: {
            args: Prisma.UserMetaFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserMetaPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.UserMetaFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserMetaPayload>
          }
          findMany: {
            args: Prisma.UserMetaFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserMetaPayload>[]
          }
          create: {
            args: Prisma.UserMetaCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserMetaPayload>
          }
          createMany: {
            args: Prisma.UserMetaCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          delete: {
            args: Prisma.UserMetaDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserMetaPayload>
          }
          update: {
            args: Prisma.UserMetaUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserMetaPayload>
          }
          deleteMany: {
            args: Prisma.UserMetaDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.UserMetaUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.UserMetaUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserMetaPayload>
          }
          aggregate: {
            args: Prisma.UserMetaAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateUserMeta>
          }
          groupBy: {
            args: Prisma.UserMetaGroupByArgs<ExtArgs>
            result: $Utils.Optional<UserMetaGroupByOutputType>[]
          }
          count: {
            args: Prisma.UserMetaCountArgs<ExtArgs>
            result: $Utils.Optional<UserMetaCountAggregateOutputType> | number
          }
        }
      }
      ProductMeta: {
        payload: Prisma.$ProductMetaPayload<ExtArgs>
        fields: Prisma.ProductMetaFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ProductMetaFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProductMetaPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ProductMetaFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProductMetaPayload>
          }
          findFirst: {
            args: Prisma.ProductMetaFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProductMetaPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ProductMetaFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProductMetaPayload>
          }
          findMany: {
            args: Prisma.ProductMetaFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProductMetaPayload>[]
          }
          create: {
            args: Prisma.ProductMetaCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProductMetaPayload>
          }
          createMany: {
            args: Prisma.ProductMetaCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          delete: {
            args: Prisma.ProductMetaDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProductMetaPayload>
          }
          update: {
            args: Prisma.ProductMetaUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProductMetaPayload>
          }
          deleteMany: {
            args: Prisma.ProductMetaDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ProductMetaUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.ProductMetaUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProductMetaPayload>
          }
          aggregate: {
            args: Prisma.ProductMetaAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateProductMeta>
          }
          groupBy: {
            args: Prisma.ProductMetaGroupByArgs<ExtArgs>
            result: $Utils.Optional<ProductMetaGroupByOutputType>[]
          }
          count: {
            args: Prisma.ProductMetaCountArgs<ExtArgs>
            result: $Utils.Optional<ProductMetaCountAggregateOutputType> | number
          }
        }
      }
      Order: {
        payload: Prisma.$OrderPayload<ExtArgs>
        fields: Prisma.OrderFieldRefs
        operations: {
          findUnique: {
            args: Prisma.OrderFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrderPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.OrderFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrderPayload>
          }
          findFirst: {
            args: Prisma.OrderFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrderPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.OrderFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrderPayload>
          }
          findMany: {
            args: Prisma.OrderFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrderPayload>[]
          }
          create: {
            args: Prisma.OrderCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrderPayload>
          }
          createMany: {
            args: Prisma.OrderCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          delete: {
            args: Prisma.OrderDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrderPayload>
          }
          update: {
            args: Prisma.OrderUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrderPayload>
          }
          deleteMany: {
            args: Prisma.OrderDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.OrderUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.OrderUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrderPayload>
          }
          aggregate: {
            args: Prisma.OrderAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateOrder>
          }
          groupBy: {
            args: Prisma.OrderGroupByArgs<ExtArgs>
            result: $Utils.Optional<OrderGroupByOutputType>[]
          }
          count: {
            args: Prisma.OrderCountArgs<ExtArgs>
            result: $Utils.Optional<OrderCountAggregateOutputType> | number
          }
        }
      }
      OrderItem: {
        payload: Prisma.$OrderItemPayload<ExtArgs>
        fields: Prisma.OrderItemFieldRefs
        operations: {
          findUnique: {
            args: Prisma.OrderItemFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrderItemPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.OrderItemFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrderItemPayload>
          }
          findFirst: {
            args: Prisma.OrderItemFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrderItemPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.OrderItemFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrderItemPayload>
          }
          findMany: {
            args: Prisma.OrderItemFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrderItemPayload>[]
          }
          create: {
            args: Prisma.OrderItemCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrderItemPayload>
          }
          createMany: {
            args: Prisma.OrderItemCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          delete: {
            args: Prisma.OrderItemDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrderItemPayload>
          }
          update: {
            args: Prisma.OrderItemUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrderItemPayload>
          }
          deleteMany: {
            args: Prisma.OrderItemDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.OrderItemUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.OrderItemUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrderItemPayload>
          }
          aggregate: {
            args: Prisma.OrderItemAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateOrderItem>
          }
          groupBy: {
            args: Prisma.OrderItemGroupByArgs<ExtArgs>
            result: $Utils.Optional<OrderItemGroupByOutputType>[]
          }
          count: {
            args: Prisma.OrderItemCountArgs<ExtArgs>
            result: $Utils.Optional<OrderItemCountAggregateOutputType> | number
          }
        }
      }
      Sequence: {
        payload: Prisma.$SequencePayload<ExtArgs>
        fields: Prisma.SequenceFieldRefs
        operations: {
          findUnique: {
            args: Prisma.SequenceFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SequencePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.SequenceFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SequencePayload>
          }
          findFirst: {
            args: Prisma.SequenceFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SequencePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.SequenceFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SequencePayload>
          }
          findMany: {
            args: Prisma.SequenceFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SequencePayload>[]
          }
          create: {
            args: Prisma.SequenceCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SequencePayload>
          }
          createMany: {
            args: Prisma.SequenceCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          delete: {
            args: Prisma.SequenceDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SequencePayload>
          }
          update: {
            args: Prisma.SequenceUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SequencePayload>
          }
          deleteMany: {
            args: Prisma.SequenceDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.SequenceUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.SequenceUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SequencePayload>
          }
          aggregate: {
            args: Prisma.SequenceAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateSequence>
          }
          groupBy: {
            args: Prisma.SequenceGroupByArgs<ExtArgs>
            result: $Utils.Optional<SequenceGroupByOutputType>[]
          }
          count: {
            args: Prisma.SequenceCountArgs<ExtArgs>
            result: $Utils.Optional<SequenceCountAggregateOutputType> | number
          }
        }
      }
      SequenceOrder: {
        payload: Prisma.$SequenceOrderPayload<ExtArgs>
        fields: Prisma.SequenceOrderFieldRefs
        operations: {
          findUnique: {
            args: Prisma.SequenceOrderFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SequenceOrderPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.SequenceOrderFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SequenceOrderPayload>
          }
          findFirst: {
            args: Prisma.SequenceOrderFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SequenceOrderPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.SequenceOrderFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SequenceOrderPayload>
          }
          findMany: {
            args: Prisma.SequenceOrderFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SequenceOrderPayload>[]
          }
          create: {
            args: Prisma.SequenceOrderCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SequenceOrderPayload>
          }
          createMany: {
            args: Prisma.SequenceOrderCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          delete: {
            args: Prisma.SequenceOrderDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SequenceOrderPayload>
          }
          update: {
            args: Prisma.SequenceOrderUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SequenceOrderPayload>
          }
          deleteMany: {
            args: Prisma.SequenceOrderDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.SequenceOrderUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.SequenceOrderUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SequenceOrderPayload>
          }
          aggregate: {
            args: Prisma.SequenceOrderAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateSequenceOrder>
          }
          groupBy: {
            args: Prisma.SequenceOrderGroupByArgs<ExtArgs>
            result: $Utils.Optional<SequenceOrderGroupByOutputType>[]
          }
          count: {
            args: Prisma.SequenceOrderCountArgs<ExtArgs>
            result: $Utils.Optional<SequenceOrderCountAggregateOutputType> | number
          }
        }
      }
      Event: {
        payload: Prisma.$EventPayload<ExtArgs>
        fields: Prisma.EventFieldRefs
        operations: {
          findUnique: {
            args: Prisma.EventFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EventPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.EventFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EventPayload>
          }
          findFirst: {
            args: Prisma.EventFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EventPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.EventFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EventPayload>
          }
          findMany: {
            args: Prisma.EventFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EventPayload>[]
          }
          create: {
            args: Prisma.EventCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EventPayload>
          }
          createMany: {
            args: Prisma.EventCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          delete: {
            args: Prisma.EventDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EventPayload>
          }
          update: {
            args: Prisma.EventUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EventPayload>
          }
          deleteMany: {
            args: Prisma.EventDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.EventUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.EventUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EventPayload>
          }
          aggregate: {
            args: Prisma.EventAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateEvent>
          }
          groupBy: {
            args: Prisma.EventGroupByArgs<ExtArgs>
            result: $Utils.Optional<EventGroupByOutputType>[]
          }
          count: {
            args: Prisma.EventCountArgs<ExtArgs>
            result: $Utils.Optional<EventCountAggregateOutputType> | number
          }
        }
      }
    }
  } & {
    other: {
      payload: any
      operations: {
        $executeRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $executeRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
        $queryRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $queryRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
      }
    }
  }
  export const defineExtension: $Extensions.ExtendsHook<"define", Prisma.TypeMapCb, $Extensions.DefaultArgs>
  export type DefaultPrismaClient = PrismaClient
  export type ErrorFormat = 'pretty' | 'colorless' | 'minimal'
  export interface PrismaClientOptions {
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasources?: Datasources
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasourceUrl?: string
    /**
     * @default "colorless"
     */
    errorFormat?: ErrorFormat
    /**
     * @example
     * ```
     * // Defaults to stdout
     * log: ['query', 'info', 'warn', 'error']
     * 
     * // Emit as events
     * log: [
     *   { emit: 'stdout', level: 'query' },
     *   { emit: 'stdout', level: 'info' },
     *   { emit: 'stdout', level: 'warn' }
     *   { emit: 'stdout', level: 'error' }
     * ]
     * ```
     * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/logging#the-log-option).
     */
    log?: (LogLevel | LogDefinition)[]
    /**
     * The default values for transactionOptions
     * maxWait ?= 2000
     * timeout ?= 5000
     */
    transactionOptions?: {
      maxWait?: number
      timeout?: number
      isolationLevel?: Prisma.TransactionIsolationLevel
    }
  }


  /* Types for Logging */
  export type LogLevel = 'info' | 'query' | 'warn' | 'error'
  export type LogDefinition = {
    level: LogLevel
    emit: 'stdout' | 'event'
  }

  export type GetLogType<T extends LogLevel | LogDefinition> = T extends LogDefinition ? T['emit'] extends 'event' ? T['level'] : never : never
  export type GetEvents<T extends any> = T extends Array<LogLevel | LogDefinition> ?
    GetLogType<T[0]> | GetLogType<T[1]> | GetLogType<T[2]> | GetLogType<T[3]>
    : never

  export type QueryEvent = {
    timestamp: Date
    query: string
    params: string
    duration: number
    target: string
  }

  export type LogEvent = {
    timestamp: Date
    message: string
    target: string
  }
  /* End Types for Logging */


  export type PrismaAction =
    | 'findUnique'
    | 'findUniqueOrThrow'
    | 'findMany'
    | 'findFirst'
    | 'findFirstOrThrow'
    | 'create'
    | 'createMany'
    | 'createManyAndReturn'
    | 'update'
    | 'updateMany'
    | 'upsert'
    | 'delete'
    | 'deleteMany'
    | 'executeRaw'
    | 'queryRaw'
    | 'aggregate'
    | 'count'
    | 'runCommandRaw'
    | 'findRaw'
    | 'groupBy'

  /**
   * These options are being passed into the middleware as "params"
   */
  export type MiddlewareParams = {
    model?: ModelName
    action: PrismaAction
    args: any
    dataPath: string[]
    runInTransaction: boolean
  }

  /**
   * The `T` type makes sure, that the `return proceed` is not forgotten in the middleware implementation
   */
  export type Middleware<T = any> = (
    params: MiddlewareParams,
    next: (params: MiddlewareParams) => $Utils.JsPromise<T>,
  ) => $Utils.JsPromise<T>

  // tested in getLogLevel.test.ts
  export function getLogLevel(log: Array<LogLevel | LogDefinition>): LogLevel | undefined;

  /**
   * `PrismaClient` proxy available in interactive transactions.
   */
  export type TransactionClient = Omit<Prisma.DefaultPrismaClient, runtime.ITXClientDenyList>

  export type Datasource = {
    url?: string
  }

  /**
   * Count Types
   */


  /**
   * Count Type UserMetaCountOutputType
   */

  export type UserMetaCountOutputType = {
    sequencesCreated: number
    packedOrders: number
    events: number
  }

  export type UserMetaCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    sequencesCreated?: boolean | UserMetaCountOutputTypeCountSequencesCreatedArgs
    packedOrders?: boolean | UserMetaCountOutputTypeCountPackedOrdersArgs
    events?: boolean | UserMetaCountOutputTypeCountEventsArgs
  }

  // Custom InputTypes
  /**
   * UserMetaCountOutputType without action
   */
  export type UserMetaCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserMetaCountOutputType
     */
    select?: UserMetaCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * UserMetaCountOutputType without action
   */
  export type UserMetaCountOutputTypeCountSequencesCreatedArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: SequenceWhereInput
  }

  /**
   * UserMetaCountOutputType without action
   */
  export type UserMetaCountOutputTypeCountPackedOrdersArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: OrderWhereInput
  }

  /**
   * UserMetaCountOutputType without action
   */
  export type UserMetaCountOutputTypeCountEventsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: EventWhereInput
  }


  /**
   * Count Type ProductMetaCountOutputType
   */

  export type ProductMetaCountOutputType = {
    orderItems: number
  }

  export type ProductMetaCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    orderItems?: boolean | ProductMetaCountOutputTypeCountOrderItemsArgs
  }

  // Custom InputTypes
  /**
   * ProductMetaCountOutputType without action
   */
  export type ProductMetaCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProductMetaCountOutputType
     */
    select?: ProductMetaCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * ProductMetaCountOutputType without action
   */
  export type ProductMetaCountOutputTypeCountOrderItemsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: OrderItemWhereInput
  }


  /**
   * Count Type OrderCountOutputType
   */

  export type OrderCountOutputType = {
    items: number
    sequenceLinks: number
    events: number
  }

  export type OrderCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    items?: boolean | OrderCountOutputTypeCountItemsArgs
    sequenceLinks?: boolean | OrderCountOutputTypeCountSequenceLinksArgs
    events?: boolean | OrderCountOutputTypeCountEventsArgs
  }

  // Custom InputTypes
  /**
   * OrderCountOutputType without action
   */
  export type OrderCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrderCountOutputType
     */
    select?: OrderCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * OrderCountOutputType without action
   */
  export type OrderCountOutputTypeCountItemsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: OrderItemWhereInput
  }

  /**
   * OrderCountOutputType without action
   */
  export type OrderCountOutputTypeCountSequenceLinksArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: SequenceOrderWhereInput
  }

  /**
   * OrderCountOutputType without action
   */
  export type OrderCountOutputTypeCountEventsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: EventWhereInput
  }


  /**
   * Count Type SequenceCountOutputType
   */

  export type SequenceCountOutputType = {
    orders: number
  }

  export type SequenceCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    orders?: boolean | SequenceCountOutputTypeCountOrdersArgs
  }

  // Custom InputTypes
  /**
   * SequenceCountOutputType without action
   */
  export type SequenceCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SequenceCountOutputType
     */
    select?: SequenceCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * SequenceCountOutputType without action
   */
  export type SequenceCountOutputTypeCountOrdersArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: SequenceOrderWhereInput
  }


  /**
   * Models
   */

  /**
   * Model UserMeta
   */

  export type AggregateUserMeta = {
    _count: UserMetaCountAggregateOutputType | null
    _avg: UserMetaAvgAggregateOutputType | null
    _sum: UserMetaSumAggregateOutputType | null
    _min: UserMetaMinAggregateOutputType | null
    _max: UserMetaMaxAggregateOutputType | null
  }

  export type UserMetaAvgAggregateOutputType = {
    wpUserId: number | null
  }

  export type UserMetaSumAggregateOutputType = {
    wpUserId: number | null
  }

  export type UserMetaMinAggregateOutputType = {
    wpUserId: number | null
    username: string | null
    displayName: string | null
    email: string | null
    active: boolean | null
    lastLoginAt: Date | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type UserMetaMaxAggregateOutputType = {
    wpUserId: number | null
    username: string | null
    displayName: string | null
    email: string | null
    active: boolean | null
    lastLoginAt: Date | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type UserMetaCountAggregateOutputType = {
    wpUserId: number
    username: number
    displayName: number
    email: number
    capabilities: number
    active: number
    lastLoginAt: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type UserMetaAvgAggregateInputType = {
    wpUserId?: true
  }

  export type UserMetaSumAggregateInputType = {
    wpUserId?: true
  }

  export type UserMetaMinAggregateInputType = {
    wpUserId?: true
    username?: true
    displayName?: true
    email?: true
    active?: true
    lastLoginAt?: true
    createdAt?: true
    updatedAt?: true
  }

  export type UserMetaMaxAggregateInputType = {
    wpUserId?: true
    username?: true
    displayName?: true
    email?: true
    active?: true
    lastLoginAt?: true
    createdAt?: true
    updatedAt?: true
  }

  export type UserMetaCountAggregateInputType = {
    wpUserId?: true
    username?: true
    displayName?: true
    email?: true
    capabilities?: true
    active?: true
    lastLoginAt?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type UserMetaAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which UserMeta to aggregate.
     */
    where?: UserMetaWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of UserMetas to fetch.
     */
    orderBy?: UserMetaOrderByWithRelationInput | UserMetaOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: UserMetaWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` UserMetas from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` UserMetas.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned UserMetas
    **/
    _count?: true | UserMetaCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: UserMetaAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: UserMetaSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: UserMetaMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: UserMetaMaxAggregateInputType
  }

  export type GetUserMetaAggregateType<T extends UserMetaAggregateArgs> = {
        [P in keyof T & keyof AggregateUserMeta]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateUserMeta[P]>
      : GetScalarType<T[P], AggregateUserMeta[P]>
  }




  export type UserMetaGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: UserMetaWhereInput
    orderBy?: UserMetaOrderByWithAggregationInput | UserMetaOrderByWithAggregationInput[]
    by: UserMetaScalarFieldEnum[] | UserMetaScalarFieldEnum
    having?: UserMetaScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: UserMetaCountAggregateInputType | true
    _avg?: UserMetaAvgAggregateInputType
    _sum?: UserMetaSumAggregateInputType
    _min?: UserMetaMinAggregateInputType
    _max?: UserMetaMaxAggregateInputType
  }

  export type UserMetaGroupByOutputType = {
    wpUserId: number
    username: string
    displayName: string
    email: string | null
    capabilities: JsonValue
    active: boolean
    lastLoginAt: Date | null
    createdAt: Date
    updatedAt: Date
    _count: UserMetaCountAggregateOutputType | null
    _avg: UserMetaAvgAggregateOutputType | null
    _sum: UserMetaSumAggregateOutputType | null
    _min: UserMetaMinAggregateOutputType | null
    _max: UserMetaMaxAggregateOutputType | null
  }

  type GetUserMetaGroupByPayload<T extends UserMetaGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<UserMetaGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof UserMetaGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], UserMetaGroupByOutputType[P]>
            : GetScalarType<T[P], UserMetaGroupByOutputType[P]>
        }
      >
    >


  export type UserMetaSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    wpUserId?: boolean
    username?: boolean
    displayName?: boolean
    email?: boolean
    capabilities?: boolean
    active?: boolean
    lastLoginAt?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    sequencesCreated?: boolean | UserMeta$sequencesCreatedArgs<ExtArgs>
    packedOrders?: boolean | UserMeta$packedOrdersArgs<ExtArgs>
    events?: boolean | UserMeta$eventsArgs<ExtArgs>
    _count?: boolean | UserMetaCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["userMeta"]>


  export type UserMetaSelectScalar = {
    wpUserId?: boolean
    username?: boolean
    displayName?: boolean
    email?: boolean
    capabilities?: boolean
    active?: boolean
    lastLoginAt?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type UserMetaInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    sequencesCreated?: boolean | UserMeta$sequencesCreatedArgs<ExtArgs>
    packedOrders?: boolean | UserMeta$packedOrdersArgs<ExtArgs>
    events?: boolean | UserMeta$eventsArgs<ExtArgs>
    _count?: boolean | UserMetaCountOutputTypeDefaultArgs<ExtArgs>
  }

  export type $UserMetaPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "UserMeta"
    objects: {
      sequencesCreated: Prisma.$SequencePayload<ExtArgs>[]
      packedOrders: Prisma.$OrderPayload<ExtArgs>[]
      events: Prisma.$EventPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      wpUserId: number
      username: string
      displayName: string
      email: string | null
      capabilities: Prisma.JsonValue
      active: boolean
      lastLoginAt: Date | null
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["userMeta"]>
    composites: {}
  }

  type UserMetaGetPayload<S extends boolean | null | undefined | UserMetaDefaultArgs> = $Result.GetResult<Prisma.$UserMetaPayload, S>

  type UserMetaCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<UserMetaFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: UserMetaCountAggregateInputType | true
    }

  export interface UserMetaDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['UserMeta'], meta: { name: 'UserMeta' } }
    /**
     * Find zero or one UserMeta that matches the filter.
     * @param {UserMetaFindUniqueArgs} args - Arguments to find a UserMeta
     * @example
     * // Get one UserMeta
     * const userMeta = await prisma.userMeta.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends UserMetaFindUniqueArgs>(args: SelectSubset<T, UserMetaFindUniqueArgs<ExtArgs>>): Prisma__UserMetaClient<$Result.GetResult<Prisma.$UserMetaPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one UserMeta that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {UserMetaFindUniqueOrThrowArgs} args - Arguments to find a UserMeta
     * @example
     * // Get one UserMeta
     * const userMeta = await prisma.userMeta.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends UserMetaFindUniqueOrThrowArgs>(args: SelectSubset<T, UserMetaFindUniqueOrThrowArgs<ExtArgs>>): Prisma__UserMetaClient<$Result.GetResult<Prisma.$UserMetaPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first UserMeta that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserMetaFindFirstArgs} args - Arguments to find a UserMeta
     * @example
     * // Get one UserMeta
     * const userMeta = await prisma.userMeta.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends UserMetaFindFirstArgs>(args?: SelectSubset<T, UserMetaFindFirstArgs<ExtArgs>>): Prisma__UserMetaClient<$Result.GetResult<Prisma.$UserMetaPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first UserMeta that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserMetaFindFirstOrThrowArgs} args - Arguments to find a UserMeta
     * @example
     * // Get one UserMeta
     * const userMeta = await prisma.userMeta.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends UserMetaFindFirstOrThrowArgs>(args?: SelectSubset<T, UserMetaFindFirstOrThrowArgs<ExtArgs>>): Prisma__UserMetaClient<$Result.GetResult<Prisma.$UserMetaPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more UserMetas that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserMetaFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all UserMetas
     * const userMetas = await prisma.userMeta.findMany()
     * 
     * // Get first 10 UserMetas
     * const userMetas = await prisma.userMeta.findMany({ take: 10 })
     * 
     * // Only select the `wpUserId`
     * const userMetaWithWpUserIdOnly = await prisma.userMeta.findMany({ select: { wpUserId: true } })
     * 
     */
    findMany<T extends UserMetaFindManyArgs>(args?: SelectSubset<T, UserMetaFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserMetaPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a UserMeta.
     * @param {UserMetaCreateArgs} args - Arguments to create a UserMeta.
     * @example
     * // Create one UserMeta
     * const UserMeta = await prisma.userMeta.create({
     *   data: {
     *     // ... data to create a UserMeta
     *   }
     * })
     * 
     */
    create<T extends UserMetaCreateArgs>(args: SelectSubset<T, UserMetaCreateArgs<ExtArgs>>): Prisma__UserMetaClient<$Result.GetResult<Prisma.$UserMetaPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many UserMetas.
     * @param {UserMetaCreateManyArgs} args - Arguments to create many UserMetas.
     * @example
     * // Create many UserMetas
     * const userMeta = await prisma.userMeta.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends UserMetaCreateManyArgs>(args?: SelectSubset<T, UserMetaCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a UserMeta.
     * @param {UserMetaDeleteArgs} args - Arguments to delete one UserMeta.
     * @example
     * // Delete one UserMeta
     * const UserMeta = await prisma.userMeta.delete({
     *   where: {
     *     // ... filter to delete one UserMeta
     *   }
     * })
     * 
     */
    delete<T extends UserMetaDeleteArgs>(args: SelectSubset<T, UserMetaDeleteArgs<ExtArgs>>): Prisma__UserMetaClient<$Result.GetResult<Prisma.$UserMetaPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one UserMeta.
     * @param {UserMetaUpdateArgs} args - Arguments to update one UserMeta.
     * @example
     * // Update one UserMeta
     * const userMeta = await prisma.userMeta.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends UserMetaUpdateArgs>(args: SelectSubset<T, UserMetaUpdateArgs<ExtArgs>>): Prisma__UserMetaClient<$Result.GetResult<Prisma.$UserMetaPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more UserMetas.
     * @param {UserMetaDeleteManyArgs} args - Arguments to filter UserMetas to delete.
     * @example
     * // Delete a few UserMetas
     * const { count } = await prisma.userMeta.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends UserMetaDeleteManyArgs>(args?: SelectSubset<T, UserMetaDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more UserMetas.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserMetaUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many UserMetas
     * const userMeta = await prisma.userMeta.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends UserMetaUpdateManyArgs>(args: SelectSubset<T, UserMetaUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one UserMeta.
     * @param {UserMetaUpsertArgs} args - Arguments to update or create a UserMeta.
     * @example
     * // Update or create a UserMeta
     * const userMeta = await prisma.userMeta.upsert({
     *   create: {
     *     // ... data to create a UserMeta
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the UserMeta we want to update
     *   }
     * })
     */
    upsert<T extends UserMetaUpsertArgs>(args: SelectSubset<T, UserMetaUpsertArgs<ExtArgs>>): Prisma__UserMetaClient<$Result.GetResult<Prisma.$UserMetaPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of UserMetas.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserMetaCountArgs} args - Arguments to filter UserMetas to count.
     * @example
     * // Count the number of UserMetas
     * const count = await prisma.userMeta.count({
     *   where: {
     *     // ... the filter for the UserMetas we want to count
     *   }
     * })
    **/
    count<T extends UserMetaCountArgs>(
      args?: Subset<T, UserMetaCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], UserMetaCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a UserMeta.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserMetaAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends UserMetaAggregateArgs>(args: Subset<T, UserMetaAggregateArgs>): Prisma.PrismaPromise<GetUserMetaAggregateType<T>>

    /**
     * Group by UserMeta.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserMetaGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends UserMetaGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: UserMetaGroupByArgs['orderBy'] }
        : { orderBy?: UserMetaGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, UserMetaGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetUserMetaGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the UserMeta model
   */
  readonly fields: UserMetaFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for UserMeta.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__UserMetaClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    sequencesCreated<T extends UserMeta$sequencesCreatedArgs<ExtArgs> = {}>(args?: Subset<T, UserMeta$sequencesCreatedArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SequencePayload<ExtArgs>, T, "findMany"> | Null>
    packedOrders<T extends UserMeta$packedOrdersArgs<ExtArgs> = {}>(args?: Subset<T, UserMeta$packedOrdersArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$OrderPayload<ExtArgs>, T, "findMany"> | Null>
    events<T extends UserMeta$eventsArgs<ExtArgs> = {}>(args?: Subset<T, UserMeta$eventsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$EventPayload<ExtArgs>, T, "findMany"> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the UserMeta model
   */ 
  interface UserMetaFieldRefs {
    readonly wpUserId: FieldRef<"UserMeta", 'Int'>
    readonly username: FieldRef<"UserMeta", 'String'>
    readonly displayName: FieldRef<"UserMeta", 'String'>
    readonly email: FieldRef<"UserMeta", 'String'>
    readonly capabilities: FieldRef<"UserMeta", 'Json'>
    readonly active: FieldRef<"UserMeta", 'Boolean'>
    readonly lastLoginAt: FieldRef<"UserMeta", 'DateTime'>
    readonly createdAt: FieldRef<"UserMeta", 'DateTime'>
    readonly updatedAt: FieldRef<"UserMeta", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * UserMeta findUnique
   */
  export type UserMetaFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserMeta
     */
    select?: UserMetaSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserMetaInclude<ExtArgs> | null
    /**
     * Filter, which UserMeta to fetch.
     */
    where: UserMetaWhereUniqueInput
  }

  /**
   * UserMeta findUniqueOrThrow
   */
  export type UserMetaFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserMeta
     */
    select?: UserMetaSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserMetaInclude<ExtArgs> | null
    /**
     * Filter, which UserMeta to fetch.
     */
    where: UserMetaWhereUniqueInput
  }

  /**
   * UserMeta findFirst
   */
  export type UserMetaFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserMeta
     */
    select?: UserMetaSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserMetaInclude<ExtArgs> | null
    /**
     * Filter, which UserMeta to fetch.
     */
    where?: UserMetaWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of UserMetas to fetch.
     */
    orderBy?: UserMetaOrderByWithRelationInput | UserMetaOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for UserMetas.
     */
    cursor?: UserMetaWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` UserMetas from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` UserMetas.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of UserMetas.
     */
    distinct?: UserMetaScalarFieldEnum | UserMetaScalarFieldEnum[]
  }

  /**
   * UserMeta findFirstOrThrow
   */
  export type UserMetaFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserMeta
     */
    select?: UserMetaSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserMetaInclude<ExtArgs> | null
    /**
     * Filter, which UserMeta to fetch.
     */
    where?: UserMetaWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of UserMetas to fetch.
     */
    orderBy?: UserMetaOrderByWithRelationInput | UserMetaOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for UserMetas.
     */
    cursor?: UserMetaWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` UserMetas from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` UserMetas.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of UserMetas.
     */
    distinct?: UserMetaScalarFieldEnum | UserMetaScalarFieldEnum[]
  }

  /**
   * UserMeta findMany
   */
  export type UserMetaFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserMeta
     */
    select?: UserMetaSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserMetaInclude<ExtArgs> | null
    /**
     * Filter, which UserMetas to fetch.
     */
    where?: UserMetaWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of UserMetas to fetch.
     */
    orderBy?: UserMetaOrderByWithRelationInput | UserMetaOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing UserMetas.
     */
    cursor?: UserMetaWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` UserMetas from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` UserMetas.
     */
    skip?: number
    distinct?: UserMetaScalarFieldEnum | UserMetaScalarFieldEnum[]
  }

  /**
   * UserMeta create
   */
  export type UserMetaCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserMeta
     */
    select?: UserMetaSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserMetaInclude<ExtArgs> | null
    /**
     * The data needed to create a UserMeta.
     */
    data: XOR<UserMetaCreateInput, UserMetaUncheckedCreateInput>
  }

  /**
   * UserMeta createMany
   */
  export type UserMetaCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many UserMetas.
     */
    data: UserMetaCreateManyInput | UserMetaCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * UserMeta update
   */
  export type UserMetaUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserMeta
     */
    select?: UserMetaSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserMetaInclude<ExtArgs> | null
    /**
     * The data needed to update a UserMeta.
     */
    data: XOR<UserMetaUpdateInput, UserMetaUncheckedUpdateInput>
    /**
     * Choose, which UserMeta to update.
     */
    where: UserMetaWhereUniqueInput
  }

  /**
   * UserMeta updateMany
   */
  export type UserMetaUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update UserMetas.
     */
    data: XOR<UserMetaUpdateManyMutationInput, UserMetaUncheckedUpdateManyInput>
    /**
     * Filter which UserMetas to update
     */
    where?: UserMetaWhereInput
  }

  /**
   * UserMeta upsert
   */
  export type UserMetaUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserMeta
     */
    select?: UserMetaSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserMetaInclude<ExtArgs> | null
    /**
     * The filter to search for the UserMeta to update in case it exists.
     */
    where: UserMetaWhereUniqueInput
    /**
     * In case the UserMeta found by the `where` argument doesn't exist, create a new UserMeta with this data.
     */
    create: XOR<UserMetaCreateInput, UserMetaUncheckedCreateInput>
    /**
     * In case the UserMeta was found with the provided `where` argument, update it with this data.
     */
    update: XOR<UserMetaUpdateInput, UserMetaUncheckedUpdateInput>
  }

  /**
   * UserMeta delete
   */
  export type UserMetaDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserMeta
     */
    select?: UserMetaSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserMetaInclude<ExtArgs> | null
    /**
     * Filter which UserMeta to delete.
     */
    where: UserMetaWhereUniqueInput
  }

  /**
   * UserMeta deleteMany
   */
  export type UserMetaDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which UserMetas to delete
     */
    where?: UserMetaWhereInput
  }

  /**
   * UserMeta.sequencesCreated
   */
  export type UserMeta$sequencesCreatedArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Sequence
     */
    select?: SequenceSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SequenceInclude<ExtArgs> | null
    where?: SequenceWhereInput
    orderBy?: SequenceOrderByWithRelationInput | SequenceOrderByWithRelationInput[]
    cursor?: SequenceWhereUniqueInput
    take?: number
    skip?: number
    distinct?: SequenceScalarFieldEnum | SequenceScalarFieldEnum[]
  }

  /**
   * UserMeta.packedOrders
   */
  export type UserMeta$packedOrdersArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Order
     */
    select?: OrderSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrderInclude<ExtArgs> | null
    where?: OrderWhereInput
    orderBy?: OrderOrderByWithRelationInput | OrderOrderByWithRelationInput[]
    cursor?: OrderWhereUniqueInput
    take?: number
    skip?: number
    distinct?: OrderScalarFieldEnum | OrderScalarFieldEnum[]
  }

  /**
   * UserMeta.events
   */
  export type UserMeta$eventsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Event
     */
    select?: EventSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EventInclude<ExtArgs> | null
    where?: EventWhereInput
    orderBy?: EventOrderByWithRelationInput | EventOrderByWithRelationInput[]
    cursor?: EventWhereUniqueInput
    take?: number
    skip?: number
    distinct?: EventScalarFieldEnum | EventScalarFieldEnum[]
  }

  /**
   * UserMeta without action
   */
  export type UserMetaDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserMeta
     */
    select?: UserMetaSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserMetaInclude<ExtArgs> | null
  }


  /**
   * Model ProductMeta
   */

  export type AggregateProductMeta = {
    _count: ProductMetaCountAggregateOutputType | null
    _avg: ProductMetaAvgAggregateOutputType | null
    _sum: ProductMetaSumAggregateOutputType | null
    _min: ProductMetaMinAggregateOutputType | null
    _max: ProductMetaMaxAggregateOutputType | null
  }

  export type ProductMetaAvgAggregateOutputType = {
    wpProductId: number | null
  }

  export type ProductMetaSumAggregateOutputType = {
    wpProductId: number | null
  }

  export type ProductMetaMinAggregateOutputType = {
    wpProductId: number | null
    sku: string | null
    name: string | null
    warehouse: $Enums.Warehouse | null
    thumbnailUrl: string | null
    syncedAt: Date | null
  }

  export type ProductMetaMaxAggregateOutputType = {
    wpProductId: number | null
    sku: string | null
    name: string | null
    warehouse: $Enums.Warehouse | null
    thumbnailUrl: string | null
    syncedAt: Date | null
  }

  export type ProductMetaCountAggregateOutputType = {
    wpProductId: number
    sku: number
    name: number
    warehouse: number
    thumbnailUrl: number
    syncedAt: number
    _all: number
  }


  export type ProductMetaAvgAggregateInputType = {
    wpProductId?: true
  }

  export type ProductMetaSumAggregateInputType = {
    wpProductId?: true
  }

  export type ProductMetaMinAggregateInputType = {
    wpProductId?: true
    sku?: true
    name?: true
    warehouse?: true
    thumbnailUrl?: true
    syncedAt?: true
  }

  export type ProductMetaMaxAggregateInputType = {
    wpProductId?: true
    sku?: true
    name?: true
    warehouse?: true
    thumbnailUrl?: true
    syncedAt?: true
  }

  export type ProductMetaCountAggregateInputType = {
    wpProductId?: true
    sku?: true
    name?: true
    warehouse?: true
    thumbnailUrl?: true
    syncedAt?: true
    _all?: true
  }

  export type ProductMetaAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ProductMeta to aggregate.
     */
    where?: ProductMetaWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ProductMetas to fetch.
     */
    orderBy?: ProductMetaOrderByWithRelationInput | ProductMetaOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ProductMetaWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ProductMetas from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ProductMetas.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned ProductMetas
    **/
    _count?: true | ProductMetaCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: ProductMetaAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: ProductMetaSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: ProductMetaMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: ProductMetaMaxAggregateInputType
  }

  export type GetProductMetaAggregateType<T extends ProductMetaAggregateArgs> = {
        [P in keyof T & keyof AggregateProductMeta]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateProductMeta[P]>
      : GetScalarType<T[P], AggregateProductMeta[P]>
  }




  export type ProductMetaGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ProductMetaWhereInput
    orderBy?: ProductMetaOrderByWithAggregationInput | ProductMetaOrderByWithAggregationInput[]
    by: ProductMetaScalarFieldEnum[] | ProductMetaScalarFieldEnum
    having?: ProductMetaScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: ProductMetaCountAggregateInputType | true
    _avg?: ProductMetaAvgAggregateInputType
    _sum?: ProductMetaSumAggregateInputType
    _min?: ProductMetaMinAggregateInputType
    _max?: ProductMetaMaxAggregateInputType
  }

  export type ProductMetaGroupByOutputType = {
    wpProductId: number
    sku: string | null
    name: string
    warehouse: $Enums.Warehouse | null
    thumbnailUrl: string | null
    syncedAt: Date
    _count: ProductMetaCountAggregateOutputType | null
    _avg: ProductMetaAvgAggregateOutputType | null
    _sum: ProductMetaSumAggregateOutputType | null
    _min: ProductMetaMinAggregateOutputType | null
    _max: ProductMetaMaxAggregateOutputType | null
  }

  type GetProductMetaGroupByPayload<T extends ProductMetaGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<ProductMetaGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof ProductMetaGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ProductMetaGroupByOutputType[P]>
            : GetScalarType<T[P], ProductMetaGroupByOutputType[P]>
        }
      >
    >


  export type ProductMetaSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    wpProductId?: boolean
    sku?: boolean
    name?: boolean
    warehouse?: boolean
    thumbnailUrl?: boolean
    syncedAt?: boolean
    orderItems?: boolean | ProductMeta$orderItemsArgs<ExtArgs>
    _count?: boolean | ProductMetaCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["productMeta"]>


  export type ProductMetaSelectScalar = {
    wpProductId?: boolean
    sku?: boolean
    name?: boolean
    warehouse?: boolean
    thumbnailUrl?: boolean
    syncedAt?: boolean
  }

  export type ProductMetaInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    orderItems?: boolean | ProductMeta$orderItemsArgs<ExtArgs>
    _count?: boolean | ProductMetaCountOutputTypeDefaultArgs<ExtArgs>
  }

  export type $ProductMetaPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "ProductMeta"
    objects: {
      orderItems: Prisma.$OrderItemPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      wpProductId: number
      sku: string | null
      name: string
      warehouse: $Enums.Warehouse | null
      thumbnailUrl: string | null
      syncedAt: Date
    }, ExtArgs["result"]["productMeta"]>
    composites: {}
  }

  type ProductMetaGetPayload<S extends boolean | null | undefined | ProductMetaDefaultArgs> = $Result.GetResult<Prisma.$ProductMetaPayload, S>

  type ProductMetaCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<ProductMetaFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: ProductMetaCountAggregateInputType | true
    }

  export interface ProductMetaDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['ProductMeta'], meta: { name: 'ProductMeta' } }
    /**
     * Find zero or one ProductMeta that matches the filter.
     * @param {ProductMetaFindUniqueArgs} args - Arguments to find a ProductMeta
     * @example
     * // Get one ProductMeta
     * const productMeta = await prisma.productMeta.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ProductMetaFindUniqueArgs>(args: SelectSubset<T, ProductMetaFindUniqueArgs<ExtArgs>>): Prisma__ProductMetaClient<$Result.GetResult<Prisma.$ProductMetaPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one ProductMeta that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {ProductMetaFindUniqueOrThrowArgs} args - Arguments to find a ProductMeta
     * @example
     * // Get one ProductMeta
     * const productMeta = await prisma.productMeta.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ProductMetaFindUniqueOrThrowArgs>(args: SelectSubset<T, ProductMetaFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ProductMetaClient<$Result.GetResult<Prisma.$ProductMetaPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first ProductMeta that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProductMetaFindFirstArgs} args - Arguments to find a ProductMeta
     * @example
     * // Get one ProductMeta
     * const productMeta = await prisma.productMeta.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ProductMetaFindFirstArgs>(args?: SelectSubset<T, ProductMetaFindFirstArgs<ExtArgs>>): Prisma__ProductMetaClient<$Result.GetResult<Prisma.$ProductMetaPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first ProductMeta that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProductMetaFindFirstOrThrowArgs} args - Arguments to find a ProductMeta
     * @example
     * // Get one ProductMeta
     * const productMeta = await prisma.productMeta.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ProductMetaFindFirstOrThrowArgs>(args?: SelectSubset<T, ProductMetaFindFirstOrThrowArgs<ExtArgs>>): Prisma__ProductMetaClient<$Result.GetResult<Prisma.$ProductMetaPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more ProductMetas that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProductMetaFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all ProductMetas
     * const productMetas = await prisma.productMeta.findMany()
     * 
     * // Get first 10 ProductMetas
     * const productMetas = await prisma.productMeta.findMany({ take: 10 })
     * 
     * // Only select the `wpProductId`
     * const productMetaWithWpProductIdOnly = await prisma.productMeta.findMany({ select: { wpProductId: true } })
     * 
     */
    findMany<T extends ProductMetaFindManyArgs>(args?: SelectSubset<T, ProductMetaFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ProductMetaPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a ProductMeta.
     * @param {ProductMetaCreateArgs} args - Arguments to create a ProductMeta.
     * @example
     * // Create one ProductMeta
     * const ProductMeta = await prisma.productMeta.create({
     *   data: {
     *     // ... data to create a ProductMeta
     *   }
     * })
     * 
     */
    create<T extends ProductMetaCreateArgs>(args: SelectSubset<T, ProductMetaCreateArgs<ExtArgs>>): Prisma__ProductMetaClient<$Result.GetResult<Prisma.$ProductMetaPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many ProductMetas.
     * @param {ProductMetaCreateManyArgs} args - Arguments to create many ProductMetas.
     * @example
     * // Create many ProductMetas
     * const productMeta = await prisma.productMeta.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ProductMetaCreateManyArgs>(args?: SelectSubset<T, ProductMetaCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a ProductMeta.
     * @param {ProductMetaDeleteArgs} args - Arguments to delete one ProductMeta.
     * @example
     * // Delete one ProductMeta
     * const ProductMeta = await prisma.productMeta.delete({
     *   where: {
     *     // ... filter to delete one ProductMeta
     *   }
     * })
     * 
     */
    delete<T extends ProductMetaDeleteArgs>(args: SelectSubset<T, ProductMetaDeleteArgs<ExtArgs>>): Prisma__ProductMetaClient<$Result.GetResult<Prisma.$ProductMetaPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one ProductMeta.
     * @param {ProductMetaUpdateArgs} args - Arguments to update one ProductMeta.
     * @example
     * // Update one ProductMeta
     * const productMeta = await prisma.productMeta.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ProductMetaUpdateArgs>(args: SelectSubset<T, ProductMetaUpdateArgs<ExtArgs>>): Prisma__ProductMetaClient<$Result.GetResult<Prisma.$ProductMetaPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more ProductMetas.
     * @param {ProductMetaDeleteManyArgs} args - Arguments to filter ProductMetas to delete.
     * @example
     * // Delete a few ProductMetas
     * const { count } = await prisma.productMeta.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ProductMetaDeleteManyArgs>(args?: SelectSubset<T, ProductMetaDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more ProductMetas.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProductMetaUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many ProductMetas
     * const productMeta = await prisma.productMeta.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ProductMetaUpdateManyArgs>(args: SelectSubset<T, ProductMetaUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one ProductMeta.
     * @param {ProductMetaUpsertArgs} args - Arguments to update or create a ProductMeta.
     * @example
     * // Update or create a ProductMeta
     * const productMeta = await prisma.productMeta.upsert({
     *   create: {
     *     // ... data to create a ProductMeta
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the ProductMeta we want to update
     *   }
     * })
     */
    upsert<T extends ProductMetaUpsertArgs>(args: SelectSubset<T, ProductMetaUpsertArgs<ExtArgs>>): Prisma__ProductMetaClient<$Result.GetResult<Prisma.$ProductMetaPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of ProductMetas.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProductMetaCountArgs} args - Arguments to filter ProductMetas to count.
     * @example
     * // Count the number of ProductMetas
     * const count = await prisma.productMeta.count({
     *   where: {
     *     // ... the filter for the ProductMetas we want to count
     *   }
     * })
    **/
    count<T extends ProductMetaCountArgs>(
      args?: Subset<T, ProductMetaCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], ProductMetaCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a ProductMeta.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProductMetaAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends ProductMetaAggregateArgs>(args: Subset<T, ProductMetaAggregateArgs>): Prisma.PrismaPromise<GetProductMetaAggregateType<T>>

    /**
     * Group by ProductMeta.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProductMetaGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends ProductMetaGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ProductMetaGroupByArgs['orderBy'] }
        : { orderBy?: ProductMetaGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, ProductMetaGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetProductMetaGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the ProductMeta model
   */
  readonly fields: ProductMetaFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for ProductMeta.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ProductMetaClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    orderItems<T extends ProductMeta$orderItemsArgs<ExtArgs> = {}>(args?: Subset<T, ProductMeta$orderItemsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$OrderItemPayload<ExtArgs>, T, "findMany"> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the ProductMeta model
   */ 
  interface ProductMetaFieldRefs {
    readonly wpProductId: FieldRef<"ProductMeta", 'Int'>
    readonly sku: FieldRef<"ProductMeta", 'String'>
    readonly name: FieldRef<"ProductMeta", 'String'>
    readonly warehouse: FieldRef<"ProductMeta", 'Warehouse'>
    readonly thumbnailUrl: FieldRef<"ProductMeta", 'String'>
    readonly syncedAt: FieldRef<"ProductMeta", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * ProductMeta findUnique
   */
  export type ProductMetaFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProductMeta
     */
    select?: ProductMetaSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProductMetaInclude<ExtArgs> | null
    /**
     * Filter, which ProductMeta to fetch.
     */
    where: ProductMetaWhereUniqueInput
  }

  /**
   * ProductMeta findUniqueOrThrow
   */
  export type ProductMetaFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProductMeta
     */
    select?: ProductMetaSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProductMetaInclude<ExtArgs> | null
    /**
     * Filter, which ProductMeta to fetch.
     */
    where: ProductMetaWhereUniqueInput
  }

  /**
   * ProductMeta findFirst
   */
  export type ProductMetaFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProductMeta
     */
    select?: ProductMetaSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProductMetaInclude<ExtArgs> | null
    /**
     * Filter, which ProductMeta to fetch.
     */
    where?: ProductMetaWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ProductMetas to fetch.
     */
    orderBy?: ProductMetaOrderByWithRelationInput | ProductMetaOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ProductMetas.
     */
    cursor?: ProductMetaWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ProductMetas from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ProductMetas.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ProductMetas.
     */
    distinct?: ProductMetaScalarFieldEnum | ProductMetaScalarFieldEnum[]
  }

  /**
   * ProductMeta findFirstOrThrow
   */
  export type ProductMetaFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProductMeta
     */
    select?: ProductMetaSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProductMetaInclude<ExtArgs> | null
    /**
     * Filter, which ProductMeta to fetch.
     */
    where?: ProductMetaWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ProductMetas to fetch.
     */
    orderBy?: ProductMetaOrderByWithRelationInput | ProductMetaOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ProductMetas.
     */
    cursor?: ProductMetaWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ProductMetas from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ProductMetas.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ProductMetas.
     */
    distinct?: ProductMetaScalarFieldEnum | ProductMetaScalarFieldEnum[]
  }

  /**
   * ProductMeta findMany
   */
  export type ProductMetaFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProductMeta
     */
    select?: ProductMetaSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProductMetaInclude<ExtArgs> | null
    /**
     * Filter, which ProductMetas to fetch.
     */
    where?: ProductMetaWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ProductMetas to fetch.
     */
    orderBy?: ProductMetaOrderByWithRelationInput | ProductMetaOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing ProductMetas.
     */
    cursor?: ProductMetaWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ProductMetas from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ProductMetas.
     */
    skip?: number
    distinct?: ProductMetaScalarFieldEnum | ProductMetaScalarFieldEnum[]
  }

  /**
   * ProductMeta create
   */
  export type ProductMetaCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProductMeta
     */
    select?: ProductMetaSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProductMetaInclude<ExtArgs> | null
    /**
     * The data needed to create a ProductMeta.
     */
    data: XOR<ProductMetaCreateInput, ProductMetaUncheckedCreateInput>
  }

  /**
   * ProductMeta createMany
   */
  export type ProductMetaCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many ProductMetas.
     */
    data: ProductMetaCreateManyInput | ProductMetaCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * ProductMeta update
   */
  export type ProductMetaUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProductMeta
     */
    select?: ProductMetaSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProductMetaInclude<ExtArgs> | null
    /**
     * The data needed to update a ProductMeta.
     */
    data: XOR<ProductMetaUpdateInput, ProductMetaUncheckedUpdateInput>
    /**
     * Choose, which ProductMeta to update.
     */
    where: ProductMetaWhereUniqueInput
  }

  /**
   * ProductMeta updateMany
   */
  export type ProductMetaUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update ProductMetas.
     */
    data: XOR<ProductMetaUpdateManyMutationInput, ProductMetaUncheckedUpdateManyInput>
    /**
     * Filter which ProductMetas to update
     */
    where?: ProductMetaWhereInput
  }

  /**
   * ProductMeta upsert
   */
  export type ProductMetaUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProductMeta
     */
    select?: ProductMetaSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProductMetaInclude<ExtArgs> | null
    /**
     * The filter to search for the ProductMeta to update in case it exists.
     */
    where: ProductMetaWhereUniqueInput
    /**
     * In case the ProductMeta found by the `where` argument doesn't exist, create a new ProductMeta with this data.
     */
    create: XOR<ProductMetaCreateInput, ProductMetaUncheckedCreateInput>
    /**
     * In case the ProductMeta was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ProductMetaUpdateInput, ProductMetaUncheckedUpdateInput>
  }

  /**
   * ProductMeta delete
   */
  export type ProductMetaDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProductMeta
     */
    select?: ProductMetaSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProductMetaInclude<ExtArgs> | null
    /**
     * Filter which ProductMeta to delete.
     */
    where: ProductMetaWhereUniqueInput
  }

  /**
   * ProductMeta deleteMany
   */
  export type ProductMetaDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ProductMetas to delete
     */
    where?: ProductMetaWhereInput
  }

  /**
   * ProductMeta.orderItems
   */
  export type ProductMeta$orderItemsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrderItem
     */
    select?: OrderItemSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrderItemInclude<ExtArgs> | null
    where?: OrderItemWhereInput
    orderBy?: OrderItemOrderByWithRelationInput | OrderItemOrderByWithRelationInput[]
    cursor?: OrderItemWhereUniqueInput
    take?: number
    skip?: number
    distinct?: OrderItemScalarFieldEnum | OrderItemScalarFieldEnum[]
  }

  /**
   * ProductMeta without action
   */
  export type ProductMetaDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProductMeta
     */
    select?: ProductMetaSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProductMetaInclude<ExtArgs> | null
  }


  /**
   * Model Order
   */

  export type AggregateOrder = {
    _count: OrderCountAggregateOutputType | null
    _avg: OrderAvgAggregateOutputType | null
    _sum: OrderSumAggregateOutputType | null
    _min: OrderMinAggregateOutputType | null
    _max: OrderMaxAggregateOutputType | null
  }

  export type OrderAvgAggregateOutputType = {
    id: number | null
    wpOrderId: number | null
    stopPosition: number | null
    bagsExpected: number | null
    packedById: number | null
  }

  export type OrderSumAggregateOutputType = {
    id: number | null
    wpOrderId: number | null
    stopPosition: number | null
    bagsExpected: number | null
    packedById: number | null
  }

  export type OrderMinAggregateOutputType = {
    id: number | null
    wpOrderId: number | null
    number: string | null
    status: $Enums.OrderStatus | null
    route: string | null
    stopPosition: number | null
    customerName: string | null
    customerAddress: string | null
    hasB2Pending: boolean | null
    bagsExpected: number | null
    packedById: number | null
    packedAt: Date | null
    classifiedAt: Date | null
    loadedAt: Date | null
    deliveredAt: Date | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type OrderMaxAggregateOutputType = {
    id: number | null
    wpOrderId: number | null
    number: string | null
    status: $Enums.OrderStatus | null
    route: string | null
    stopPosition: number | null
    customerName: string | null
    customerAddress: string | null
    hasB2Pending: boolean | null
    bagsExpected: number | null
    packedById: number | null
    packedAt: Date | null
    classifiedAt: Date | null
    loadedAt: Date | null
    deliveredAt: Date | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type OrderCountAggregateOutputType = {
    id: number
    wpOrderId: number
    number: number
    status: number
    route: number
    stopPosition: number
    customerName: number
    customerAddress: number
    hasB2Pending: number
    bagsExpected: number
    packedById: number
    packedAt: number
    classifiedAt: number
    loadedAt: number
    deliveredAt: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type OrderAvgAggregateInputType = {
    id?: true
    wpOrderId?: true
    stopPosition?: true
    bagsExpected?: true
    packedById?: true
  }

  export type OrderSumAggregateInputType = {
    id?: true
    wpOrderId?: true
    stopPosition?: true
    bagsExpected?: true
    packedById?: true
  }

  export type OrderMinAggregateInputType = {
    id?: true
    wpOrderId?: true
    number?: true
    status?: true
    route?: true
    stopPosition?: true
    customerName?: true
    customerAddress?: true
    hasB2Pending?: true
    bagsExpected?: true
    packedById?: true
    packedAt?: true
    classifiedAt?: true
    loadedAt?: true
    deliveredAt?: true
    createdAt?: true
    updatedAt?: true
  }

  export type OrderMaxAggregateInputType = {
    id?: true
    wpOrderId?: true
    number?: true
    status?: true
    route?: true
    stopPosition?: true
    customerName?: true
    customerAddress?: true
    hasB2Pending?: true
    bagsExpected?: true
    packedById?: true
    packedAt?: true
    classifiedAt?: true
    loadedAt?: true
    deliveredAt?: true
    createdAt?: true
    updatedAt?: true
  }

  export type OrderCountAggregateInputType = {
    id?: true
    wpOrderId?: true
    number?: true
    status?: true
    route?: true
    stopPosition?: true
    customerName?: true
    customerAddress?: true
    hasB2Pending?: true
    bagsExpected?: true
    packedById?: true
    packedAt?: true
    classifiedAt?: true
    loadedAt?: true
    deliveredAt?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type OrderAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Order to aggregate.
     */
    where?: OrderWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Orders to fetch.
     */
    orderBy?: OrderOrderByWithRelationInput | OrderOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: OrderWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Orders from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Orders.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Orders
    **/
    _count?: true | OrderCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: OrderAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: OrderSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: OrderMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: OrderMaxAggregateInputType
  }

  export type GetOrderAggregateType<T extends OrderAggregateArgs> = {
        [P in keyof T & keyof AggregateOrder]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateOrder[P]>
      : GetScalarType<T[P], AggregateOrder[P]>
  }




  export type OrderGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: OrderWhereInput
    orderBy?: OrderOrderByWithAggregationInput | OrderOrderByWithAggregationInput[]
    by: OrderScalarFieldEnum[] | OrderScalarFieldEnum
    having?: OrderScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: OrderCountAggregateInputType | true
    _avg?: OrderAvgAggregateInputType
    _sum?: OrderSumAggregateInputType
    _min?: OrderMinAggregateInputType
    _max?: OrderMaxAggregateInputType
  }

  export type OrderGroupByOutputType = {
    id: number
    wpOrderId: number
    number: string
    status: $Enums.OrderStatus
    route: string | null
    stopPosition: number | null
    customerName: string | null
    customerAddress: string | null
    hasB2Pending: boolean
    bagsExpected: number
    packedById: number | null
    packedAt: Date | null
    classifiedAt: Date | null
    loadedAt: Date | null
    deliveredAt: Date | null
    createdAt: Date
    updatedAt: Date
    _count: OrderCountAggregateOutputType | null
    _avg: OrderAvgAggregateOutputType | null
    _sum: OrderSumAggregateOutputType | null
    _min: OrderMinAggregateOutputType | null
    _max: OrderMaxAggregateOutputType | null
  }

  type GetOrderGroupByPayload<T extends OrderGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<OrderGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof OrderGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], OrderGroupByOutputType[P]>
            : GetScalarType<T[P], OrderGroupByOutputType[P]>
        }
      >
    >


  export type OrderSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    wpOrderId?: boolean
    number?: boolean
    status?: boolean
    route?: boolean
    stopPosition?: boolean
    customerName?: boolean
    customerAddress?: boolean
    hasB2Pending?: boolean
    bagsExpected?: boolean
    packedById?: boolean
    packedAt?: boolean
    classifiedAt?: boolean
    loadedAt?: boolean
    deliveredAt?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    packedBy?: boolean | Order$packedByArgs<ExtArgs>
    items?: boolean | Order$itemsArgs<ExtArgs>
    sequenceLinks?: boolean | Order$sequenceLinksArgs<ExtArgs>
    events?: boolean | Order$eventsArgs<ExtArgs>
    _count?: boolean | OrderCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["order"]>


  export type OrderSelectScalar = {
    id?: boolean
    wpOrderId?: boolean
    number?: boolean
    status?: boolean
    route?: boolean
    stopPosition?: boolean
    customerName?: boolean
    customerAddress?: boolean
    hasB2Pending?: boolean
    bagsExpected?: boolean
    packedById?: boolean
    packedAt?: boolean
    classifiedAt?: boolean
    loadedAt?: boolean
    deliveredAt?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type OrderInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    packedBy?: boolean | Order$packedByArgs<ExtArgs>
    items?: boolean | Order$itemsArgs<ExtArgs>
    sequenceLinks?: boolean | Order$sequenceLinksArgs<ExtArgs>
    events?: boolean | Order$eventsArgs<ExtArgs>
    _count?: boolean | OrderCountOutputTypeDefaultArgs<ExtArgs>
  }

  export type $OrderPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Order"
    objects: {
      packedBy: Prisma.$UserMetaPayload<ExtArgs> | null
      items: Prisma.$OrderItemPayload<ExtArgs>[]
      sequenceLinks: Prisma.$SequenceOrderPayload<ExtArgs>[]
      events: Prisma.$EventPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: number
      wpOrderId: number
      number: string
      status: $Enums.OrderStatus
      route: string | null
      stopPosition: number | null
      customerName: string | null
      customerAddress: string | null
      hasB2Pending: boolean
      bagsExpected: number
      packedById: number | null
      packedAt: Date | null
      classifiedAt: Date | null
      loadedAt: Date | null
      deliveredAt: Date | null
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["order"]>
    composites: {}
  }

  type OrderGetPayload<S extends boolean | null | undefined | OrderDefaultArgs> = $Result.GetResult<Prisma.$OrderPayload, S>

  type OrderCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<OrderFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: OrderCountAggregateInputType | true
    }

  export interface OrderDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Order'], meta: { name: 'Order' } }
    /**
     * Find zero or one Order that matches the filter.
     * @param {OrderFindUniqueArgs} args - Arguments to find a Order
     * @example
     * // Get one Order
     * const order = await prisma.order.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends OrderFindUniqueArgs>(args: SelectSubset<T, OrderFindUniqueArgs<ExtArgs>>): Prisma__OrderClient<$Result.GetResult<Prisma.$OrderPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one Order that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {OrderFindUniqueOrThrowArgs} args - Arguments to find a Order
     * @example
     * // Get one Order
     * const order = await prisma.order.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends OrderFindUniqueOrThrowArgs>(args: SelectSubset<T, OrderFindUniqueOrThrowArgs<ExtArgs>>): Prisma__OrderClient<$Result.GetResult<Prisma.$OrderPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first Order that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OrderFindFirstArgs} args - Arguments to find a Order
     * @example
     * // Get one Order
     * const order = await prisma.order.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends OrderFindFirstArgs>(args?: SelectSubset<T, OrderFindFirstArgs<ExtArgs>>): Prisma__OrderClient<$Result.GetResult<Prisma.$OrderPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first Order that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OrderFindFirstOrThrowArgs} args - Arguments to find a Order
     * @example
     * // Get one Order
     * const order = await prisma.order.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends OrderFindFirstOrThrowArgs>(args?: SelectSubset<T, OrderFindFirstOrThrowArgs<ExtArgs>>): Prisma__OrderClient<$Result.GetResult<Prisma.$OrderPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more Orders that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OrderFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Orders
     * const orders = await prisma.order.findMany()
     * 
     * // Get first 10 Orders
     * const orders = await prisma.order.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const orderWithIdOnly = await prisma.order.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends OrderFindManyArgs>(args?: SelectSubset<T, OrderFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$OrderPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a Order.
     * @param {OrderCreateArgs} args - Arguments to create a Order.
     * @example
     * // Create one Order
     * const Order = await prisma.order.create({
     *   data: {
     *     // ... data to create a Order
     *   }
     * })
     * 
     */
    create<T extends OrderCreateArgs>(args: SelectSubset<T, OrderCreateArgs<ExtArgs>>): Prisma__OrderClient<$Result.GetResult<Prisma.$OrderPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many Orders.
     * @param {OrderCreateManyArgs} args - Arguments to create many Orders.
     * @example
     * // Create many Orders
     * const order = await prisma.order.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends OrderCreateManyArgs>(args?: SelectSubset<T, OrderCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a Order.
     * @param {OrderDeleteArgs} args - Arguments to delete one Order.
     * @example
     * // Delete one Order
     * const Order = await prisma.order.delete({
     *   where: {
     *     // ... filter to delete one Order
     *   }
     * })
     * 
     */
    delete<T extends OrderDeleteArgs>(args: SelectSubset<T, OrderDeleteArgs<ExtArgs>>): Prisma__OrderClient<$Result.GetResult<Prisma.$OrderPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one Order.
     * @param {OrderUpdateArgs} args - Arguments to update one Order.
     * @example
     * // Update one Order
     * const order = await prisma.order.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends OrderUpdateArgs>(args: SelectSubset<T, OrderUpdateArgs<ExtArgs>>): Prisma__OrderClient<$Result.GetResult<Prisma.$OrderPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more Orders.
     * @param {OrderDeleteManyArgs} args - Arguments to filter Orders to delete.
     * @example
     * // Delete a few Orders
     * const { count } = await prisma.order.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends OrderDeleteManyArgs>(args?: SelectSubset<T, OrderDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Orders.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OrderUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Orders
     * const order = await prisma.order.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends OrderUpdateManyArgs>(args: SelectSubset<T, OrderUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Order.
     * @param {OrderUpsertArgs} args - Arguments to update or create a Order.
     * @example
     * // Update or create a Order
     * const order = await prisma.order.upsert({
     *   create: {
     *     // ... data to create a Order
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Order we want to update
     *   }
     * })
     */
    upsert<T extends OrderUpsertArgs>(args: SelectSubset<T, OrderUpsertArgs<ExtArgs>>): Prisma__OrderClient<$Result.GetResult<Prisma.$OrderPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of Orders.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OrderCountArgs} args - Arguments to filter Orders to count.
     * @example
     * // Count the number of Orders
     * const count = await prisma.order.count({
     *   where: {
     *     // ... the filter for the Orders we want to count
     *   }
     * })
    **/
    count<T extends OrderCountArgs>(
      args?: Subset<T, OrderCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], OrderCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Order.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OrderAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends OrderAggregateArgs>(args: Subset<T, OrderAggregateArgs>): Prisma.PrismaPromise<GetOrderAggregateType<T>>

    /**
     * Group by Order.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OrderGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends OrderGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: OrderGroupByArgs['orderBy'] }
        : { orderBy?: OrderGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, OrderGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetOrderGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Order model
   */
  readonly fields: OrderFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Order.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__OrderClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    packedBy<T extends Order$packedByArgs<ExtArgs> = {}>(args?: Subset<T, Order$packedByArgs<ExtArgs>>): Prisma__UserMetaClient<$Result.GetResult<Prisma.$UserMetaPayload<ExtArgs>, T, "findUniqueOrThrow"> | null, null, ExtArgs>
    items<T extends Order$itemsArgs<ExtArgs> = {}>(args?: Subset<T, Order$itemsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$OrderItemPayload<ExtArgs>, T, "findMany"> | Null>
    sequenceLinks<T extends Order$sequenceLinksArgs<ExtArgs> = {}>(args?: Subset<T, Order$sequenceLinksArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SequenceOrderPayload<ExtArgs>, T, "findMany"> | Null>
    events<T extends Order$eventsArgs<ExtArgs> = {}>(args?: Subset<T, Order$eventsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$EventPayload<ExtArgs>, T, "findMany"> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Order model
   */ 
  interface OrderFieldRefs {
    readonly id: FieldRef<"Order", 'Int'>
    readonly wpOrderId: FieldRef<"Order", 'Int'>
    readonly number: FieldRef<"Order", 'String'>
    readonly status: FieldRef<"Order", 'OrderStatus'>
    readonly route: FieldRef<"Order", 'String'>
    readonly stopPosition: FieldRef<"Order", 'Int'>
    readonly customerName: FieldRef<"Order", 'String'>
    readonly customerAddress: FieldRef<"Order", 'String'>
    readonly hasB2Pending: FieldRef<"Order", 'Boolean'>
    readonly bagsExpected: FieldRef<"Order", 'Int'>
    readonly packedById: FieldRef<"Order", 'Int'>
    readonly packedAt: FieldRef<"Order", 'DateTime'>
    readonly classifiedAt: FieldRef<"Order", 'DateTime'>
    readonly loadedAt: FieldRef<"Order", 'DateTime'>
    readonly deliveredAt: FieldRef<"Order", 'DateTime'>
    readonly createdAt: FieldRef<"Order", 'DateTime'>
    readonly updatedAt: FieldRef<"Order", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Order findUnique
   */
  export type OrderFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Order
     */
    select?: OrderSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrderInclude<ExtArgs> | null
    /**
     * Filter, which Order to fetch.
     */
    where: OrderWhereUniqueInput
  }

  /**
   * Order findUniqueOrThrow
   */
  export type OrderFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Order
     */
    select?: OrderSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrderInclude<ExtArgs> | null
    /**
     * Filter, which Order to fetch.
     */
    where: OrderWhereUniqueInput
  }

  /**
   * Order findFirst
   */
  export type OrderFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Order
     */
    select?: OrderSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrderInclude<ExtArgs> | null
    /**
     * Filter, which Order to fetch.
     */
    where?: OrderWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Orders to fetch.
     */
    orderBy?: OrderOrderByWithRelationInput | OrderOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Orders.
     */
    cursor?: OrderWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Orders from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Orders.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Orders.
     */
    distinct?: OrderScalarFieldEnum | OrderScalarFieldEnum[]
  }

  /**
   * Order findFirstOrThrow
   */
  export type OrderFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Order
     */
    select?: OrderSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrderInclude<ExtArgs> | null
    /**
     * Filter, which Order to fetch.
     */
    where?: OrderWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Orders to fetch.
     */
    orderBy?: OrderOrderByWithRelationInput | OrderOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Orders.
     */
    cursor?: OrderWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Orders from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Orders.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Orders.
     */
    distinct?: OrderScalarFieldEnum | OrderScalarFieldEnum[]
  }

  /**
   * Order findMany
   */
  export type OrderFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Order
     */
    select?: OrderSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrderInclude<ExtArgs> | null
    /**
     * Filter, which Orders to fetch.
     */
    where?: OrderWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Orders to fetch.
     */
    orderBy?: OrderOrderByWithRelationInput | OrderOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Orders.
     */
    cursor?: OrderWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Orders from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Orders.
     */
    skip?: number
    distinct?: OrderScalarFieldEnum | OrderScalarFieldEnum[]
  }

  /**
   * Order create
   */
  export type OrderCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Order
     */
    select?: OrderSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrderInclude<ExtArgs> | null
    /**
     * The data needed to create a Order.
     */
    data: XOR<OrderCreateInput, OrderUncheckedCreateInput>
  }

  /**
   * Order createMany
   */
  export type OrderCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Orders.
     */
    data: OrderCreateManyInput | OrderCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Order update
   */
  export type OrderUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Order
     */
    select?: OrderSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrderInclude<ExtArgs> | null
    /**
     * The data needed to update a Order.
     */
    data: XOR<OrderUpdateInput, OrderUncheckedUpdateInput>
    /**
     * Choose, which Order to update.
     */
    where: OrderWhereUniqueInput
  }

  /**
   * Order updateMany
   */
  export type OrderUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Orders.
     */
    data: XOR<OrderUpdateManyMutationInput, OrderUncheckedUpdateManyInput>
    /**
     * Filter which Orders to update
     */
    where?: OrderWhereInput
  }

  /**
   * Order upsert
   */
  export type OrderUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Order
     */
    select?: OrderSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrderInclude<ExtArgs> | null
    /**
     * The filter to search for the Order to update in case it exists.
     */
    where: OrderWhereUniqueInput
    /**
     * In case the Order found by the `where` argument doesn't exist, create a new Order with this data.
     */
    create: XOR<OrderCreateInput, OrderUncheckedCreateInput>
    /**
     * In case the Order was found with the provided `where` argument, update it with this data.
     */
    update: XOR<OrderUpdateInput, OrderUncheckedUpdateInput>
  }

  /**
   * Order delete
   */
  export type OrderDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Order
     */
    select?: OrderSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrderInclude<ExtArgs> | null
    /**
     * Filter which Order to delete.
     */
    where: OrderWhereUniqueInput
  }

  /**
   * Order deleteMany
   */
  export type OrderDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Orders to delete
     */
    where?: OrderWhereInput
  }

  /**
   * Order.packedBy
   */
  export type Order$packedByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserMeta
     */
    select?: UserMetaSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserMetaInclude<ExtArgs> | null
    where?: UserMetaWhereInput
  }

  /**
   * Order.items
   */
  export type Order$itemsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrderItem
     */
    select?: OrderItemSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrderItemInclude<ExtArgs> | null
    where?: OrderItemWhereInput
    orderBy?: OrderItemOrderByWithRelationInput | OrderItemOrderByWithRelationInput[]
    cursor?: OrderItemWhereUniqueInput
    take?: number
    skip?: number
    distinct?: OrderItemScalarFieldEnum | OrderItemScalarFieldEnum[]
  }

  /**
   * Order.sequenceLinks
   */
  export type Order$sequenceLinksArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SequenceOrder
     */
    select?: SequenceOrderSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SequenceOrderInclude<ExtArgs> | null
    where?: SequenceOrderWhereInput
    orderBy?: SequenceOrderOrderByWithRelationInput | SequenceOrderOrderByWithRelationInput[]
    cursor?: SequenceOrderWhereUniqueInput
    take?: number
    skip?: number
    distinct?: SequenceOrderScalarFieldEnum | SequenceOrderScalarFieldEnum[]
  }

  /**
   * Order.events
   */
  export type Order$eventsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Event
     */
    select?: EventSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EventInclude<ExtArgs> | null
    where?: EventWhereInput
    orderBy?: EventOrderByWithRelationInput | EventOrderByWithRelationInput[]
    cursor?: EventWhereUniqueInput
    take?: number
    skip?: number
    distinct?: EventScalarFieldEnum | EventScalarFieldEnum[]
  }

  /**
   * Order without action
   */
  export type OrderDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Order
     */
    select?: OrderSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrderInclude<ExtArgs> | null
  }


  /**
   * Model OrderItem
   */

  export type AggregateOrderItem = {
    _count: OrderItemCountAggregateOutputType | null
    _avg: OrderItemAvgAggregateOutputType | null
    _sum: OrderItemSumAggregateOutputType | null
    _min: OrderItemMinAggregateOutputType | null
    _max: OrderItemMaxAggregateOutputType | null
  }

  export type OrderItemAvgAggregateOutputType = {
    id: number | null
    orderId: number | null
    productId: number | null
    qty: number | null
  }

  export type OrderItemSumAggregateOutputType = {
    id: number | null
    orderId: number | null
    productId: number | null
    qty: number | null
  }

  export type OrderItemMinAggregateOutputType = {
    id: number | null
    orderId: number | null
    productId: number | null
    qty: number | null
    warehouse: $Enums.Warehouse | null
    pickedAt: Date | null
    packedAt: Date | null
  }

  export type OrderItemMaxAggregateOutputType = {
    id: number | null
    orderId: number | null
    productId: number | null
    qty: number | null
    warehouse: $Enums.Warehouse | null
    pickedAt: Date | null
    packedAt: Date | null
  }

  export type OrderItemCountAggregateOutputType = {
    id: number
    orderId: number
    productId: number
    qty: number
    warehouse: number
    pickedAt: number
    packedAt: number
    _all: number
  }


  export type OrderItemAvgAggregateInputType = {
    id?: true
    orderId?: true
    productId?: true
    qty?: true
  }

  export type OrderItemSumAggregateInputType = {
    id?: true
    orderId?: true
    productId?: true
    qty?: true
  }

  export type OrderItemMinAggregateInputType = {
    id?: true
    orderId?: true
    productId?: true
    qty?: true
    warehouse?: true
    pickedAt?: true
    packedAt?: true
  }

  export type OrderItemMaxAggregateInputType = {
    id?: true
    orderId?: true
    productId?: true
    qty?: true
    warehouse?: true
    pickedAt?: true
    packedAt?: true
  }

  export type OrderItemCountAggregateInputType = {
    id?: true
    orderId?: true
    productId?: true
    qty?: true
    warehouse?: true
    pickedAt?: true
    packedAt?: true
    _all?: true
  }

  export type OrderItemAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which OrderItem to aggregate.
     */
    where?: OrderItemWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of OrderItems to fetch.
     */
    orderBy?: OrderItemOrderByWithRelationInput | OrderItemOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: OrderItemWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` OrderItems from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` OrderItems.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned OrderItems
    **/
    _count?: true | OrderItemCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: OrderItemAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: OrderItemSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: OrderItemMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: OrderItemMaxAggregateInputType
  }

  export type GetOrderItemAggregateType<T extends OrderItemAggregateArgs> = {
        [P in keyof T & keyof AggregateOrderItem]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateOrderItem[P]>
      : GetScalarType<T[P], AggregateOrderItem[P]>
  }




  export type OrderItemGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: OrderItemWhereInput
    orderBy?: OrderItemOrderByWithAggregationInput | OrderItemOrderByWithAggregationInput[]
    by: OrderItemScalarFieldEnum[] | OrderItemScalarFieldEnum
    having?: OrderItemScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: OrderItemCountAggregateInputType | true
    _avg?: OrderItemAvgAggregateInputType
    _sum?: OrderItemSumAggregateInputType
    _min?: OrderItemMinAggregateInputType
    _max?: OrderItemMaxAggregateInputType
  }

  export type OrderItemGroupByOutputType = {
    id: number
    orderId: number
    productId: number
    qty: number
    warehouse: $Enums.Warehouse
    pickedAt: Date | null
    packedAt: Date | null
    _count: OrderItemCountAggregateOutputType | null
    _avg: OrderItemAvgAggregateOutputType | null
    _sum: OrderItemSumAggregateOutputType | null
    _min: OrderItemMinAggregateOutputType | null
    _max: OrderItemMaxAggregateOutputType | null
  }

  type GetOrderItemGroupByPayload<T extends OrderItemGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<OrderItemGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof OrderItemGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], OrderItemGroupByOutputType[P]>
            : GetScalarType<T[P], OrderItemGroupByOutputType[P]>
        }
      >
    >


  export type OrderItemSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    orderId?: boolean
    productId?: boolean
    qty?: boolean
    warehouse?: boolean
    pickedAt?: boolean
    packedAt?: boolean
    order?: boolean | OrderDefaultArgs<ExtArgs>
    product?: boolean | ProductMetaDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["orderItem"]>


  export type OrderItemSelectScalar = {
    id?: boolean
    orderId?: boolean
    productId?: boolean
    qty?: boolean
    warehouse?: boolean
    pickedAt?: boolean
    packedAt?: boolean
  }

  export type OrderItemInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    order?: boolean | OrderDefaultArgs<ExtArgs>
    product?: boolean | ProductMetaDefaultArgs<ExtArgs>
  }

  export type $OrderItemPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "OrderItem"
    objects: {
      order: Prisma.$OrderPayload<ExtArgs>
      product: Prisma.$ProductMetaPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: number
      orderId: number
      productId: number
      qty: number
      warehouse: $Enums.Warehouse
      pickedAt: Date | null
      packedAt: Date | null
    }, ExtArgs["result"]["orderItem"]>
    composites: {}
  }

  type OrderItemGetPayload<S extends boolean | null | undefined | OrderItemDefaultArgs> = $Result.GetResult<Prisma.$OrderItemPayload, S>

  type OrderItemCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<OrderItemFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: OrderItemCountAggregateInputType | true
    }

  export interface OrderItemDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['OrderItem'], meta: { name: 'OrderItem' } }
    /**
     * Find zero or one OrderItem that matches the filter.
     * @param {OrderItemFindUniqueArgs} args - Arguments to find a OrderItem
     * @example
     * // Get one OrderItem
     * const orderItem = await prisma.orderItem.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends OrderItemFindUniqueArgs>(args: SelectSubset<T, OrderItemFindUniqueArgs<ExtArgs>>): Prisma__OrderItemClient<$Result.GetResult<Prisma.$OrderItemPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one OrderItem that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {OrderItemFindUniqueOrThrowArgs} args - Arguments to find a OrderItem
     * @example
     * // Get one OrderItem
     * const orderItem = await prisma.orderItem.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends OrderItemFindUniqueOrThrowArgs>(args: SelectSubset<T, OrderItemFindUniqueOrThrowArgs<ExtArgs>>): Prisma__OrderItemClient<$Result.GetResult<Prisma.$OrderItemPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first OrderItem that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OrderItemFindFirstArgs} args - Arguments to find a OrderItem
     * @example
     * // Get one OrderItem
     * const orderItem = await prisma.orderItem.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends OrderItemFindFirstArgs>(args?: SelectSubset<T, OrderItemFindFirstArgs<ExtArgs>>): Prisma__OrderItemClient<$Result.GetResult<Prisma.$OrderItemPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first OrderItem that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OrderItemFindFirstOrThrowArgs} args - Arguments to find a OrderItem
     * @example
     * // Get one OrderItem
     * const orderItem = await prisma.orderItem.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends OrderItemFindFirstOrThrowArgs>(args?: SelectSubset<T, OrderItemFindFirstOrThrowArgs<ExtArgs>>): Prisma__OrderItemClient<$Result.GetResult<Prisma.$OrderItemPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more OrderItems that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OrderItemFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all OrderItems
     * const orderItems = await prisma.orderItem.findMany()
     * 
     * // Get first 10 OrderItems
     * const orderItems = await prisma.orderItem.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const orderItemWithIdOnly = await prisma.orderItem.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends OrderItemFindManyArgs>(args?: SelectSubset<T, OrderItemFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$OrderItemPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a OrderItem.
     * @param {OrderItemCreateArgs} args - Arguments to create a OrderItem.
     * @example
     * // Create one OrderItem
     * const OrderItem = await prisma.orderItem.create({
     *   data: {
     *     // ... data to create a OrderItem
     *   }
     * })
     * 
     */
    create<T extends OrderItemCreateArgs>(args: SelectSubset<T, OrderItemCreateArgs<ExtArgs>>): Prisma__OrderItemClient<$Result.GetResult<Prisma.$OrderItemPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many OrderItems.
     * @param {OrderItemCreateManyArgs} args - Arguments to create many OrderItems.
     * @example
     * // Create many OrderItems
     * const orderItem = await prisma.orderItem.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends OrderItemCreateManyArgs>(args?: SelectSubset<T, OrderItemCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a OrderItem.
     * @param {OrderItemDeleteArgs} args - Arguments to delete one OrderItem.
     * @example
     * // Delete one OrderItem
     * const OrderItem = await prisma.orderItem.delete({
     *   where: {
     *     // ... filter to delete one OrderItem
     *   }
     * })
     * 
     */
    delete<T extends OrderItemDeleteArgs>(args: SelectSubset<T, OrderItemDeleteArgs<ExtArgs>>): Prisma__OrderItemClient<$Result.GetResult<Prisma.$OrderItemPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one OrderItem.
     * @param {OrderItemUpdateArgs} args - Arguments to update one OrderItem.
     * @example
     * // Update one OrderItem
     * const orderItem = await prisma.orderItem.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends OrderItemUpdateArgs>(args: SelectSubset<T, OrderItemUpdateArgs<ExtArgs>>): Prisma__OrderItemClient<$Result.GetResult<Prisma.$OrderItemPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more OrderItems.
     * @param {OrderItemDeleteManyArgs} args - Arguments to filter OrderItems to delete.
     * @example
     * // Delete a few OrderItems
     * const { count } = await prisma.orderItem.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends OrderItemDeleteManyArgs>(args?: SelectSubset<T, OrderItemDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more OrderItems.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OrderItemUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many OrderItems
     * const orderItem = await prisma.orderItem.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends OrderItemUpdateManyArgs>(args: SelectSubset<T, OrderItemUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one OrderItem.
     * @param {OrderItemUpsertArgs} args - Arguments to update or create a OrderItem.
     * @example
     * // Update or create a OrderItem
     * const orderItem = await prisma.orderItem.upsert({
     *   create: {
     *     // ... data to create a OrderItem
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the OrderItem we want to update
     *   }
     * })
     */
    upsert<T extends OrderItemUpsertArgs>(args: SelectSubset<T, OrderItemUpsertArgs<ExtArgs>>): Prisma__OrderItemClient<$Result.GetResult<Prisma.$OrderItemPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of OrderItems.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OrderItemCountArgs} args - Arguments to filter OrderItems to count.
     * @example
     * // Count the number of OrderItems
     * const count = await prisma.orderItem.count({
     *   where: {
     *     // ... the filter for the OrderItems we want to count
     *   }
     * })
    **/
    count<T extends OrderItemCountArgs>(
      args?: Subset<T, OrderItemCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], OrderItemCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a OrderItem.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OrderItemAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends OrderItemAggregateArgs>(args: Subset<T, OrderItemAggregateArgs>): Prisma.PrismaPromise<GetOrderItemAggregateType<T>>

    /**
     * Group by OrderItem.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OrderItemGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends OrderItemGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: OrderItemGroupByArgs['orderBy'] }
        : { orderBy?: OrderItemGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, OrderItemGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetOrderItemGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the OrderItem model
   */
  readonly fields: OrderItemFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for OrderItem.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__OrderItemClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    order<T extends OrderDefaultArgs<ExtArgs> = {}>(args?: Subset<T, OrderDefaultArgs<ExtArgs>>): Prisma__OrderClient<$Result.GetResult<Prisma.$OrderPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
    product<T extends ProductMetaDefaultArgs<ExtArgs> = {}>(args?: Subset<T, ProductMetaDefaultArgs<ExtArgs>>): Prisma__ProductMetaClient<$Result.GetResult<Prisma.$ProductMetaPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the OrderItem model
   */ 
  interface OrderItemFieldRefs {
    readonly id: FieldRef<"OrderItem", 'Int'>
    readonly orderId: FieldRef<"OrderItem", 'Int'>
    readonly productId: FieldRef<"OrderItem", 'Int'>
    readonly qty: FieldRef<"OrderItem", 'Int'>
    readonly warehouse: FieldRef<"OrderItem", 'Warehouse'>
    readonly pickedAt: FieldRef<"OrderItem", 'DateTime'>
    readonly packedAt: FieldRef<"OrderItem", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * OrderItem findUnique
   */
  export type OrderItemFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrderItem
     */
    select?: OrderItemSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrderItemInclude<ExtArgs> | null
    /**
     * Filter, which OrderItem to fetch.
     */
    where: OrderItemWhereUniqueInput
  }

  /**
   * OrderItem findUniqueOrThrow
   */
  export type OrderItemFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrderItem
     */
    select?: OrderItemSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrderItemInclude<ExtArgs> | null
    /**
     * Filter, which OrderItem to fetch.
     */
    where: OrderItemWhereUniqueInput
  }

  /**
   * OrderItem findFirst
   */
  export type OrderItemFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrderItem
     */
    select?: OrderItemSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrderItemInclude<ExtArgs> | null
    /**
     * Filter, which OrderItem to fetch.
     */
    where?: OrderItemWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of OrderItems to fetch.
     */
    orderBy?: OrderItemOrderByWithRelationInput | OrderItemOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for OrderItems.
     */
    cursor?: OrderItemWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` OrderItems from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` OrderItems.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of OrderItems.
     */
    distinct?: OrderItemScalarFieldEnum | OrderItemScalarFieldEnum[]
  }

  /**
   * OrderItem findFirstOrThrow
   */
  export type OrderItemFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrderItem
     */
    select?: OrderItemSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrderItemInclude<ExtArgs> | null
    /**
     * Filter, which OrderItem to fetch.
     */
    where?: OrderItemWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of OrderItems to fetch.
     */
    orderBy?: OrderItemOrderByWithRelationInput | OrderItemOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for OrderItems.
     */
    cursor?: OrderItemWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` OrderItems from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` OrderItems.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of OrderItems.
     */
    distinct?: OrderItemScalarFieldEnum | OrderItemScalarFieldEnum[]
  }

  /**
   * OrderItem findMany
   */
  export type OrderItemFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrderItem
     */
    select?: OrderItemSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrderItemInclude<ExtArgs> | null
    /**
     * Filter, which OrderItems to fetch.
     */
    where?: OrderItemWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of OrderItems to fetch.
     */
    orderBy?: OrderItemOrderByWithRelationInput | OrderItemOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing OrderItems.
     */
    cursor?: OrderItemWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` OrderItems from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` OrderItems.
     */
    skip?: number
    distinct?: OrderItemScalarFieldEnum | OrderItemScalarFieldEnum[]
  }

  /**
   * OrderItem create
   */
  export type OrderItemCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrderItem
     */
    select?: OrderItemSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrderItemInclude<ExtArgs> | null
    /**
     * The data needed to create a OrderItem.
     */
    data: XOR<OrderItemCreateInput, OrderItemUncheckedCreateInput>
  }

  /**
   * OrderItem createMany
   */
  export type OrderItemCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many OrderItems.
     */
    data: OrderItemCreateManyInput | OrderItemCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * OrderItem update
   */
  export type OrderItemUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrderItem
     */
    select?: OrderItemSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrderItemInclude<ExtArgs> | null
    /**
     * The data needed to update a OrderItem.
     */
    data: XOR<OrderItemUpdateInput, OrderItemUncheckedUpdateInput>
    /**
     * Choose, which OrderItem to update.
     */
    where: OrderItemWhereUniqueInput
  }

  /**
   * OrderItem updateMany
   */
  export type OrderItemUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update OrderItems.
     */
    data: XOR<OrderItemUpdateManyMutationInput, OrderItemUncheckedUpdateManyInput>
    /**
     * Filter which OrderItems to update
     */
    where?: OrderItemWhereInput
  }

  /**
   * OrderItem upsert
   */
  export type OrderItemUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrderItem
     */
    select?: OrderItemSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrderItemInclude<ExtArgs> | null
    /**
     * The filter to search for the OrderItem to update in case it exists.
     */
    where: OrderItemWhereUniqueInput
    /**
     * In case the OrderItem found by the `where` argument doesn't exist, create a new OrderItem with this data.
     */
    create: XOR<OrderItemCreateInput, OrderItemUncheckedCreateInput>
    /**
     * In case the OrderItem was found with the provided `where` argument, update it with this data.
     */
    update: XOR<OrderItemUpdateInput, OrderItemUncheckedUpdateInput>
  }

  /**
   * OrderItem delete
   */
  export type OrderItemDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrderItem
     */
    select?: OrderItemSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrderItemInclude<ExtArgs> | null
    /**
     * Filter which OrderItem to delete.
     */
    where: OrderItemWhereUniqueInput
  }

  /**
   * OrderItem deleteMany
   */
  export type OrderItemDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which OrderItems to delete
     */
    where?: OrderItemWhereInput
  }

  /**
   * OrderItem without action
   */
  export type OrderItemDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrderItem
     */
    select?: OrderItemSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrderItemInclude<ExtArgs> | null
  }


  /**
   * Model Sequence
   */

  export type AggregateSequence = {
    _count: SequenceCountAggregateOutputType | null
    _avg: SequenceAvgAggregateOutputType | null
    _sum: SequenceSumAggregateOutputType | null
    _min: SequenceMinAggregateOutputType | null
    _max: SequenceMaxAggregateOutputType | null
  }

  export type SequenceAvgAggregateOutputType = {
    id: number | null
    createdById: number | null
    expectedBags: number | null
    actualBags: number | null
  }

  export type SequenceSumAggregateOutputType = {
    id: number | null
    createdById: number | null
    expectedBags: number | null
    actualBags: number | null
  }

  export type SequenceMinAggregateOutputType = {
    id: number | null
    mode: string | null
    createdById: number | null
    createdAt: Date | null
    closedAt: Date | null
    b1ClosedAt: Date | null
    b2ClosedAt: Date | null
    expectedBags: number | null
    actualBags: number | null
    status: $Enums.SequenceStatus | null
  }

  export type SequenceMaxAggregateOutputType = {
    id: number | null
    mode: string | null
    createdById: number | null
    createdAt: Date | null
    closedAt: Date | null
    b1ClosedAt: Date | null
    b2ClosedAt: Date | null
    expectedBags: number | null
    actualBags: number | null
    status: $Enums.SequenceStatus | null
  }

  export type SequenceCountAggregateOutputType = {
    id: number
    mode: number
    createdById: number
    createdAt: number
    closedAt: number
    b1ClosedAt: number
    b2ClosedAt: number
    expectedBags: number
    actualBags: number
    status: number
    _all: number
  }


  export type SequenceAvgAggregateInputType = {
    id?: true
    createdById?: true
    expectedBags?: true
    actualBags?: true
  }

  export type SequenceSumAggregateInputType = {
    id?: true
    createdById?: true
    expectedBags?: true
    actualBags?: true
  }

  export type SequenceMinAggregateInputType = {
    id?: true
    mode?: true
    createdById?: true
    createdAt?: true
    closedAt?: true
    b1ClosedAt?: true
    b2ClosedAt?: true
    expectedBags?: true
    actualBags?: true
    status?: true
  }

  export type SequenceMaxAggregateInputType = {
    id?: true
    mode?: true
    createdById?: true
    createdAt?: true
    closedAt?: true
    b1ClosedAt?: true
    b2ClosedAt?: true
    expectedBags?: true
    actualBags?: true
    status?: true
  }

  export type SequenceCountAggregateInputType = {
    id?: true
    mode?: true
    createdById?: true
    createdAt?: true
    closedAt?: true
    b1ClosedAt?: true
    b2ClosedAt?: true
    expectedBags?: true
    actualBags?: true
    status?: true
    _all?: true
  }

  export type SequenceAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Sequence to aggregate.
     */
    where?: SequenceWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Sequences to fetch.
     */
    orderBy?: SequenceOrderByWithRelationInput | SequenceOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: SequenceWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Sequences from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Sequences.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Sequences
    **/
    _count?: true | SequenceCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: SequenceAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: SequenceSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: SequenceMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: SequenceMaxAggregateInputType
  }

  export type GetSequenceAggregateType<T extends SequenceAggregateArgs> = {
        [P in keyof T & keyof AggregateSequence]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateSequence[P]>
      : GetScalarType<T[P], AggregateSequence[P]>
  }




  export type SequenceGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: SequenceWhereInput
    orderBy?: SequenceOrderByWithAggregationInput | SequenceOrderByWithAggregationInput[]
    by: SequenceScalarFieldEnum[] | SequenceScalarFieldEnum
    having?: SequenceScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: SequenceCountAggregateInputType | true
    _avg?: SequenceAvgAggregateInputType
    _sum?: SequenceSumAggregateInputType
    _min?: SequenceMinAggregateInputType
    _max?: SequenceMaxAggregateInputType
  }

  export type SequenceGroupByOutputType = {
    id: number
    mode: string
    createdById: number
    createdAt: Date
    closedAt: Date | null
    b1ClosedAt: Date | null
    b2ClosedAt: Date | null
    expectedBags: number
    actualBags: number
    status: $Enums.SequenceStatus
    _count: SequenceCountAggregateOutputType | null
    _avg: SequenceAvgAggregateOutputType | null
    _sum: SequenceSumAggregateOutputType | null
    _min: SequenceMinAggregateOutputType | null
    _max: SequenceMaxAggregateOutputType | null
  }

  type GetSequenceGroupByPayload<T extends SequenceGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<SequenceGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof SequenceGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], SequenceGroupByOutputType[P]>
            : GetScalarType<T[P], SequenceGroupByOutputType[P]>
        }
      >
    >


  export type SequenceSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    mode?: boolean
    createdById?: boolean
    createdAt?: boolean
    closedAt?: boolean
    b1ClosedAt?: boolean
    b2ClosedAt?: boolean
    expectedBags?: boolean
    actualBags?: boolean
    status?: boolean
    createdBy?: boolean | UserMetaDefaultArgs<ExtArgs>
    orders?: boolean | Sequence$ordersArgs<ExtArgs>
    _count?: boolean | SequenceCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["sequence"]>


  export type SequenceSelectScalar = {
    id?: boolean
    mode?: boolean
    createdById?: boolean
    createdAt?: boolean
    closedAt?: boolean
    b1ClosedAt?: boolean
    b2ClosedAt?: boolean
    expectedBags?: boolean
    actualBags?: boolean
    status?: boolean
  }

  export type SequenceInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    createdBy?: boolean | UserMetaDefaultArgs<ExtArgs>
    orders?: boolean | Sequence$ordersArgs<ExtArgs>
    _count?: boolean | SequenceCountOutputTypeDefaultArgs<ExtArgs>
  }

  export type $SequencePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Sequence"
    objects: {
      createdBy: Prisma.$UserMetaPayload<ExtArgs>
      orders: Prisma.$SequenceOrderPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: number
      mode: string
      createdById: number
      createdAt: Date
      closedAt: Date | null
      b1ClosedAt: Date | null
      b2ClosedAt: Date | null
      expectedBags: number
      actualBags: number
      status: $Enums.SequenceStatus
    }, ExtArgs["result"]["sequence"]>
    composites: {}
  }

  type SequenceGetPayload<S extends boolean | null | undefined | SequenceDefaultArgs> = $Result.GetResult<Prisma.$SequencePayload, S>

  type SequenceCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<SequenceFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: SequenceCountAggregateInputType | true
    }

  export interface SequenceDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Sequence'], meta: { name: 'Sequence' } }
    /**
     * Find zero or one Sequence that matches the filter.
     * @param {SequenceFindUniqueArgs} args - Arguments to find a Sequence
     * @example
     * // Get one Sequence
     * const sequence = await prisma.sequence.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends SequenceFindUniqueArgs>(args: SelectSubset<T, SequenceFindUniqueArgs<ExtArgs>>): Prisma__SequenceClient<$Result.GetResult<Prisma.$SequencePayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one Sequence that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {SequenceFindUniqueOrThrowArgs} args - Arguments to find a Sequence
     * @example
     * // Get one Sequence
     * const sequence = await prisma.sequence.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends SequenceFindUniqueOrThrowArgs>(args: SelectSubset<T, SequenceFindUniqueOrThrowArgs<ExtArgs>>): Prisma__SequenceClient<$Result.GetResult<Prisma.$SequencePayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first Sequence that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SequenceFindFirstArgs} args - Arguments to find a Sequence
     * @example
     * // Get one Sequence
     * const sequence = await prisma.sequence.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends SequenceFindFirstArgs>(args?: SelectSubset<T, SequenceFindFirstArgs<ExtArgs>>): Prisma__SequenceClient<$Result.GetResult<Prisma.$SequencePayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first Sequence that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SequenceFindFirstOrThrowArgs} args - Arguments to find a Sequence
     * @example
     * // Get one Sequence
     * const sequence = await prisma.sequence.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends SequenceFindFirstOrThrowArgs>(args?: SelectSubset<T, SequenceFindFirstOrThrowArgs<ExtArgs>>): Prisma__SequenceClient<$Result.GetResult<Prisma.$SequencePayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more Sequences that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SequenceFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Sequences
     * const sequences = await prisma.sequence.findMany()
     * 
     * // Get first 10 Sequences
     * const sequences = await prisma.sequence.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const sequenceWithIdOnly = await prisma.sequence.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends SequenceFindManyArgs>(args?: SelectSubset<T, SequenceFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SequencePayload<ExtArgs>, T, "findMany">>

    /**
     * Create a Sequence.
     * @param {SequenceCreateArgs} args - Arguments to create a Sequence.
     * @example
     * // Create one Sequence
     * const Sequence = await prisma.sequence.create({
     *   data: {
     *     // ... data to create a Sequence
     *   }
     * })
     * 
     */
    create<T extends SequenceCreateArgs>(args: SelectSubset<T, SequenceCreateArgs<ExtArgs>>): Prisma__SequenceClient<$Result.GetResult<Prisma.$SequencePayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many Sequences.
     * @param {SequenceCreateManyArgs} args - Arguments to create many Sequences.
     * @example
     * // Create many Sequences
     * const sequence = await prisma.sequence.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends SequenceCreateManyArgs>(args?: SelectSubset<T, SequenceCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a Sequence.
     * @param {SequenceDeleteArgs} args - Arguments to delete one Sequence.
     * @example
     * // Delete one Sequence
     * const Sequence = await prisma.sequence.delete({
     *   where: {
     *     // ... filter to delete one Sequence
     *   }
     * })
     * 
     */
    delete<T extends SequenceDeleteArgs>(args: SelectSubset<T, SequenceDeleteArgs<ExtArgs>>): Prisma__SequenceClient<$Result.GetResult<Prisma.$SequencePayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one Sequence.
     * @param {SequenceUpdateArgs} args - Arguments to update one Sequence.
     * @example
     * // Update one Sequence
     * const sequence = await prisma.sequence.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends SequenceUpdateArgs>(args: SelectSubset<T, SequenceUpdateArgs<ExtArgs>>): Prisma__SequenceClient<$Result.GetResult<Prisma.$SequencePayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more Sequences.
     * @param {SequenceDeleteManyArgs} args - Arguments to filter Sequences to delete.
     * @example
     * // Delete a few Sequences
     * const { count } = await prisma.sequence.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends SequenceDeleteManyArgs>(args?: SelectSubset<T, SequenceDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Sequences.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SequenceUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Sequences
     * const sequence = await prisma.sequence.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends SequenceUpdateManyArgs>(args: SelectSubset<T, SequenceUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Sequence.
     * @param {SequenceUpsertArgs} args - Arguments to update or create a Sequence.
     * @example
     * // Update or create a Sequence
     * const sequence = await prisma.sequence.upsert({
     *   create: {
     *     // ... data to create a Sequence
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Sequence we want to update
     *   }
     * })
     */
    upsert<T extends SequenceUpsertArgs>(args: SelectSubset<T, SequenceUpsertArgs<ExtArgs>>): Prisma__SequenceClient<$Result.GetResult<Prisma.$SequencePayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of Sequences.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SequenceCountArgs} args - Arguments to filter Sequences to count.
     * @example
     * // Count the number of Sequences
     * const count = await prisma.sequence.count({
     *   where: {
     *     // ... the filter for the Sequences we want to count
     *   }
     * })
    **/
    count<T extends SequenceCountArgs>(
      args?: Subset<T, SequenceCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], SequenceCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Sequence.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SequenceAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends SequenceAggregateArgs>(args: Subset<T, SequenceAggregateArgs>): Prisma.PrismaPromise<GetSequenceAggregateType<T>>

    /**
     * Group by Sequence.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SequenceGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends SequenceGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: SequenceGroupByArgs['orderBy'] }
        : { orderBy?: SequenceGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, SequenceGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetSequenceGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Sequence model
   */
  readonly fields: SequenceFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Sequence.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__SequenceClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    createdBy<T extends UserMetaDefaultArgs<ExtArgs> = {}>(args?: Subset<T, UserMetaDefaultArgs<ExtArgs>>): Prisma__UserMetaClient<$Result.GetResult<Prisma.$UserMetaPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
    orders<T extends Sequence$ordersArgs<ExtArgs> = {}>(args?: Subset<T, Sequence$ordersArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SequenceOrderPayload<ExtArgs>, T, "findMany"> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Sequence model
   */ 
  interface SequenceFieldRefs {
    readonly id: FieldRef<"Sequence", 'Int'>
    readonly mode: FieldRef<"Sequence", 'String'>
    readonly createdById: FieldRef<"Sequence", 'Int'>
    readonly createdAt: FieldRef<"Sequence", 'DateTime'>
    readonly closedAt: FieldRef<"Sequence", 'DateTime'>
    readonly b1ClosedAt: FieldRef<"Sequence", 'DateTime'>
    readonly b2ClosedAt: FieldRef<"Sequence", 'DateTime'>
    readonly expectedBags: FieldRef<"Sequence", 'Int'>
    readonly actualBags: FieldRef<"Sequence", 'Int'>
    readonly status: FieldRef<"Sequence", 'SequenceStatus'>
  }
    

  // Custom InputTypes
  /**
   * Sequence findUnique
   */
  export type SequenceFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Sequence
     */
    select?: SequenceSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SequenceInclude<ExtArgs> | null
    /**
     * Filter, which Sequence to fetch.
     */
    where: SequenceWhereUniqueInput
  }

  /**
   * Sequence findUniqueOrThrow
   */
  export type SequenceFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Sequence
     */
    select?: SequenceSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SequenceInclude<ExtArgs> | null
    /**
     * Filter, which Sequence to fetch.
     */
    where: SequenceWhereUniqueInput
  }

  /**
   * Sequence findFirst
   */
  export type SequenceFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Sequence
     */
    select?: SequenceSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SequenceInclude<ExtArgs> | null
    /**
     * Filter, which Sequence to fetch.
     */
    where?: SequenceWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Sequences to fetch.
     */
    orderBy?: SequenceOrderByWithRelationInput | SequenceOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Sequences.
     */
    cursor?: SequenceWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Sequences from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Sequences.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Sequences.
     */
    distinct?: SequenceScalarFieldEnum | SequenceScalarFieldEnum[]
  }

  /**
   * Sequence findFirstOrThrow
   */
  export type SequenceFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Sequence
     */
    select?: SequenceSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SequenceInclude<ExtArgs> | null
    /**
     * Filter, which Sequence to fetch.
     */
    where?: SequenceWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Sequences to fetch.
     */
    orderBy?: SequenceOrderByWithRelationInput | SequenceOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Sequences.
     */
    cursor?: SequenceWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Sequences from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Sequences.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Sequences.
     */
    distinct?: SequenceScalarFieldEnum | SequenceScalarFieldEnum[]
  }

  /**
   * Sequence findMany
   */
  export type SequenceFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Sequence
     */
    select?: SequenceSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SequenceInclude<ExtArgs> | null
    /**
     * Filter, which Sequences to fetch.
     */
    where?: SequenceWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Sequences to fetch.
     */
    orderBy?: SequenceOrderByWithRelationInput | SequenceOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Sequences.
     */
    cursor?: SequenceWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Sequences from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Sequences.
     */
    skip?: number
    distinct?: SequenceScalarFieldEnum | SequenceScalarFieldEnum[]
  }

  /**
   * Sequence create
   */
  export type SequenceCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Sequence
     */
    select?: SequenceSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SequenceInclude<ExtArgs> | null
    /**
     * The data needed to create a Sequence.
     */
    data: XOR<SequenceCreateInput, SequenceUncheckedCreateInput>
  }

  /**
   * Sequence createMany
   */
  export type SequenceCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Sequences.
     */
    data: SequenceCreateManyInput | SequenceCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Sequence update
   */
  export type SequenceUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Sequence
     */
    select?: SequenceSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SequenceInclude<ExtArgs> | null
    /**
     * The data needed to update a Sequence.
     */
    data: XOR<SequenceUpdateInput, SequenceUncheckedUpdateInput>
    /**
     * Choose, which Sequence to update.
     */
    where: SequenceWhereUniqueInput
  }

  /**
   * Sequence updateMany
   */
  export type SequenceUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Sequences.
     */
    data: XOR<SequenceUpdateManyMutationInput, SequenceUncheckedUpdateManyInput>
    /**
     * Filter which Sequences to update
     */
    where?: SequenceWhereInput
  }

  /**
   * Sequence upsert
   */
  export type SequenceUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Sequence
     */
    select?: SequenceSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SequenceInclude<ExtArgs> | null
    /**
     * The filter to search for the Sequence to update in case it exists.
     */
    where: SequenceWhereUniqueInput
    /**
     * In case the Sequence found by the `where` argument doesn't exist, create a new Sequence with this data.
     */
    create: XOR<SequenceCreateInput, SequenceUncheckedCreateInput>
    /**
     * In case the Sequence was found with the provided `where` argument, update it with this data.
     */
    update: XOR<SequenceUpdateInput, SequenceUncheckedUpdateInput>
  }

  /**
   * Sequence delete
   */
  export type SequenceDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Sequence
     */
    select?: SequenceSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SequenceInclude<ExtArgs> | null
    /**
     * Filter which Sequence to delete.
     */
    where: SequenceWhereUniqueInput
  }

  /**
   * Sequence deleteMany
   */
  export type SequenceDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Sequences to delete
     */
    where?: SequenceWhereInput
  }

  /**
   * Sequence.orders
   */
  export type Sequence$ordersArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SequenceOrder
     */
    select?: SequenceOrderSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SequenceOrderInclude<ExtArgs> | null
    where?: SequenceOrderWhereInput
    orderBy?: SequenceOrderOrderByWithRelationInput | SequenceOrderOrderByWithRelationInput[]
    cursor?: SequenceOrderWhereUniqueInput
    take?: number
    skip?: number
    distinct?: SequenceOrderScalarFieldEnum | SequenceOrderScalarFieldEnum[]
  }

  /**
   * Sequence without action
   */
  export type SequenceDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Sequence
     */
    select?: SequenceSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SequenceInclude<ExtArgs> | null
  }


  /**
   * Model SequenceOrder
   */

  export type AggregateSequenceOrder = {
    _count: SequenceOrderCountAggregateOutputType | null
    _avg: SequenceOrderAvgAggregateOutputType | null
    _sum: SequenceOrderSumAggregateOutputType | null
    _min: SequenceOrderMinAggregateOutputType | null
    _max: SequenceOrderMaxAggregateOutputType | null
  }

  export type SequenceOrderAvgAggregateOutputType = {
    sequenceId: number | null
    orderId: number | null
  }

  export type SequenceOrderSumAggregateOutputType = {
    sequenceId: number | null
    orderId: number | null
  }

  export type SequenceOrderMinAggregateOutputType = {
    sequenceId: number | null
    orderId: number | null
  }

  export type SequenceOrderMaxAggregateOutputType = {
    sequenceId: number | null
    orderId: number | null
  }

  export type SequenceOrderCountAggregateOutputType = {
    sequenceId: number
    orderId: number
    _all: number
  }


  export type SequenceOrderAvgAggregateInputType = {
    sequenceId?: true
    orderId?: true
  }

  export type SequenceOrderSumAggregateInputType = {
    sequenceId?: true
    orderId?: true
  }

  export type SequenceOrderMinAggregateInputType = {
    sequenceId?: true
    orderId?: true
  }

  export type SequenceOrderMaxAggregateInputType = {
    sequenceId?: true
    orderId?: true
  }

  export type SequenceOrderCountAggregateInputType = {
    sequenceId?: true
    orderId?: true
    _all?: true
  }

  export type SequenceOrderAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which SequenceOrder to aggregate.
     */
    where?: SequenceOrderWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of SequenceOrders to fetch.
     */
    orderBy?: SequenceOrderOrderByWithRelationInput | SequenceOrderOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: SequenceOrderWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` SequenceOrders from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` SequenceOrders.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned SequenceOrders
    **/
    _count?: true | SequenceOrderCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: SequenceOrderAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: SequenceOrderSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: SequenceOrderMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: SequenceOrderMaxAggregateInputType
  }

  export type GetSequenceOrderAggregateType<T extends SequenceOrderAggregateArgs> = {
        [P in keyof T & keyof AggregateSequenceOrder]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateSequenceOrder[P]>
      : GetScalarType<T[P], AggregateSequenceOrder[P]>
  }




  export type SequenceOrderGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: SequenceOrderWhereInput
    orderBy?: SequenceOrderOrderByWithAggregationInput | SequenceOrderOrderByWithAggregationInput[]
    by: SequenceOrderScalarFieldEnum[] | SequenceOrderScalarFieldEnum
    having?: SequenceOrderScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: SequenceOrderCountAggregateInputType | true
    _avg?: SequenceOrderAvgAggregateInputType
    _sum?: SequenceOrderSumAggregateInputType
    _min?: SequenceOrderMinAggregateInputType
    _max?: SequenceOrderMaxAggregateInputType
  }

  export type SequenceOrderGroupByOutputType = {
    sequenceId: number
    orderId: number
    _count: SequenceOrderCountAggregateOutputType | null
    _avg: SequenceOrderAvgAggregateOutputType | null
    _sum: SequenceOrderSumAggregateOutputType | null
    _min: SequenceOrderMinAggregateOutputType | null
    _max: SequenceOrderMaxAggregateOutputType | null
  }

  type GetSequenceOrderGroupByPayload<T extends SequenceOrderGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<SequenceOrderGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof SequenceOrderGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], SequenceOrderGroupByOutputType[P]>
            : GetScalarType<T[P], SequenceOrderGroupByOutputType[P]>
        }
      >
    >


  export type SequenceOrderSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    sequenceId?: boolean
    orderId?: boolean
    sequence?: boolean | SequenceDefaultArgs<ExtArgs>
    order?: boolean | OrderDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["sequenceOrder"]>


  export type SequenceOrderSelectScalar = {
    sequenceId?: boolean
    orderId?: boolean
  }

  export type SequenceOrderInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    sequence?: boolean | SequenceDefaultArgs<ExtArgs>
    order?: boolean | OrderDefaultArgs<ExtArgs>
  }

  export type $SequenceOrderPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "SequenceOrder"
    objects: {
      sequence: Prisma.$SequencePayload<ExtArgs>
      order: Prisma.$OrderPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      sequenceId: number
      orderId: number
    }, ExtArgs["result"]["sequenceOrder"]>
    composites: {}
  }

  type SequenceOrderGetPayload<S extends boolean | null | undefined | SequenceOrderDefaultArgs> = $Result.GetResult<Prisma.$SequenceOrderPayload, S>

  type SequenceOrderCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<SequenceOrderFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: SequenceOrderCountAggregateInputType | true
    }

  export interface SequenceOrderDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['SequenceOrder'], meta: { name: 'SequenceOrder' } }
    /**
     * Find zero or one SequenceOrder that matches the filter.
     * @param {SequenceOrderFindUniqueArgs} args - Arguments to find a SequenceOrder
     * @example
     * // Get one SequenceOrder
     * const sequenceOrder = await prisma.sequenceOrder.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends SequenceOrderFindUniqueArgs>(args: SelectSubset<T, SequenceOrderFindUniqueArgs<ExtArgs>>): Prisma__SequenceOrderClient<$Result.GetResult<Prisma.$SequenceOrderPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one SequenceOrder that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {SequenceOrderFindUniqueOrThrowArgs} args - Arguments to find a SequenceOrder
     * @example
     * // Get one SequenceOrder
     * const sequenceOrder = await prisma.sequenceOrder.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends SequenceOrderFindUniqueOrThrowArgs>(args: SelectSubset<T, SequenceOrderFindUniqueOrThrowArgs<ExtArgs>>): Prisma__SequenceOrderClient<$Result.GetResult<Prisma.$SequenceOrderPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first SequenceOrder that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SequenceOrderFindFirstArgs} args - Arguments to find a SequenceOrder
     * @example
     * // Get one SequenceOrder
     * const sequenceOrder = await prisma.sequenceOrder.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends SequenceOrderFindFirstArgs>(args?: SelectSubset<T, SequenceOrderFindFirstArgs<ExtArgs>>): Prisma__SequenceOrderClient<$Result.GetResult<Prisma.$SequenceOrderPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first SequenceOrder that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SequenceOrderFindFirstOrThrowArgs} args - Arguments to find a SequenceOrder
     * @example
     * // Get one SequenceOrder
     * const sequenceOrder = await prisma.sequenceOrder.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends SequenceOrderFindFirstOrThrowArgs>(args?: SelectSubset<T, SequenceOrderFindFirstOrThrowArgs<ExtArgs>>): Prisma__SequenceOrderClient<$Result.GetResult<Prisma.$SequenceOrderPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more SequenceOrders that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SequenceOrderFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all SequenceOrders
     * const sequenceOrders = await prisma.sequenceOrder.findMany()
     * 
     * // Get first 10 SequenceOrders
     * const sequenceOrders = await prisma.sequenceOrder.findMany({ take: 10 })
     * 
     * // Only select the `sequenceId`
     * const sequenceOrderWithSequenceIdOnly = await prisma.sequenceOrder.findMany({ select: { sequenceId: true } })
     * 
     */
    findMany<T extends SequenceOrderFindManyArgs>(args?: SelectSubset<T, SequenceOrderFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SequenceOrderPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a SequenceOrder.
     * @param {SequenceOrderCreateArgs} args - Arguments to create a SequenceOrder.
     * @example
     * // Create one SequenceOrder
     * const SequenceOrder = await prisma.sequenceOrder.create({
     *   data: {
     *     // ... data to create a SequenceOrder
     *   }
     * })
     * 
     */
    create<T extends SequenceOrderCreateArgs>(args: SelectSubset<T, SequenceOrderCreateArgs<ExtArgs>>): Prisma__SequenceOrderClient<$Result.GetResult<Prisma.$SequenceOrderPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many SequenceOrders.
     * @param {SequenceOrderCreateManyArgs} args - Arguments to create many SequenceOrders.
     * @example
     * // Create many SequenceOrders
     * const sequenceOrder = await prisma.sequenceOrder.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends SequenceOrderCreateManyArgs>(args?: SelectSubset<T, SequenceOrderCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a SequenceOrder.
     * @param {SequenceOrderDeleteArgs} args - Arguments to delete one SequenceOrder.
     * @example
     * // Delete one SequenceOrder
     * const SequenceOrder = await prisma.sequenceOrder.delete({
     *   where: {
     *     // ... filter to delete one SequenceOrder
     *   }
     * })
     * 
     */
    delete<T extends SequenceOrderDeleteArgs>(args: SelectSubset<T, SequenceOrderDeleteArgs<ExtArgs>>): Prisma__SequenceOrderClient<$Result.GetResult<Prisma.$SequenceOrderPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one SequenceOrder.
     * @param {SequenceOrderUpdateArgs} args - Arguments to update one SequenceOrder.
     * @example
     * // Update one SequenceOrder
     * const sequenceOrder = await prisma.sequenceOrder.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends SequenceOrderUpdateArgs>(args: SelectSubset<T, SequenceOrderUpdateArgs<ExtArgs>>): Prisma__SequenceOrderClient<$Result.GetResult<Prisma.$SequenceOrderPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more SequenceOrders.
     * @param {SequenceOrderDeleteManyArgs} args - Arguments to filter SequenceOrders to delete.
     * @example
     * // Delete a few SequenceOrders
     * const { count } = await prisma.sequenceOrder.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends SequenceOrderDeleteManyArgs>(args?: SelectSubset<T, SequenceOrderDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more SequenceOrders.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SequenceOrderUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many SequenceOrders
     * const sequenceOrder = await prisma.sequenceOrder.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends SequenceOrderUpdateManyArgs>(args: SelectSubset<T, SequenceOrderUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one SequenceOrder.
     * @param {SequenceOrderUpsertArgs} args - Arguments to update or create a SequenceOrder.
     * @example
     * // Update or create a SequenceOrder
     * const sequenceOrder = await prisma.sequenceOrder.upsert({
     *   create: {
     *     // ... data to create a SequenceOrder
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the SequenceOrder we want to update
     *   }
     * })
     */
    upsert<T extends SequenceOrderUpsertArgs>(args: SelectSubset<T, SequenceOrderUpsertArgs<ExtArgs>>): Prisma__SequenceOrderClient<$Result.GetResult<Prisma.$SequenceOrderPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of SequenceOrders.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SequenceOrderCountArgs} args - Arguments to filter SequenceOrders to count.
     * @example
     * // Count the number of SequenceOrders
     * const count = await prisma.sequenceOrder.count({
     *   where: {
     *     // ... the filter for the SequenceOrders we want to count
     *   }
     * })
    **/
    count<T extends SequenceOrderCountArgs>(
      args?: Subset<T, SequenceOrderCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], SequenceOrderCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a SequenceOrder.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SequenceOrderAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends SequenceOrderAggregateArgs>(args: Subset<T, SequenceOrderAggregateArgs>): Prisma.PrismaPromise<GetSequenceOrderAggregateType<T>>

    /**
     * Group by SequenceOrder.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SequenceOrderGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends SequenceOrderGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: SequenceOrderGroupByArgs['orderBy'] }
        : { orderBy?: SequenceOrderGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, SequenceOrderGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetSequenceOrderGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the SequenceOrder model
   */
  readonly fields: SequenceOrderFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for SequenceOrder.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__SequenceOrderClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    sequence<T extends SequenceDefaultArgs<ExtArgs> = {}>(args?: Subset<T, SequenceDefaultArgs<ExtArgs>>): Prisma__SequenceClient<$Result.GetResult<Prisma.$SequencePayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
    order<T extends OrderDefaultArgs<ExtArgs> = {}>(args?: Subset<T, OrderDefaultArgs<ExtArgs>>): Prisma__OrderClient<$Result.GetResult<Prisma.$OrderPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the SequenceOrder model
   */ 
  interface SequenceOrderFieldRefs {
    readonly sequenceId: FieldRef<"SequenceOrder", 'Int'>
    readonly orderId: FieldRef<"SequenceOrder", 'Int'>
  }
    

  // Custom InputTypes
  /**
   * SequenceOrder findUnique
   */
  export type SequenceOrderFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SequenceOrder
     */
    select?: SequenceOrderSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SequenceOrderInclude<ExtArgs> | null
    /**
     * Filter, which SequenceOrder to fetch.
     */
    where: SequenceOrderWhereUniqueInput
  }

  /**
   * SequenceOrder findUniqueOrThrow
   */
  export type SequenceOrderFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SequenceOrder
     */
    select?: SequenceOrderSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SequenceOrderInclude<ExtArgs> | null
    /**
     * Filter, which SequenceOrder to fetch.
     */
    where: SequenceOrderWhereUniqueInput
  }

  /**
   * SequenceOrder findFirst
   */
  export type SequenceOrderFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SequenceOrder
     */
    select?: SequenceOrderSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SequenceOrderInclude<ExtArgs> | null
    /**
     * Filter, which SequenceOrder to fetch.
     */
    where?: SequenceOrderWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of SequenceOrders to fetch.
     */
    orderBy?: SequenceOrderOrderByWithRelationInput | SequenceOrderOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for SequenceOrders.
     */
    cursor?: SequenceOrderWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` SequenceOrders from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` SequenceOrders.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of SequenceOrders.
     */
    distinct?: SequenceOrderScalarFieldEnum | SequenceOrderScalarFieldEnum[]
  }

  /**
   * SequenceOrder findFirstOrThrow
   */
  export type SequenceOrderFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SequenceOrder
     */
    select?: SequenceOrderSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SequenceOrderInclude<ExtArgs> | null
    /**
     * Filter, which SequenceOrder to fetch.
     */
    where?: SequenceOrderWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of SequenceOrders to fetch.
     */
    orderBy?: SequenceOrderOrderByWithRelationInput | SequenceOrderOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for SequenceOrders.
     */
    cursor?: SequenceOrderWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` SequenceOrders from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` SequenceOrders.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of SequenceOrders.
     */
    distinct?: SequenceOrderScalarFieldEnum | SequenceOrderScalarFieldEnum[]
  }

  /**
   * SequenceOrder findMany
   */
  export type SequenceOrderFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SequenceOrder
     */
    select?: SequenceOrderSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SequenceOrderInclude<ExtArgs> | null
    /**
     * Filter, which SequenceOrders to fetch.
     */
    where?: SequenceOrderWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of SequenceOrders to fetch.
     */
    orderBy?: SequenceOrderOrderByWithRelationInput | SequenceOrderOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing SequenceOrders.
     */
    cursor?: SequenceOrderWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` SequenceOrders from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` SequenceOrders.
     */
    skip?: number
    distinct?: SequenceOrderScalarFieldEnum | SequenceOrderScalarFieldEnum[]
  }

  /**
   * SequenceOrder create
   */
  export type SequenceOrderCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SequenceOrder
     */
    select?: SequenceOrderSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SequenceOrderInclude<ExtArgs> | null
    /**
     * The data needed to create a SequenceOrder.
     */
    data: XOR<SequenceOrderCreateInput, SequenceOrderUncheckedCreateInput>
  }

  /**
   * SequenceOrder createMany
   */
  export type SequenceOrderCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many SequenceOrders.
     */
    data: SequenceOrderCreateManyInput | SequenceOrderCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * SequenceOrder update
   */
  export type SequenceOrderUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SequenceOrder
     */
    select?: SequenceOrderSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SequenceOrderInclude<ExtArgs> | null
    /**
     * The data needed to update a SequenceOrder.
     */
    data: XOR<SequenceOrderUpdateInput, SequenceOrderUncheckedUpdateInput>
    /**
     * Choose, which SequenceOrder to update.
     */
    where: SequenceOrderWhereUniqueInput
  }

  /**
   * SequenceOrder updateMany
   */
  export type SequenceOrderUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update SequenceOrders.
     */
    data: XOR<SequenceOrderUpdateManyMutationInput, SequenceOrderUncheckedUpdateManyInput>
    /**
     * Filter which SequenceOrders to update
     */
    where?: SequenceOrderWhereInput
  }

  /**
   * SequenceOrder upsert
   */
  export type SequenceOrderUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SequenceOrder
     */
    select?: SequenceOrderSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SequenceOrderInclude<ExtArgs> | null
    /**
     * The filter to search for the SequenceOrder to update in case it exists.
     */
    where: SequenceOrderWhereUniqueInput
    /**
     * In case the SequenceOrder found by the `where` argument doesn't exist, create a new SequenceOrder with this data.
     */
    create: XOR<SequenceOrderCreateInput, SequenceOrderUncheckedCreateInput>
    /**
     * In case the SequenceOrder was found with the provided `where` argument, update it with this data.
     */
    update: XOR<SequenceOrderUpdateInput, SequenceOrderUncheckedUpdateInput>
  }

  /**
   * SequenceOrder delete
   */
  export type SequenceOrderDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SequenceOrder
     */
    select?: SequenceOrderSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SequenceOrderInclude<ExtArgs> | null
    /**
     * Filter which SequenceOrder to delete.
     */
    where: SequenceOrderWhereUniqueInput
  }

  /**
   * SequenceOrder deleteMany
   */
  export type SequenceOrderDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which SequenceOrders to delete
     */
    where?: SequenceOrderWhereInput
  }

  /**
   * SequenceOrder without action
   */
  export type SequenceOrderDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SequenceOrder
     */
    select?: SequenceOrderSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SequenceOrderInclude<ExtArgs> | null
  }


  /**
   * Model Event
   */

  export type AggregateEvent = {
    _count: EventCountAggregateOutputType | null
    _avg: EventAvgAggregateOutputType | null
    _sum: EventSumAggregateOutputType | null
    _min: EventMinAggregateOutputType | null
    _max: EventMaxAggregateOutputType | null
  }

  export type EventAvgAggregateOutputType = {
    id: number | null
    actorId: number | null
    orderId: number | null
  }

  export type EventSumAggregateOutputType = {
    id: number | null
    actorId: number | null
    orderId: number | null
  }

  export type EventMinAggregateOutputType = {
    id: number | null
    type: string | null
    actorId: number | null
    orderId: number | null
    createdAt: Date | null
  }

  export type EventMaxAggregateOutputType = {
    id: number | null
    type: string | null
    actorId: number | null
    orderId: number | null
    createdAt: Date | null
  }

  export type EventCountAggregateOutputType = {
    id: number
    type: number
    actorId: number
    orderId: number
    payload: number
    createdAt: number
    _all: number
  }


  export type EventAvgAggregateInputType = {
    id?: true
    actorId?: true
    orderId?: true
  }

  export type EventSumAggregateInputType = {
    id?: true
    actorId?: true
    orderId?: true
  }

  export type EventMinAggregateInputType = {
    id?: true
    type?: true
    actorId?: true
    orderId?: true
    createdAt?: true
  }

  export type EventMaxAggregateInputType = {
    id?: true
    type?: true
    actorId?: true
    orderId?: true
    createdAt?: true
  }

  export type EventCountAggregateInputType = {
    id?: true
    type?: true
    actorId?: true
    orderId?: true
    payload?: true
    createdAt?: true
    _all?: true
  }

  export type EventAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Event to aggregate.
     */
    where?: EventWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Events to fetch.
     */
    orderBy?: EventOrderByWithRelationInput | EventOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: EventWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Events from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Events.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Events
    **/
    _count?: true | EventCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: EventAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: EventSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: EventMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: EventMaxAggregateInputType
  }

  export type GetEventAggregateType<T extends EventAggregateArgs> = {
        [P in keyof T & keyof AggregateEvent]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateEvent[P]>
      : GetScalarType<T[P], AggregateEvent[P]>
  }




  export type EventGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: EventWhereInput
    orderBy?: EventOrderByWithAggregationInput | EventOrderByWithAggregationInput[]
    by: EventScalarFieldEnum[] | EventScalarFieldEnum
    having?: EventScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: EventCountAggregateInputType | true
    _avg?: EventAvgAggregateInputType
    _sum?: EventSumAggregateInputType
    _min?: EventMinAggregateInputType
    _max?: EventMaxAggregateInputType
  }

  export type EventGroupByOutputType = {
    id: number
    type: string
    actorId: number | null
    orderId: number | null
    payload: JsonValue | null
    createdAt: Date
    _count: EventCountAggregateOutputType | null
    _avg: EventAvgAggregateOutputType | null
    _sum: EventSumAggregateOutputType | null
    _min: EventMinAggregateOutputType | null
    _max: EventMaxAggregateOutputType | null
  }

  type GetEventGroupByPayload<T extends EventGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<EventGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof EventGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], EventGroupByOutputType[P]>
            : GetScalarType<T[P], EventGroupByOutputType[P]>
        }
      >
    >


  export type EventSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    type?: boolean
    actorId?: boolean
    orderId?: boolean
    payload?: boolean
    createdAt?: boolean
    actor?: boolean | Event$actorArgs<ExtArgs>
    order?: boolean | Event$orderArgs<ExtArgs>
  }, ExtArgs["result"]["event"]>


  export type EventSelectScalar = {
    id?: boolean
    type?: boolean
    actorId?: boolean
    orderId?: boolean
    payload?: boolean
    createdAt?: boolean
  }

  export type EventInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    actor?: boolean | Event$actorArgs<ExtArgs>
    order?: boolean | Event$orderArgs<ExtArgs>
  }

  export type $EventPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Event"
    objects: {
      actor: Prisma.$UserMetaPayload<ExtArgs> | null
      order: Prisma.$OrderPayload<ExtArgs> | null
    }
    scalars: $Extensions.GetPayloadResult<{
      id: number
      type: string
      actorId: number | null
      orderId: number | null
      payload: Prisma.JsonValue | null
      createdAt: Date
    }, ExtArgs["result"]["event"]>
    composites: {}
  }

  type EventGetPayload<S extends boolean | null | undefined | EventDefaultArgs> = $Result.GetResult<Prisma.$EventPayload, S>

  type EventCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<EventFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: EventCountAggregateInputType | true
    }

  export interface EventDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Event'], meta: { name: 'Event' } }
    /**
     * Find zero or one Event that matches the filter.
     * @param {EventFindUniqueArgs} args - Arguments to find a Event
     * @example
     * // Get one Event
     * const event = await prisma.event.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends EventFindUniqueArgs>(args: SelectSubset<T, EventFindUniqueArgs<ExtArgs>>): Prisma__EventClient<$Result.GetResult<Prisma.$EventPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one Event that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {EventFindUniqueOrThrowArgs} args - Arguments to find a Event
     * @example
     * // Get one Event
     * const event = await prisma.event.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends EventFindUniqueOrThrowArgs>(args: SelectSubset<T, EventFindUniqueOrThrowArgs<ExtArgs>>): Prisma__EventClient<$Result.GetResult<Prisma.$EventPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first Event that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {EventFindFirstArgs} args - Arguments to find a Event
     * @example
     * // Get one Event
     * const event = await prisma.event.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends EventFindFirstArgs>(args?: SelectSubset<T, EventFindFirstArgs<ExtArgs>>): Prisma__EventClient<$Result.GetResult<Prisma.$EventPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first Event that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {EventFindFirstOrThrowArgs} args - Arguments to find a Event
     * @example
     * // Get one Event
     * const event = await prisma.event.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends EventFindFirstOrThrowArgs>(args?: SelectSubset<T, EventFindFirstOrThrowArgs<ExtArgs>>): Prisma__EventClient<$Result.GetResult<Prisma.$EventPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more Events that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {EventFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Events
     * const events = await prisma.event.findMany()
     * 
     * // Get first 10 Events
     * const events = await prisma.event.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const eventWithIdOnly = await prisma.event.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends EventFindManyArgs>(args?: SelectSubset<T, EventFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$EventPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a Event.
     * @param {EventCreateArgs} args - Arguments to create a Event.
     * @example
     * // Create one Event
     * const Event = await prisma.event.create({
     *   data: {
     *     // ... data to create a Event
     *   }
     * })
     * 
     */
    create<T extends EventCreateArgs>(args: SelectSubset<T, EventCreateArgs<ExtArgs>>): Prisma__EventClient<$Result.GetResult<Prisma.$EventPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many Events.
     * @param {EventCreateManyArgs} args - Arguments to create many Events.
     * @example
     * // Create many Events
     * const event = await prisma.event.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends EventCreateManyArgs>(args?: SelectSubset<T, EventCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a Event.
     * @param {EventDeleteArgs} args - Arguments to delete one Event.
     * @example
     * // Delete one Event
     * const Event = await prisma.event.delete({
     *   where: {
     *     // ... filter to delete one Event
     *   }
     * })
     * 
     */
    delete<T extends EventDeleteArgs>(args: SelectSubset<T, EventDeleteArgs<ExtArgs>>): Prisma__EventClient<$Result.GetResult<Prisma.$EventPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one Event.
     * @param {EventUpdateArgs} args - Arguments to update one Event.
     * @example
     * // Update one Event
     * const event = await prisma.event.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends EventUpdateArgs>(args: SelectSubset<T, EventUpdateArgs<ExtArgs>>): Prisma__EventClient<$Result.GetResult<Prisma.$EventPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more Events.
     * @param {EventDeleteManyArgs} args - Arguments to filter Events to delete.
     * @example
     * // Delete a few Events
     * const { count } = await prisma.event.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends EventDeleteManyArgs>(args?: SelectSubset<T, EventDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Events.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {EventUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Events
     * const event = await prisma.event.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends EventUpdateManyArgs>(args: SelectSubset<T, EventUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Event.
     * @param {EventUpsertArgs} args - Arguments to update or create a Event.
     * @example
     * // Update or create a Event
     * const event = await prisma.event.upsert({
     *   create: {
     *     // ... data to create a Event
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Event we want to update
     *   }
     * })
     */
    upsert<T extends EventUpsertArgs>(args: SelectSubset<T, EventUpsertArgs<ExtArgs>>): Prisma__EventClient<$Result.GetResult<Prisma.$EventPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of Events.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {EventCountArgs} args - Arguments to filter Events to count.
     * @example
     * // Count the number of Events
     * const count = await prisma.event.count({
     *   where: {
     *     // ... the filter for the Events we want to count
     *   }
     * })
    **/
    count<T extends EventCountArgs>(
      args?: Subset<T, EventCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], EventCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Event.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {EventAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends EventAggregateArgs>(args: Subset<T, EventAggregateArgs>): Prisma.PrismaPromise<GetEventAggregateType<T>>

    /**
     * Group by Event.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {EventGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends EventGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: EventGroupByArgs['orderBy'] }
        : { orderBy?: EventGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, EventGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetEventGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Event model
   */
  readonly fields: EventFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Event.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__EventClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    actor<T extends Event$actorArgs<ExtArgs> = {}>(args?: Subset<T, Event$actorArgs<ExtArgs>>): Prisma__UserMetaClient<$Result.GetResult<Prisma.$UserMetaPayload<ExtArgs>, T, "findUniqueOrThrow"> | null, null, ExtArgs>
    order<T extends Event$orderArgs<ExtArgs> = {}>(args?: Subset<T, Event$orderArgs<ExtArgs>>): Prisma__OrderClient<$Result.GetResult<Prisma.$OrderPayload<ExtArgs>, T, "findUniqueOrThrow"> | null, null, ExtArgs>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Event model
   */ 
  interface EventFieldRefs {
    readonly id: FieldRef<"Event", 'Int'>
    readonly type: FieldRef<"Event", 'String'>
    readonly actorId: FieldRef<"Event", 'Int'>
    readonly orderId: FieldRef<"Event", 'Int'>
    readonly payload: FieldRef<"Event", 'Json'>
    readonly createdAt: FieldRef<"Event", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Event findUnique
   */
  export type EventFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Event
     */
    select?: EventSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EventInclude<ExtArgs> | null
    /**
     * Filter, which Event to fetch.
     */
    where: EventWhereUniqueInput
  }

  /**
   * Event findUniqueOrThrow
   */
  export type EventFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Event
     */
    select?: EventSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EventInclude<ExtArgs> | null
    /**
     * Filter, which Event to fetch.
     */
    where: EventWhereUniqueInput
  }

  /**
   * Event findFirst
   */
  export type EventFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Event
     */
    select?: EventSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EventInclude<ExtArgs> | null
    /**
     * Filter, which Event to fetch.
     */
    where?: EventWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Events to fetch.
     */
    orderBy?: EventOrderByWithRelationInput | EventOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Events.
     */
    cursor?: EventWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Events from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Events.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Events.
     */
    distinct?: EventScalarFieldEnum | EventScalarFieldEnum[]
  }

  /**
   * Event findFirstOrThrow
   */
  export type EventFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Event
     */
    select?: EventSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EventInclude<ExtArgs> | null
    /**
     * Filter, which Event to fetch.
     */
    where?: EventWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Events to fetch.
     */
    orderBy?: EventOrderByWithRelationInput | EventOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Events.
     */
    cursor?: EventWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Events from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Events.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Events.
     */
    distinct?: EventScalarFieldEnum | EventScalarFieldEnum[]
  }

  /**
   * Event findMany
   */
  export type EventFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Event
     */
    select?: EventSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EventInclude<ExtArgs> | null
    /**
     * Filter, which Events to fetch.
     */
    where?: EventWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Events to fetch.
     */
    orderBy?: EventOrderByWithRelationInput | EventOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Events.
     */
    cursor?: EventWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Events from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Events.
     */
    skip?: number
    distinct?: EventScalarFieldEnum | EventScalarFieldEnum[]
  }

  /**
   * Event create
   */
  export type EventCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Event
     */
    select?: EventSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EventInclude<ExtArgs> | null
    /**
     * The data needed to create a Event.
     */
    data: XOR<EventCreateInput, EventUncheckedCreateInput>
  }

  /**
   * Event createMany
   */
  export type EventCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Events.
     */
    data: EventCreateManyInput | EventCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Event update
   */
  export type EventUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Event
     */
    select?: EventSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EventInclude<ExtArgs> | null
    /**
     * The data needed to update a Event.
     */
    data: XOR<EventUpdateInput, EventUncheckedUpdateInput>
    /**
     * Choose, which Event to update.
     */
    where: EventWhereUniqueInput
  }

  /**
   * Event updateMany
   */
  export type EventUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Events.
     */
    data: XOR<EventUpdateManyMutationInput, EventUncheckedUpdateManyInput>
    /**
     * Filter which Events to update
     */
    where?: EventWhereInput
  }

  /**
   * Event upsert
   */
  export type EventUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Event
     */
    select?: EventSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EventInclude<ExtArgs> | null
    /**
     * The filter to search for the Event to update in case it exists.
     */
    where: EventWhereUniqueInput
    /**
     * In case the Event found by the `where` argument doesn't exist, create a new Event with this data.
     */
    create: XOR<EventCreateInput, EventUncheckedCreateInput>
    /**
     * In case the Event was found with the provided `where` argument, update it with this data.
     */
    update: XOR<EventUpdateInput, EventUncheckedUpdateInput>
  }

  /**
   * Event delete
   */
  export type EventDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Event
     */
    select?: EventSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EventInclude<ExtArgs> | null
    /**
     * Filter which Event to delete.
     */
    where: EventWhereUniqueInput
  }

  /**
   * Event deleteMany
   */
  export type EventDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Events to delete
     */
    where?: EventWhereInput
  }

  /**
   * Event.actor
   */
  export type Event$actorArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserMeta
     */
    select?: UserMetaSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserMetaInclude<ExtArgs> | null
    where?: UserMetaWhereInput
  }

  /**
   * Event.order
   */
  export type Event$orderArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Order
     */
    select?: OrderSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrderInclude<ExtArgs> | null
    where?: OrderWhereInput
  }

  /**
   * Event without action
   */
  export type EventDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Event
     */
    select?: EventSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EventInclude<ExtArgs> | null
  }


  /**
   * Enums
   */

  export const TransactionIsolationLevel: {
    ReadUncommitted: 'ReadUncommitted',
    ReadCommitted: 'ReadCommitted',
    RepeatableRead: 'RepeatableRead',
    Serializable: 'Serializable'
  };

  export type TransactionIsolationLevel = (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel]


  export const UserMetaScalarFieldEnum: {
    wpUserId: 'wpUserId',
    username: 'username',
    displayName: 'displayName',
    email: 'email',
    capabilities: 'capabilities',
    active: 'active',
    lastLoginAt: 'lastLoginAt',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type UserMetaScalarFieldEnum = (typeof UserMetaScalarFieldEnum)[keyof typeof UserMetaScalarFieldEnum]


  export const ProductMetaScalarFieldEnum: {
    wpProductId: 'wpProductId',
    sku: 'sku',
    name: 'name',
    warehouse: 'warehouse',
    thumbnailUrl: 'thumbnailUrl',
    syncedAt: 'syncedAt'
  };

  export type ProductMetaScalarFieldEnum = (typeof ProductMetaScalarFieldEnum)[keyof typeof ProductMetaScalarFieldEnum]


  export const OrderScalarFieldEnum: {
    id: 'id',
    wpOrderId: 'wpOrderId',
    number: 'number',
    status: 'status',
    route: 'route',
    stopPosition: 'stopPosition',
    customerName: 'customerName',
    customerAddress: 'customerAddress',
    hasB2Pending: 'hasB2Pending',
    bagsExpected: 'bagsExpected',
    packedById: 'packedById',
    packedAt: 'packedAt',
    classifiedAt: 'classifiedAt',
    loadedAt: 'loadedAt',
    deliveredAt: 'deliveredAt',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type OrderScalarFieldEnum = (typeof OrderScalarFieldEnum)[keyof typeof OrderScalarFieldEnum]


  export const OrderItemScalarFieldEnum: {
    id: 'id',
    orderId: 'orderId',
    productId: 'productId',
    qty: 'qty',
    warehouse: 'warehouse',
    pickedAt: 'pickedAt',
    packedAt: 'packedAt'
  };

  export type OrderItemScalarFieldEnum = (typeof OrderItemScalarFieldEnum)[keyof typeof OrderItemScalarFieldEnum]


  export const SequenceScalarFieldEnum: {
    id: 'id',
    mode: 'mode',
    createdById: 'createdById',
    createdAt: 'createdAt',
    closedAt: 'closedAt',
    b1ClosedAt: 'b1ClosedAt',
    b2ClosedAt: 'b2ClosedAt',
    expectedBags: 'expectedBags',
    actualBags: 'actualBags',
    status: 'status'
  };

  export type SequenceScalarFieldEnum = (typeof SequenceScalarFieldEnum)[keyof typeof SequenceScalarFieldEnum]


  export const SequenceOrderScalarFieldEnum: {
    sequenceId: 'sequenceId',
    orderId: 'orderId'
  };

  export type SequenceOrderScalarFieldEnum = (typeof SequenceOrderScalarFieldEnum)[keyof typeof SequenceOrderScalarFieldEnum]


  export const EventScalarFieldEnum: {
    id: 'id',
    type: 'type',
    actorId: 'actorId',
    orderId: 'orderId',
    payload: 'payload',
    createdAt: 'createdAt'
  };

  export type EventScalarFieldEnum = (typeof EventScalarFieldEnum)[keyof typeof EventScalarFieldEnum]


  export const SortOrder: {
    asc: 'asc',
    desc: 'desc'
  };

  export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder]


  export const JsonNullValueInput: {
    JsonNull: typeof JsonNull
  };

  export type JsonNullValueInput = (typeof JsonNullValueInput)[keyof typeof JsonNullValueInput]


  export const NullableJsonNullValueInput: {
    DbNull: typeof DbNull,
    JsonNull: typeof JsonNull
  };

  export type NullableJsonNullValueInput = (typeof NullableJsonNullValueInput)[keyof typeof NullableJsonNullValueInput]


  export const JsonNullValueFilter: {
    DbNull: typeof DbNull,
    JsonNull: typeof JsonNull,
    AnyNull: typeof AnyNull
  };

  export type JsonNullValueFilter = (typeof JsonNullValueFilter)[keyof typeof JsonNullValueFilter]


  export const NullsOrder: {
    first: 'first',
    last: 'last'
  };

  export type NullsOrder = (typeof NullsOrder)[keyof typeof NullsOrder]


  /**
   * Field references 
   */


  /**
   * Reference to a field of type 'Int'
   */
  export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int'>
    


  /**
   * Reference to a field of type 'String'
   */
  export type StringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String'>
    


  /**
   * Reference to a field of type 'Json'
   */
  export type JsonFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Json'>
    


  /**
   * Reference to a field of type 'Boolean'
   */
  export type BooleanFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Boolean'>
    


  /**
   * Reference to a field of type 'DateTime'
   */
  export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime'>
    


  /**
   * Reference to a field of type 'Warehouse'
   */
  export type EnumWarehouseFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Warehouse'>
    


  /**
   * Reference to a field of type 'OrderStatus'
   */
  export type EnumOrderStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'OrderStatus'>
    


  /**
   * Reference to a field of type 'SequenceStatus'
   */
  export type EnumSequenceStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'SequenceStatus'>
    


  /**
   * Reference to a field of type 'Float'
   */
  export type FloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float'>
    
  /**
   * Deep Input Types
   */


  export type UserMetaWhereInput = {
    AND?: UserMetaWhereInput | UserMetaWhereInput[]
    OR?: UserMetaWhereInput[]
    NOT?: UserMetaWhereInput | UserMetaWhereInput[]
    wpUserId?: IntFilter<"UserMeta"> | number
    username?: StringFilter<"UserMeta"> | string
    displayName?: StringFilter<"UserMeta"> | string
    email?: StringNullableFilter<"UserMeta"> | string | null
    capabilities?: JsonFilter<"UserMeta">
    active?: BoolFilter<"UserMeta"> | boolean
    lastLoginAt?: DateTimeNullableFilter<"UserMeta"> | Date | string | null
    createdAt?: DateTimeFilter<"UserMeta"> | Date | string
    updatedAt?: DateTimeFilter<"UserMeta"> | Date | string
    sequencesCreated?: SequenceListRelationFilter
    packedOrders?: OrderListRelationFilter
    events?: EventListRelationFilter
  }

  export type UserMetaOrderByWithRelationInput = {
    wpUserId?: SortOrder
    username?: SortOrder
    displayName?: SortOrder
    email?: SortOrderInput | SortOrder
    capabilities?: SortOrder
    active?: SortOrder
    lastLoginAt?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    sequencesCreated?: SequenceOrderByRelationAggregateInput
    packedOrders?: OrderOrderByRelationAggregateInput
    events?: EventOrderByRelationAggregateInput
  }

  export type UserMetaWhereUniqueInput = Prisma.AtLeast<{
    wpUserId?: number
    AND?: UserMetaWhereInput | UserMetaWhereInput[]
    OR?: UserMetaWhereInput[]
    NOT?: UserMetaWhereInput | UserMetaWhereInput[]
    username?: StringFilter<"UserMeta"> | string
    displayName?: StringFilter<"UserMeta"> | string
    email?: StringNullableFilter<"UserMeta"> | string | null
    capabilities?: JsonFilter<"UserMeta">
    active?: BoolFilter<"UserMeta"> | boolean
    lastLoginAt?: DateTimeNullableFilter<"UserMeta"> | Date | string | null
    createdAt?: DateTimeFilter<"UserMeta"> | Date | string
    updatedAt?: DateTimeFilter<"UserMeta"> | Date | string
    sequencesCreated?: SequenceListRelationFilter
    packedOrders?: OrderListRelationFilter
    events?: EventListRelationFilter
  }, "wpUserId">

  export type UserMetaOrderByWithAggregationInput = {
    wpUserId?: SortOrder
    username?: SortOrder
    displayName?: SortOrder
    email?: SortOrderInput | SortOrder
    capabilities?: SortOrder
    active?: SortOrder
    lastLoginAt?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: UserMetaCountOrderByAggregateInput
    _avg?: UserMetaAvgOrderByAggregateInput
    _max?: UserMetaMaxOrderByAggregateInput
    _min?: UserMetaMinOrderByAggregateInput
    _sum?: UserMetaSumOrderByAggregateInput
  }

  export type UserMetaScalarWhereWithAggregatesInput = {
    AND?: UserMetaScalarWhereWithAggregatesInput | UserMetaScalarWhereWithAggregatesInput[]
    OR?: UserMetaScalarWhereWithAggregatesInput[]
    NOT?: UserMetaScalarWhereWithAggregatesInput | UserMetaScalarWhereWithAggregatesInput[]
    wpUserId?: IntWithAggregatesFilter<"UserMeta"> | number
    username?: StringWithAggregatesFilter<"UserMeta"> | string
    displayName?: StringWithAggregatesFilter<"UserMeta"> | string
    email?: StringNullableWithAggregatesFilter<"UserMeta"> | string | null
    capabilities?: JsonWithAggregatesFilter<"UserMeta">
    active?: BoolWithAggregatesFilter<"UserMeta"> | boolean
    lastLoginAt?: DateTimeNullableWithAggregatesFilter<"UserMeta"> | Date | string | null
    createdAt?: DateTimeWithAggregatesFilter<"UserMeta"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"UserMeta"> | Date | string
  }

  export type ProductMetaWhereInput = {
    AND?: ProductMetaWhereInput | ProductMetaWhereInput[]
    OR?: ProductMetaWhereInput[]
    NOT?: ProductMetaWhereInput | ProductMetaWhereInput[]
    wpProductId?: IntFilter<"ProductMeta"> | number
    sku?: StringNullableFilter<"ProductMeta"> | string | null
    name?: StringFilter<"ProductMeta"> | string
    warehouse?: EnumWarehouseNullableFilter<"ProductMeta"> | $Enums.Warehouse | null
    thumbnailUrl?: StringNullableFilter<"ProductMeta"> | string | null
    syncedAt?: DateTimeFilter<"ProductMeta"> | Date | string
    orderItems?: OrderItemListRelationFilter
  }

  export type ProductMetaOrderByWithRelationInput = {
    wpProductId?: SortOrder
    sku?: SortOrderInput | SortOrder
    name?: SortOrder
    warehouse?: SortOrderInput | SortOrder
    thumbnailUrl?: SortOrderInput | SortOrder
    syncedAt?: SortOrder
    orderItems?: OrderItemOrderByRelationAggregateInput
  }

  export type ProductMetaWhereUniqueInput = Prisma.AtLeast<{
    wpProductId?: number
    AND?: ProductMetaWhereInput | ProductMetaWhereInput[]
    OR?: ProductMetaWhereInput[]
    NOT?: ProductMetaWhereInput | ProductMetaWhereInput[]
    sku?: StringNullableFilter<"ProductMeta"> | string | null
    name?: StringFilter<"ProductMeta"> | string
    warehouse?: EnumWarehouseNullableFilter<"ProductMeta"> | $Enums.Warehouse | null
    thumbnailUrl?: StringNullableFilter<"ProductMeta"> | string | null
    syncedAt?: DateTimeFilter<"ProductMeta"> | Date | string
    orderItems?: OrderItemListRelationFilter
  }, "wpProductId">

  export type ProductMetaOrderByWithAggregationInput = {
    wpProductId?: SortOrder
    sku?: SortOrderInput | SortOrder
    name?: SortOrder
    warehouse?: SortOrderInput | SortOrder
    thumbnailUrl?: SortOrderInput | SortOrder
    syncedAt?: SortOrder
    _count?: ProductMetaCountOrderByAggregateInput
    _avg?: ProductMetaAvgOrderByAggregateInput
    _max?: ProductMetaMaxOrderByAggregateInput
    _min?: ProductMetaMinOrderByAggregateInput
    _sum?: ProductMetaSumOrderByAggregateInput
  }

  export type ProductMetaScalarWhereWithAggregatesInput = {
    AND?: ProductMetaScalarWhereWithAggregatesInput | ProductMetaScalarWhereWithAggregatesInput[]
    OR?: ProductMetaScalarWhereWithAggregatesInput[]
    NOT?: ProductMetaScalarWhereWithAggregatesInput | ProductMetaScalarWhereWithAggregatesInput[]
    wpProductId?: IntWithAggregatesFilter<"ProductMeta"> | number
    sku?: StringNullableWithAggregatesFilter<"ProductMeta"> | string | null
    name?: StringWithAggregatesFilter<"ProductMeta"> | string
    warehouse?: EnumWarehouseNullableWithAggregatesFilter<"ProductMeta"> | $Enums.Warehouse | null
    thumbnailUrl?: StringNullableWithAggregatesFilter<"ProductMeta"> | string | null
    syncedAt?: DateTimeWithAggregatesFilter<"ProductMeta"> | Date | string
  }

  export type OrderWhereInput = {
    AND?: OrderWhereInput | OrderWhereInput[]
    OR?: OrderWhereInput[]
    NOT?: OrderWhereInput | OrderWhereInput[]
    id?: IntFilter<"Order"> | number
    wpOrderId?: IntFilter<"Order"> | number
    number?: StringFilter<"Order"> | string
    status?: EnumOrderStatusFilter<"Order"> | $Enums.OrderStatus
    route?: StringNullableFilter<"Order"> | string | null
    stopPosition?: IntNullableFilter<"Order"> | number | null
    customerName?: StringNullableFilter<"Order"> | string | null
    customerAddress?: StringNullableFilter<"Order"> | string | null
    hasB2Pending?: BoolFilter<"Order"> | boolean
    bagsExpected?: IntFilter<"Order"> | number
    packedById?: IntNullableFilter<"Order"> | number | null
    packedAt?: DateTimeNullableFilter<"Order"> | Date | string | null
    classifiedAt?: DateTimeNullableFilter<"Order"> | Date | string | null
    loadedAt?: DateTimeNullableFilter<"Order"> | Date | string | null
    deliveredAt?: DateTimeNullableFilter<"Order"> | Date | string | null
    createdAt?: DateTimeFilter<"Order"> | Date | string
    updatedAt?: DateTimeFilter<"Order"> | Date | string
    packedBy?: XOR<UserMetaNullableRelationFilter, UserMetaWhereInput> | null
    items?: OrderItemListRelationFilter
    sequenceLinks?: SequenceOrderListRelationFilter
    events?: EventListRelationFilter
  }

  export type OrderOrderByWithRelationInput = {
    id?: SortOrder
    wpOrderId?: SortOrder
    number?: SortOrder
    status?: SortOrder
    route?: SortOrderInput | SortOrder
    stopPosition?: SortOrderInput | SortOrder
    customerName?: SortOrderInput | SortOrder
    customerAddress?: SortOrderInput | SortOrder
    hasB2Pending?: SortOrder
    bagsExpected?: SortOrder
    packedById?: SortOrderInput | SortOrder
    packedAt?: SortOrderInput | SortOrder
    classifiedAt?: SortOrderInput | SortOrder
    loadedAt?: SortOrderInput | SortOrder
    deliveredAt?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    packedBy?: UserMetaOrderByWithRelationInput
    items?: OrderItemOrderByRelationAggregateInput
    sequenceLinks?: SequenceOrderOrderByRelationAggregateInput
    events?: EventOrderByRelationAggregateInput
  }

  export type OrderWhereUniqueInput = Prisma.AtLeast<{
    id?: number
    wpOrderId?: number
    AND?: OrderWhereInput | OrderWhereInput[]
    OR?: OrderWhereInput[]
    NOT?: OrderWhereInput | OrderWhereInput[]
    number?: StringFilter<"Order"> | string
    status?: EnumOrderStatusFilter<"Order"> | $Enums.OrderStatus
    route?: StringNullableFilter<"Order"> | string | null
    stopPosition?: IntNullableFilter<"Order"> | number | null
    customerName?: StringNullableFilter<"Order"> | string | null
    customerAddress?: StringNullableFilter<"Order"> | string | null
    hasB2Pending?: BoolFilter<"Order"> | boolean
    bagsExpected?: IntFilter<"Order"> | number
    packedById?: IntNullableFilter<"Order"> | number | null
    packedAt?: DateTimeNullableFilter<"Order"> | Date | string | null
    classifiedAt?: DateTimeNullableFilter<"Order"> | Date | string | null
    loadedAt?: DateTimeNullableFilter<"Order"> | Date | string | null
    deliveredAt?: DateTimeNullableFilter<"Order"> | Date | string | null
    createdAt?: DateTimeFilter<"Order"> | Date | string
    updatedAt?: DateTimeFilter<"Order"> | Date | string
    packedBy?: XOR<UserMetaNullableRelationFilter, UserMetaWhereInput> | null
    items?: OrderItemListRelationFilter
    sequenceLinks?: SequenceOrderListRelationFilter
    events?: EventListRelationFilter
  }, "id" | "wpOrderId">

  export type OrderOrderByWithAggregationInput = {
    id?: SortOrder
    wpOrderId?: SortOrder
    number?: SortOrder
    status?: SortOrder
    route?: SortOrderInput | SortOrder
    stopPosition?: SortOrderInput | SortOrder
    customerName?: SortOrderInput | SortOrder
    customerAddress?: SortOrderInput | SortOrder
    hasB2Pending?: SortOrder
    bagsExpected?: SortOrder
    packedById?: SortOrderInput | SortOrder
    packedAt?: SortOrderInput | SortOrder
    classifiedAt?: SortOrderInput | SortOrder
    loadedAt?: SortOrderInput | SortOrder
    deliveredAt?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: OrderCountOrderByAggregateInput
    _avg?: OrderAvgOrderByAggregateInput
    _max?: OrderMaxOrderByAggregateInput
    _min?: OrderMinOrderByAggregateInput
    _sum?: OrderSumOrderByAggregateInput
  }

  export type OrderScalarWhereWithAggregatesInput = {
    AND?: OrderScalarWhereWithAggregatesInput | OrderScalarWhereWithAggregatesInput[]
    OR?: OrderScalarWhereWithAggregatesInput[]
    NOT?: OrderScalarWhereWithAggregatesInput | OrderScalarWhereWithAggregatesInput[]
    id?: IntWithAggregatesFilter<"Order"> | number
    wpOrderId?: IntWithAggregatesFilter<"Order"> | number
    number?: StringWithAggregatesFilter<"Order"> | string
    status?: EnumOrderStatusWithAggregatesFilter<"Order"> | $Enums.OrderStatus
    route?: StringNullableWithAggregatesFilter<"Order"> | string | null
    stopPosition?: IntNullableWithAggregatesFilter<"Order"> | number | null
    customerName?: StringNullableWithAggregatesFilter<"Order"> | string | null
    customerAddress?: StringNullableWithAggregatesFilter<"Order"> | string | null
    hasB2Pending?: BoolWithAggregatesFilter<"Order"> | boolean
    bagsExpected?: IntWithAggregatesFilter<"Order"> | number
    packedById?: IntNullableWithAggregatesFilter<"Order"> | number | null
    packedAt?: DateTimeNullableWithAggregatesFilter<"Order"> | Date | string | null
    classifiedAt?: DateTimeNullableWithAggregatesFilter<"Order"> | Date | string | null
    loadedAt?: DateTimeNullableWithAggregatesFilter<"Order"> | Date | string | null
    deliveredAt?: DateTimeNullableWithAggregatesFilter<"Order"> | Date | string | null
    createdAt?: DateTimeWithAggregatesFilter<"Order"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Order"> | Date | string
  }

  export type OrderItemWhereInput = {
    AND?: OrderItemWhereInput | OrderItemWhereInput[]
    OR?: OrderItemWhereInput[]
    NOT?: OrderItemWhereInput | OrderItemWhereInput[]
    id?: IntFilter<"OrderItem"> | number
    orderId?: IntFilter<"OrderItem"> | number
    productId?: IntFilter<"OrderItem"> | number
    qty?: IntFilter<"OrderItem"> | number
    warehouse?: EnumWarehouseFilter<"OrderItem"> | $Enums.Warehouse
    pickedAt?: DateTimeNullableFilter<"OrderItem"> | Date | string | null
    packedAt?: DateTimeNullableFilter<"OrderItem"> | Date | string | null
    order?: XOR<OrderRelationFilter, OrderWhereInput>
    product?: XOR<ProductMetaRelationFilter, ProductMetaWhereInput>
  }

  export type OrderItemOrderByWithRelationInput = {
    id?: SortOrder
    orderId?: SortOrder
    productId?: SortOrder
    qty?: SortOrder
    warehouse?: SortOrder
    pickedAt?: SortOrderInput | SortOrder
    packedAt?: SortOrderInput | SortOrder
    order?: OrderOrderByWithRelationInput
    product?: ProductMetaOrderByWithRelationInput
  }

  export type OrderItemWhereUniqueInput = Prisma.AtLeast<{
    id?: number
    AND?: OrderItemWhereInput | OrderItemWhereInput[]
    OR?: OrderItemWhereInput[]
    NOT?: OrderItemWhereInput | OrderItemWhereInput[]
    orderId?: IntFilter<"OrderItem"> | number
    productId?: IntFilter<"OrderItem"> | number
    qty?: IntFilter<"OrderItem"> | number
    warehouse?: EnumWarehouseFilter<"OrderItem"> | $Enums.Warehouse
    pickedAt?: DateTimeNullableFilter<"OrderItem"> | Date | string | null
    packedAt?: DateTimeNullableFilter<"OrderItem"> | Date | string | null
    order?: XOR<OrderRelationFilter, OrderWhereInput>
    product?: XOR<ProductMetaRelationFilter, ProductMetaWhereInput>
  }, "id">

  export type OrderItemOrderByWithAggregationInput = {
    id?: SortOrder
    orderId?: SortOrder
    productId?: SortOrder
    qty?: SortOrder
    warehouse?: SortOrder
    pickedAt?: SortOrderInput | SortOrder
    packedAt?: SortOrderInput | SortOrder
    _count?: OrderItemCountOrderByAggregateInput
    _avg?: OrderItemAvgOrderByAggregateInput
    _max?: OrderItemMaxOrderByAggregateInput
    _min?: OrderItemMinOrderByAggregateInput
    _sum?: OrderItemSumOrderByAggregateInput
  }

  export type OrderItemScalarWhereWithAggregatesInput = {
    AND?: OrderItemScalarWhereWithAggregatesInput | OrderItemScalarWhereWithAggregatesInput[]
    OR?: OrderItemScalarWhereWithAggregatesInput[]
    NOT?: OrderItemScalarWhereWithAggregatesInput | OrderItemScalarWhereWithAggregatesInput[]
    id?: IntWithAggregatesFilter<"OrderItem"> | number
    orderId?: IntWithAggregatesFilter<"OrderItem"> | number
    productId?: IntWithAggregatesFilter<"OrderItem"> | number
    qty?: IntWithAggregatesFilter<"OrderItem"> | number
    warehouse?: EnumWarehouseWithAggregatesFilter<"OrderItem"> | $Enums.Warehouse
    pickedAt?: DateTimeNullableWithAggregatesFilter<"OrderItem"> | Date | string | null
    packedAt?: DateTimeNullableWithAggregatesFilter<"OrderItem"> | Date | string | null
  }

  export type SequenceWhereInput = {
    AND?: SequenceWhereInput | SequenceWhereInput[]
    OR?: SequenceWhereInput[]
    NOT?: SequenceWhereInput | SequenceWhereInput[]
    id?: IntFilter<"Sequence"> | number
    mode?: StringFilter<"Sequence"> | string
    createdById?: IntFilter<"Sequence"> | number
    createdAt?: DateTimeFilter<"Sequence"> | Date | string
    closedAt?: DateTimeNullableFilter<"Sequence"> | Date | string | null
    b1ClosedAt?: DateTimeNullableFilter<"Sequence"> | Date | string | null
    b2ClosedAt?: DateTimeNullableFilter<"Sequence"> | Date | string | null
    expectedBags?: IntFilter<"Sequence"> | number
    actualBags?: IntFilter<"Sequence"> | number
    status?: EnumSequenceStatusFilter<"Sequence"> | $Enums.SequenceStatus
    createdBy?: XOR<UserMetaRelationFilter, UserMetaWhereInput>
    orders?: SequenceOrderListRelationFilter
  }

  export type SequenceOrderByWithRelationInput = {
    id?: SortOrder
    mode?: SortOrder
    createdById?: SortOrder
    createdAt?: SortOrder
    closedAt?: SortOrderInput | SortOrder
    b1ClosedAt?: SortOrderInput | SortOrder
    b2ClosedAt?: SortOrderInput | SortOrder
    expectedBags?: SortOrder
    actualBags?: SortOrder
    status?: SortOrder
    createdBy?: UserMetaOrderByWithRelationInput
    orders?: SequenceOrderOrderByRelationAggregateInput
  }

  export type SequenceWhereUniqueInput = Prisma.AtLeast<{
    id?: number
    AND?: SequenceWhereInput | SequenceWhereInput[]
    OR?: SequenceWhereInput[]
    NOT?: SequenceWhereInput | SequenceWhereInput[]
    mode?: StringFilter<"Sequence"> | string
    createdById?: IntFilter<"Sequence"> | number
    createdAt?: DateTimeFilter<"Sequence"> | Date | string
    closedAt?: DateTimeNullableFilter<"Sequence"> | Date | string | null
    b1ClosedAt?: DateTimeNullableFilter<"Sequence"> | Date | string | null
    b2ClosedAt?: DateTimeNullableFilter<"Sequence"> | Date | string | null
    expectedBags?: IntFilter<"Sequence"> | number
    actualBags?: IntFilter<"Sequence"> | number
    status?: EnumSequenceStatusFilter<"Sequence"> | $Enums.SequenceStatus
    createdBy?: XOR<UserMetaRelationFilter, UserMetaWhereInput>
    orders?: SequenceOrderListRelationFilter
  }, "id">

  export type SequenceOrderByWithAggregationInput = {
    id?: SortOrder
    mode?: SortOrder
    createdById?: SortOrder
    createdAt?: SortOrder
    closedAt?: SortOrderInput | SortOrder
    b1ClosedAt?: SortOrderInput | SortOrder
    b2ClosedAt?: SortOrderInput | SortOrder
    expectedBags?: SortOrder
    actualBags?: SortOrder
    status?: SortOrder
    _count?: SequenceCountOrderByAggregateInput
    _avg?: SequenceAvgOrderByAggregateInput
    _max?: SequenceMaxOrderByAggregateInput
    _min?: SequenceMinOrderByAggregateInput
    _sum?: SequenceSumOrderByAggregateInput
  }

  export type SequenceScalarWhereWithAggregatesInput = {
    AND?: SequenceScalarWhereWithAggregatesInput | SequenceScalarWhereWithAggregatesInput[]
    OR?: SequenceScalarWhereWithAggregatesInput[]
    NOT?: SequenceScalarWhereWithAggregatesInput | SequenceScalarWhereWithAggregatesInput[]
    id?: IntWithAggregatesFilter<"Sequence"> | number
    mode?: StringWithAggregatesFilter<"Sequence"> | string
    createdById?: IntWithAggregatesFilter<"Sequence"> | number
    createdAt?: DateTimeWithAggregatesFilter<"Sequence"> | Date | string
    closedAt?: DateTimeNullableWithAggregatesFilter<"Sequence"> | Date | string | null
    b1ClosedAt?: DateTimeNullableWithAggregatesFilter<"Sequence"> | Date | string | null
    b2ClosedAt?: DateTimeNullableWithAggregatesFilter<"Sequence"> | Date | string | null
    expectedBags?: IntWithAggregatesFilter<"Sequence"> | number
    actualBags?: IntWithAggregatesFilter<"Sequence"> | number
    status?: EnumSequenceStatusWithAggregatesFilter<"Sequence"> | $Enums.SequenceStatus
  }

  export type SequenceOrderWhereInput = {
    AND?: SequenceOrderWhereInput | SequenceOrderWhereInput[]
    OR?: SequenceOrderWhereInput[]
    NOT?: SequenceOrderWhereInput | SequenceOrderWhereInput[]
    sequenceId?: IntFilter<"SequenceOrder"> | number
    orderId?: IntFilter<"SequenceOrder"> | number
    sequence?: XOR<SequenceRelationFilter, SequenceWhereInput>
    order?: XOR<OrderRelationFilter, OrderWhereInput>
  }

  export type SequenceOrderOrderByWithRelationInput = {
    sequenceId?: SortOrder
    orderId?: SortOrder
    sequence?: SequenceOrderByWithRelationInput
    order?: OrderOrderByWithRelationInput
  }

  export type SequenceOrderWhereUniqueInput = Prisma.AtLeast<{
    sequenceId_orderId?: SequenceOrderSequenceIdOrderIdCompoundUniqueInput
    AND?: SequenceOrderWhereInput | SequenceOrderWhereInput[]
    OR?: SequenceOrderWhereInput[]
    NOT?: SequenceOrderWhereInput | SequenceOrderWhereInput[]
    sequenceId?: IntFilter<"SequenceOrder"> | number
    orderId?: IntFilter<"SequenceOrder"> | number
    sequence?: XOR<SequenceRelationFilter, SequenceWhereInput>
    order?: XOR<OrderRelationFilter, OrderWhereInput>
  }, "sequenceId_orderId">

  export type SequenceOrderOrderByWithAggregationInput = {
    sequenceId?: SortOrder
    orderId?: SortOrder
    _count?: SequenceOrderCountOrderByAggregateInput
    _avg?: SequenceOrderAvgOrderByAggregateInput
    _max?: SequenceOrderMaxOrderByAggregateInput
    _min?: SequenceOrderMinOrderByAggregateInput
    _sum?: SequenceOrderSumOrderByAggregateInput
  }

  export type SequenceOrderScalarWhereWithAggregatesInput = {
    AND?: SequenceOrderScalarWhereWithAggregatesInput | SequenceOrderScalarWhereWithAggregatesInput[]
    OR?: SequenceOrderScalarWhereWithAggregatesInput[]
    NOT?: SequenceOrderScalarWhereWithAggregatesInput | SequenceOrderScalarWhereWithAggregatesInput[]
    sequenceId?: IntWithAggregatesFilter<"SequenceOrder"> | number
    orderId?: IntWithAggregatesFilter<"SequenceOrder"> | number
  }

  export type EventWhereInput = {
    AND?: EventWhereInput | EventWhereInput[]
    OR?: EventWhereInput[]
    NOT?: EventWhereInput | EventWhereInput[]
    id?: IntFilter<"Event"> | number
    type?: StringFilter<"Event"> | string
    actorId?: IntNullableFilter<"Event"> | number | null
    orderId?: IntNullableFilter<"Event"> | number | null
    payload?: JsonNullableFilter<"Event">
    createdAt?: DateTimeFilter<"Event"> | Date | string
    actor?: XOR<UserMetaNullableRelationFilter, UserMetaWhereInput> | null
    order?: XOR<OrderNullableRelationFilter, OrderWhereInput> | null
  }

  export type EventOrderByWithRelationInput = {
    id?: SortOrder
    type?: SortOrder
    actorId?: SortOrderInput | SortOrder
    orderId?: SortOrderInput | SortOrder
    payload?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    actor?: UserMetaOrderByWithRelationInput
    order?: OrderOrderByWithRelationInput
  }

  export type EventWhereUniqueInput = Prisma.AtLeast<{
    id?: number
    AND?: EventWhereInput | EventWhereInput[]
    OR?: EventWhereInput[]
    NOT?: EventWhereInput | EventWhereInput[]
    type?: StringFilter<"Event"> | string
    actorId?: IntNullableFilter<"Event"> | number | null
    orderId?: IntNullableFilter<"Event"> | number | null
    payload?: JsonNullableFilter<"Event">
    createdAt?: DateTimeFilter<"Event"> | Date | string
    actor?: XOR<UserMetaNullableRelationFilter, UserMetaWhereInput> | null
    order?: XOR<OrderNullableRelationFilter, OrderWhereInput> | null
  }, "id">

  export type EventOrderByWithAggregationInput = {
    id?: SortOrder
    type?: SortOrder
    actorId?: SortOrderInput | SortOrder
    orderId?: SortOrderInput | SortOrder
    payload?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    _count?: EventCountOrderByAggregateInput
    _avg?: EventAvgOrderByAggregateInput
    _max?: EventMaxOrderByAggregateInput
    _min?: EventMinOrderByAggregateInput
    _sum?: EventSumOrderByAggregateInput
  }

  export type EventScalarWhereWithAggregatesInput = {
    AND?: EventScalarWhereWithAggregatesInput | EventScalarWhereWithAggregatesInput[]
    OR?: EventScalarWhereWithAggregatesInput[]
    NOT?: EventScalarWhereWithAggregatesInput | EventScalarWhereWithAggregatesInput[]
    id?: IntWithAggregatesFilter<"Event"> | number
    type?: StringWithAggregatesFilter<"Event"> | string
    actorId?: IntNullableWithAggregatesFilter<"Event"> | number | null
    orderId?: IntNullableWithAggregatesFilter<"Event"> | number | null
    payload?: JsonNullableWithAggregatesFilter<"Event">
    createdAt?: DateTimeWithAggregatesFilter<"Event"> | Date | string
  }

  export type UserMetaCreateInput = {
    wpUserId: number
    username: string
    displayName: string
    email?: string | null
    capabilities: JsonNullValueInput | InputJsonValue
    active?: boolean
    lastLoginAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    sequencesCreated?: SequenceCreateNestedManyWithoutCreatedByInput
    packedOrders?: OrderCreateNestedManyWithoutPackedByInput
    events?: EventCreateNestedManyWithoutActorInput
  }

  export type UserMetaUncheckedCreateInput = {
    wpUserId: number
    username: string
    displayName: string
    email?: string | null
    capabilities: JsonNullValueInput | InputJsonValue
    active?: boolean
    lastLoginAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    sequencesCreated?: SequenceUncheckedCreateNestedManyWithoutCreatedByInput
    packedOrders?: OrderUncheckedCreateNestedManyWithoutPackedByInput
    events?: EventUncheckedCreateNestedManyWithoutActorInput
  }

  export type UserMetaUpdateInput = {
    wpUserId?: IntFieldUpdateOperationsInput | number
    username?: StringFieldUpdateOperationsInput | string
    displayName?: StringFieldUpdateOperationsInput | string
    email?: NullableStringFieldUpdateOperationsInput | string | null
    capabilities?: JsonNullValueInput | InputJsonValue
    active?: BoolFieldUpdateOperationsInput | boolean
    lastLoginAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    sequencesCreated?: SequenceUpdateManyWithoutCreatedByNestedInput
    packedOrders?: OrderUpdateManyWithoutPackedByNestedInput
    events?: EventUpdateManyWithoutActorNestedInput
  }

  export type UserMetaUncheckedUpdateInput = {
    wpUserId?: IntFieldUpdateOperationsInput | number
    username?: StringFieldUpdateOperationsInput | string
    displayName?: StringFieldUpdateOperationsInput | string
    email?: NullableStringFieldUpdateOperationsInput | string | null
    capabilities?: JsonNullValueInput | InputJsonValue
    active?: BoolFieldUpdateOperationsInput | boolean
    lastLoginAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    sequencesCreated?: SequenceUncheckedUpdateManyWithoutCreatedByNestedInput
    packedOrders?: OrderUncheckedUpdateManyWithoutPackedByNestedInput
    events?: EventUncheckedUpdateManyWithoutActorNestedInput
  }

  export type UserMetaCreateManyInput = {
    wpUserId: number
    username: string
    displayName: string
    email?: string | null
    capabilities: JsonNullValueInput | InputJsonValue
    active?: boolean
    lastLoginAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type UserMetaUpdateManyMutationInput = {
    wpUserId?: IntFieldUpdateOperationsInput | number
    username?: StringFieldUpdateOperationsInput | string
    displayName?: StringFieldUpdateOperationsInput | string
    email?: NullableStringFieldUpdateOperationsInput | string | null
    capabilities?: JsonNullValueInput | InputJsonValue
    active?: BoolFieldUpdateOperationsInput | boolean
    lastLoginAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserMetaUncheckedUpdateManyInput = {
    wpUserId?: IntFieldUpdateOperationsInput | number
    username?: StringFieldUpdateOperationsInput | string
    displayName?: StringFieldUpdateOperationsInput | string
    email?: NullableStringFieldUpdateOperationsInput | string | null
    capabilities?: JsonNullValueInput | InputJsonValue
    active?: BoolFieldUpdateOperationsInput | boolean
    lastLoginAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ProductMetaCreateInput = {
    wpProductId: number
    sku?: string | null
    name: string
    warehouse?: $Enums.Warehouse | null
    thumbnailUrl?: string | null
    syncedAt?: Date | string
    orderItems?: OrderItemCreateNestedManyWithoutProductInput
  }

  export type ProductMetaUncheckedCreateInput = {
    wpProductId: number
    sku?: string | null
    name: string
    warehouse?: $Enums.Warehouse | null
    thumbnailUrl?: string | null
    syncedAt?: Date | string
    orderItems?: OrderItemUncheckedCreateNestedManyWithoutProductInput
  }

  export type ProductMetaUpdateInput = {
    wpProductId?: IntFieldUpdateOperationsInput | number
    sku?: NullableStringFieldUpdateOperationsInput | string | null
    name?: StringFieldUpdateOperationsInput | string
    warehouse?: NullableEnumWarehouseFieldUpdateOperationsInput | $Enums.Warehouse | null
    thumbnailUrl?: NullableStringFieldUpdateOperationsInput | string | null
    syncedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    orderItems?: OrderItemUpdateManyWithoutProductNestedInput
  }

  export type ProductMetaUncheckedUpdateInput = {
    wpProductId?: IntFieldUpdateOperationsInput | number
    sku?: NullableStringFieldUpdateOperationsInput | string | null
    name?: StringFieldUpdateOperationsInput | string
    warehouse?: NullableEnumWarehouseFieldUpdateOperationsInput | $Enums.Warehouse | null
    thumbnailUrl?: NullableStringFieldUpdateOperationsInput | string | null
    syncedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    orderItems?: OrderItemUncheckedUpdateManyWithoutProductNestedInput
  }

  export type ProductMetaCreateManyInput = {
    wpProductId: number
    sku?: string | null
    name: string
    warehouse?: $Enums.Warehouse | null
    thumbnailUrl?: string | null
    syncedAt?: Date | string
  }

  export type ProductMetaUpdateManyMutationInput = {
    wpProductId?: IntFieldUpdateOperationsInput | number
    sku?: NullableStringFieldUpdateOperationsInput | string | null
    name?: StringFieldUpdateOperationsInput | string
    warehouse?: NullableEnumWarehouseFieldUpdateOperationsInput | $Enums.Warehouse | null
    thumbnailUrl?: NullableStringFieldUpdateOperationsInput | string | null
    syncedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ProductMetaUncheckedUpdateManyInput = {
    wpProductId?: IntFieldUpdateOperationsInput | number
    sku?: NullableStringFieldUpdateOperationsInput | string | null
    name?: StringFieldUpdateOperationsInput | string
    warehouse?: NullableEnumWarehouseFieldUpdateOperationsInput | $Enums.Warehouse | null
    thumbnailUrl?: NullableStringFieldUpdateOperationsInput | string | null
    syncedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type OrderCreateInput = {
    wpOrderId: number
    number: string
    status?: $Enums.OrderStatus
    route?: string | null
    stopPosition?: number | null
    customerName?: string | null
    customerAddress?: string | null
    hasB2Pending?: boolean
    bagsExpected?: number
    packedAt?: Date | string | null
    classifiedAt?: Date | string | null
    loadedAt?: Date | string | null
    deliveredAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    packedBy?: UserMetaCreateNestedOneWithoutPackedOrdersInput
    items?: OrderItemCreateNestedManyWithoutOrderInput
    sequenceLinks?: SequenceOrderCreateNestedManyWithoutOrderInput
    events?: EventCreateNestedManyWithoutOrderInput
  }

  export type OrderUncheckedCreateInput = {
    id?: number
    wpOrderId: number
    number: string
    status?: $Enums.OrderStatus
    route?: string | null
    stopPosition?: number | null
    customerName?: string | null
    customerAddress?: string | null
    hasB2Pending?: boolean
    bagsExpected?: number
    packedById?: number | null
    packedAt?: Date | string | null
    classifiedAt?: Date | string | null
    loadedAt?: Date | string | null
    deliveredAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    items?: OrderItemUncheckedCreateNestedManyWithoutOrderInput
    sequenceLinks?: SequenceOrderUncheckedCreateNestedManyWithoutOrderInput
    events?: EventUncheckedCreateNestedManyWithoutOrderInput
  }

  export type OrderUpdateInput = {
    wpOrderId?: IntFieldUpdateOperationsInput | number
    number?: StringFieldUpdateOperationsInput | string
    status?: EnumOrderStatusFieldUpdateOperationsInput | $Enums.OrderStatus
    route?: NullableStringFieldUpdateOperationsInput | string | null
    stopPosition?: NullableIntFieldUpdateOperationsInput | number | null
    customerName?: NullableStringFieldUpdateOperationsInput | string | null
    customerAddress?: NullableStringFieldUpdateOperationsInput | string | null
    hasB2Pending?: BoolFieldUpdateOperationsInput | boolean
    bagsExpected?: IntFieldUpdateOperationsInput | number
    packedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    classifiedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    loadedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    deliveredAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    packedBy?: UserMetaUpdateOneWithoutPackedOrdersNestedInput
    items?: OrderItemUpdateManyWithoutOrderNestedInput
    sequenceLinks?: SequenceOrderUpdateManyWithoutOrderNestedInput
    events?: EventUpdateManyWithoutOrderNestedInput
  }

  export type OrderUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    wpOrderId?: IntFieldUpdateOperationsInput | number
    number?: StringFieldUpdateOperationsInput | string
    status?: EnumOrderStatusFieldUpdateOperationsInput | $Enums.OrderStatus
    route?: NullableStringFieldUpdateOperationsInput | string | null
    stopPosition?: NullableIntFieldUpdateOperationsInput | number | null
    customerName?: NullableStringFieldUpdateOperationsInput | string | null
    customerAddress?: NullableStringFieldUpdateOperationsInput | string | null
    hasB2Pending?: BoolFieldUpdateOperationsInput | boolean
    bagsExpected?: IntFieldUpdateOperationsInput | number
    packedById?: NullableIntFieldUpdateOperationsInput | number | null
    packedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    classifiedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    loadedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    deliveredAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    items?: OrderItemUncheckedUpdateManyWithoutOrderNestedInput
    sequenceLinks?: SequenceOrderUncheckedUpdateManyWithoutOrderNestedInput
    events?: EventUncheckedUpdateManyWithoutOrderNestedInput
  }

  export type OrderCreateManyInput = {
    id?: number
    wpOrderId: number
    number: string
    status?: $Enums.OrderStatus
    route?: string | null
    stopPosition?: number | null
    customerName?: string | null
    customerAddress?: string | null
    hasB2Pending?: boolean
    bagsExpected?: number
    packedById?: number | null
    packedAt?: Date | string | null
    classifiedAt?: Date | string | null
    loadedAt?: Date | string | null
    deliveredAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type OrderUpdateManyMutationInput = {
    wpOrderId?: IntFieldUpdateOperationsInput | number
    number?: StringFieldUpdateOperationsInput | string
    status?: EnumOrderStatusFieldUpdateOperationsInput | $Enums.OrderStatus
    route?: NullableStringFieldUpdateOperationsInput | string | null
    stopPosition?: NullableIntFieldUpdateOperationsInput | number | null
    customerName?: NullableStringFieldUpdateOperationsInput | string | null
    customerAddress?: NullableStringFieldUpdateOperationsInput | string | null
    hasB2Pending?: BoolFieldUpdateOperationsInput | boolean
    bagsExpected?: IntFieldUpdateOperationsInput | number
    packedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    classifiedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    loadedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    deliveredAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type OrderUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number
    wpOrderId?: IntFieldUpdateOperationsInput | number
    number?: StringFieldUpdateOperationsInput | string
    status?: EnumOrderStatusFieldUpdateOperationsInput | $Enums.OrderStatus
    route?: NullableStringFieldUpdateOperationsInput | string | null
    stopPosition?: NullableIntFieldUpdateOperationsInput | number | null
    customerName?: NullableStringFieldUpdateOperationsInput | string | null
    customerAddress?: NullableStringFieldUpdateOperationsInput | string | null
    hasB2Pending?: BoolFieldUpdateOperationsInput | boolean
    bagsExpected?: IntFieldUpdateOperationsInput | number
    packedById?: NullableIntFieldUpdateOperationsInput | number | null
    packedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    classifiedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    loadedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    deliveredAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type OrderItemCreateInput = {
    qty: number
    warehouse: $Enums.Warehouse
    pickedAt?: Date | string | null
    packedAt?: Date | string | null
    order: OrderCreateNestedOneWithoutItemsInput
    product: ProductMetaCreateNestedOneWithoutOrderItemsInput
  }

  export type OrderItemUncheckedCreateInput = {
    id?: number
    orderId: number
    productId: number
    qty: number
    warehouse: $Enums.Warehouse
    pickedAt?: Date | string | null
    packedAt?: Date | string | null
  }

  export type OrderItemUpdateInput = {
    qty?: IntFieldUpdateOperationsInput | number
    warehouse?: EnumWarehouseFieldUpdateOperationsInput | $Enums.Warehouse
    pickedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    packedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    order?: OrderUpdateOneRequiredWithoutItemsNestedInput
    product?: ProductMetaUpdateOneRequiredWithoutOrderItemsNestedInput
  }

  export type OrderItemUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    orderId?: IntFieldUpdateOperationsInput | number
    productId?: IntFieldUpdateOperationsInput | number
    qty?: IntFieldUpdateOperationsInput | number
    warehouse?: EnumWarehouseFieldUpdateOperationsInput | $Enums.Warehouse
    pickedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    packedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type OrderItemCreateManyInput = {
    id?: number
    orderId: number
    productId: number
    qty: number
    warehouse: $Enums.Warehouse
    pickedAt?: Date | string | null
    packedAt?: Date | string | null
  }

  export type OrderItemUpdateManyMutationInput = {
    qty?: IntFieldUpdateOperationsInput | number
    warehouse?: EnumWarehouseFieldUpdateOperationsInput | $Enums.Warehouse
    pickedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    packedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type OrderItemUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number
    orderId?: IntFieldUpdateOperationsInput | number
    productId?: IntFieldUpdateOperationsInput | number
    qty?: IntFieldUpdateOperationsInput | number
    warehouse?: EnumWarehouseFieldUpdateOperationsInput | $Enums.Warehouse
    pickedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    packedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type SequenceCreateInput = {
    mode?: string
    createdAt?: Date | string
    closedAt?: Date | string | null
    b1ClosedAt?: Date | string | null
    b2ClosedAt?: Date | string | null
    expectedBags?: number
    actualBags?: number
    status?: $Enums.SequenceStatus
    createdBy: UserMetaCreateNestedOneWithoutSequencesCreatedInput
    orders?: SequenceOrderCreateNestedManyWithoutSequenceInput
  }

  export type SequenceUncheckedCreateInput = {
    id?: number
    mode?: string
    createdById: number
    createdAt?: Date | string
    closedAt?: Date | string | null
    b1ClosedAt?: Date | string | null
    b2ClosedAt?: Date | string | null
    expectedBags?: number
    actualBags?: number
    status?: $Enums.SequenceStatus
    orders?: SequenceOrderUncheckedCreateNestedManyWithoutSequenceInput
  }

  export type SequenceUpdateInput = {
    mode?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    closedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    b1ClosedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    b2ClosedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    expectedBags?: IntFieldUpdateOperationsInput | number
    actualBags?: IntFieldUpdateOperationsInput | number
    status?: EnumSequenceStatusFieldUpdateOperationsInput | $Enums.SequenceStatus
    createdBy?: UserMetaUpdateOneRequiredWithoutSequencesCreatedNestedInput
    orders?: SequenceOrderUpdateManyWithoutSequenceNestedInput
  }

  export type SequenceUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    mode?: StringFieldUpdateOperationsInput | string
    createdById?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    closedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    b1ClosedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    b2ClosedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    expectedBags?: IntFieldUpdateOperationsInput | number
    actualBags?: IntFieldUpdateOperationsInput | number
    status?: EnumSequenceStatusFieldUpdateOperationsInput | $Enums.SequenceStatus
    orders?: SequenceOrderUncheckedUpdateManyWithoutSequenceNestedInput
  }

  export type SequenceCreateManyInput = {
    id?: number
    mode?: string
    createdById: number
    createdAt?: Date | string
    closedAt?: Date | string | null
    b1ClosedAt?: Date | string | null
    b2ClosedAt?: Date | string | null
    expectedBags?: number
    actualBags?: number
    status?: $Enums.SequenceStatus
  }

  export type SequenceUpdateManyMutationInput = {
    mode?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    closedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    b1ClosedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    b2ClosedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    expectedBags?: IntFieldUpdateOperationsInput | number
    actualBags?: IntFieldUpdateOperationsInput | number
    status?: EnumSequenceStatusFieldUpdateOperationsInput | $Enums.SequenceStatus
  }

  export type SequenceUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number
    mode?: StringFieldUpdateOperationsInput | string
    createdById?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    closedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    b1ClosedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    b2ClosedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    expectedBags?: IntFieldUpdateOperationsInput | number
    actualBags?: IntFieldUpdateOperationsInput | number
    status?: EnumSequenceStatusFieldUpdateOperationsInput | $Enums.SequenceStatus
  }

  export type SequenceOrderCreateInput = {
    sequence: SequenceCreateNestedOneWithoutOrdersInput
    order: OrderCreateNestedOneWithoutSequenceLinksInput
  }

  export type SequenceOrderUncheckedCreateInput = {
    sequenceId: number
    orderId: number
  }

  export type SequenceOrderUpdateInput = {
    sequence?: SequenceUpdateOneRequiredWithoutOrdersNestedInput
    order?: OrderUpdateOneRequiredWithoutSequenceLinksNestedInput
  }

  export type SequenceOrderUncheckedUpdateInput = {
    sequenceId?: IntFieldUpdateOperationsInput | number
    orderId?: IntFieldUpdateOperationsInput | number
  }

  export type SequenceOrderCreateManyInput = {
    sequenceId: number
    orderId: number
  }

  export type SequenceOrderUpdateManyMutationInput = {

  }

  export type SequenceOrderUncheckedUpdateManyInput = {
    sequenceId?: IntFieldUpdateOperationsInput | number
    orderId?: IntFieldUpdateOperationsInput | number
  }

  export type EventCreateInput = {
    type: string
    payload?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    actor?: UserMetaCreateNestedOneWithoutEventsInput
    order?: OrderCreateNestedOneWithoutEventsInput
  }

  export type EventUncheckedCreateInput = {
    id?: number
    type: string
    actorId?: number | null
    orderId?: number | null
    payload?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
  }

  export type EventUpdateInput = {
    type?: StringFieldUpdateOperationsInput | string
    payload?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    actor?: UserMetaUpdateOneWithoutEventsNestedInput
    order?: OrderUpdateOneWithoutEventsNestedInput
  }

  export type EventUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    type?: StringFieldUpdateOperationsInput | string
    actorId?: NullableIntFieldUpdateOperationsInput | number | null
    orderId?: NullableIntFieldUpdateOperationsInput | number | null
    payload?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type EventCreateManyInput = {
    id?: number
    type: string
    actorId?: number | null
    orderId?: number | null
    payload?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
  }

  export type EventUpdateManyMutationInput = {
    type?: StringFieldUpdateOperationsInput | string
    payload?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type EventUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number
    type?: StringFieldUpdateOperationsInput | string
    actorId?: NullableIntFieldUpdateOperationsInput | number | null
    orderId?: NullableIntFieldUpdateOperationsInput | number | null
    payload?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type IntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[]
    notIn?: number[]
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type StringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[]
    notIn?: string[]
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type StringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | null
    notIn?: string[] | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }
  export type JsonFilter<$PrismaModel = never> = 
    | PatchUndefined<
        Either<Required<JsonFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonFilterBase<$PrismaModel>>, 'path'>>

  export type JsonFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue
    lte?: InputJsonValue
    gt?: InputJsonValue
    gte?: InputJsonValue
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
  }

  export type BoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type DateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | null
    notIn?: Date[] | string[] | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type DateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[]
    notIn?: Date[] | string[]
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type SequenceListRelationFilter = {
    every?: SequenceWhereInput
    some?: SequenceWhereInput
    none?: SequenceWhereInput
  }

  export type OrderListRelationFilter = {
    every?: OrderWhereInput
    some?: OrderWhereInput
    none?: OrderWhereInput
  }

  export type EventListRelationFilter = {
    every?: EventWhereInput
    some?: EventWhereInput
    none?: EventWhereInput
  }

  export type SortOrderInput = {
    sort: SortOrder
    nulls?: NullsOrder
  }

  export type SequenceOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type OrderOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type EventOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type UserMetaCountOrderByAggregateInput = {
    wpUserId?: SortOrder
    username?: SortOrder
    displayName?: SortOrder
    email?: SortOrder
    capabilities?: SortOrder
    active?: SortOrder
    lastLoginAt?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type UserMetaAvgOrderByAggregateInput = {
    wpUserId?: SortOrder
  }

  export type UserMetaMaxOrderByAggregateInput = {
    wpUserId?: SortOrder
    username?: SortOrder
    displayName?: SortOrder
    email?: SortOrder
    active?: SortOrder
    lastLoginAt?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type UserMetaMinOrderByAggregateInput = {
    wpUserId?: SortOrder
    username?: SortOrder
    displayName?: SortOrder
    email?: SortOrder
    active?: SortOrder
    lastLoginAt?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type UserMetaSumOrderByAggregateInput = {
    wpUserId?: SortOrder
  }

  export type IntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[]
    notIn?: number[]
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type StringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[]
    notIn?: string[]
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type StringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | null
    notIn?: string[] | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }
  export type JsonWithAggregatesFilter<$PrismaModel = never> = 
    | PatchUndefined<
        Either<Required<JsonWithAggregatesFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonWithAggregatesFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonWithAggregatesFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonWithAggregatesFilterBase<$PrismaModel>>, 'path'>>

  export type JsonWithAggregatesFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue
    lte?: InputJsonValue
    gt?: InputJsonValue
    gte?: InputJsonValue
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedJsonFilter<$PrismaModel>
    _max?: NestedJsonFilter<$PrismaModel>
  }

  export type BoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type DateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | null
    notIn?: Date[] | string[] | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }

  export type DateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[]
    notIn?: Date[] | string[]
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type EnumWarehouseNullableFilter<$PrismaModel = never> = {
    equals?: $Enums.Warehouse | EnumWarehouseFieldRefInput<$PrismaModel> | null
    in?: $Enums.Warehouse[] | null
    notIn?: $Enums.Warehouse[] | null
    not?: NestedEnumWarehouseNullableFilter<$PrismaModel> | $Enums.Warehouse | null
  }

  export type OrderItemListRelationFilter = {
    every?: OrderItemWhereInput
    some?: OrderItemWhereInput
    none?: OrderItemWhereInput
  }

  export type OrderItemOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type ProductMetaCountOrderByAggregateInput = {
    wpProductId?: SortOrder
    sku?: SortOrder
    name?: SortOrder
    warehouse?: SortOrder
    thumbnailUrl?: SortOrder
    syncedAt?: SortOrder
  }

  export type ProductMetaAvgOrderByAggregateInput = {
    wpProductId?: SortOrder
  }

  export type ProductMetaMaxOrderByAggregateInput = {
    wpProductId?: SortOrder
    sku?: SortOrder
    name?: SortOrder
    warehouse?: SortOrder
    thumbnailUrl?: SortOrder
    syncedAt?: SortOrder
  }

  export type ProductMetaMinOrderByAggregateInput = {
    wpProductId?: SortOrder
    sku?: SortOrder
    name?: SortOrder
    warehouse?: SortOrder
    thumbnailUrl?: SortOrder
    syncedAt?: SortOrder
  }

  export type ProductMetaSumOrderByAggregateInput = {
    wpProductId?: SortOrder
  }

  export type EnumWarehouseNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.Warehouse | EnumWarehouseFieldRefInput<$PrismaModel> | null
    in?: $Enums.Warehouse[] | null
    notIn?: $Enums.Warehouse[] | null
    not?: NestedEnumWarehouseNullableWithAggregatesFilter<$PrismaModel> | $Enums.Warehouse | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedEnumWarehouseNullableFilter<$PrismaModel>
    _max?: NestedEnumWarehouseNullableFilter<$PrismaModel>
  }

  export type EnumOrderStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.OrderStatus | EnumOrderStatusFieldRefInput<$PrismaModel>
    in?: $Enums.OrderStatus[]
    notIn?: $Enums.OrderStatus[]
    not?: NestedEnumOrderStatusFilter<$PrismaModel> | $Enums.OrderStatus
  }

  export type IntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | null
    notIn?: number[] | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type UserMetaNullableRelationFilter = {
    is?: UserMetaWhereInput | null
    isNot?: UserMetaWhereInput | null
  }

  export type SequenceOrderListRelationFilter = {
    every?: SequenceOrderWhereInput
    some?: SequenceOrderWhereInput
    none?: SequenceOrderWhereInput
  }

  export type SequenceOrderOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type OrderCountOrderByAggregateInput = {
    id?: SortOrder
    wpOrderId?: SortOrder
    number?: SortOrder
    status?: SortOrder
    route?: SortOrder
    stopPosition?: SortOrder
    customerName?: SortOrder
    customerAddress?: SortOrder
    hasB2Pending?: SortOrder
    bagsExpected?: SortOrder
    packedById?: SortOrder
    packedAt?: SortOrder
    classifiedAt?: SortOrder
    loadedAt?: SortOrder
    deliveredAt?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type OrderAvgOrderByAggregateInput = {
    id?: SortOrder
    wpOrderId?: SortOrder
    stopPosition?: SortOrder
    bagsExpected?: SortOrder
    packedById?: SortOrder
  }

  export type OrderMaxOrderByAggregateInput = {
    id?: SortOrder
    wpOrderId?: SortOrder
    number?: SortOrder
    status?: SortOrder
    route?: SortOrder
    stopPosition?: SortOrder
    customerName?: SortOrder
    customerAddress?: SortOrder
    hasB2Pending?: SortOrder
    bagsExpected?: SortOrder
    packedById?: SortOrder
    packedAt?: SortOrder
    classifiedAt?: SortOrder
    loadedAt?: SortOrder
    deliveredAt?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type OrderMinOrderByAggregateInput = {
    id?: SortOrder
    wpOrderId?: SortOrder
    number?: SortOrder
    status?: SortOrder
    route?: SortOrder
    stopPosition?: SortOrder
    customerName?: SortOrder
    customerAddress?: SortOrder
    hasB2Pending?: SortOrder
    bagsExpected?: SortOrder
    packedById?: SortOrder
    packedAt?: SortOrder
    classifiedAt?: SortOrder
    loadedAt?: SortOrder
    deliveredAt?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type OrderSumOrderByAggregateInput = {
    id?: SortOrder
    wpOrderId?: SortOrder
    stopPosition?: SortOrder
    bagsExpected?: SortOrder
    packedById?: SortOrder
  }

  export type EnumOrderStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.OrderStatus | EnumOrderStatusFieldRefInput<$PrismaModel>
    in?: $Enums.OrderStatus[]
    notIn?: $Enums.OrderStatus[]
    not?: NestedEnumOrderStatusWithAggregatesFilter<$PrismaModel> | $Enums.OrderStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumOrderStatusFilter<$PrismaModel>
    _max?: NestedEnumOrderStatusFilter<$PrismaModel>
  }

  export type IntNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | null
    notIn?: number[] | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedIntNullableFilter<$PrismaModel>
    _max?: NestedIntNullableFilter<$PrismaModel>
  }

  export type EnumWarehouseFilter<$PrismaModel = never> = {
    equals?: $Enums.Warehouse | EnumWarehouseFieldRefInput<$PrismaModel>
    in?: $Enums.Warehouse[]
    notIn?: $Enums.Warehouse[]
    not?: NestedEnumWarehouseFilter<$PrismaModel> | $Enums.Warehouse
  }

  export type OrderRelationFilter = {
    is?: OrderWhereInput
    isNot?: OrderWhereInput
  }

  export type ProductMetaRelationFilter = {
    is?: ProductMetaWhereInput
    isNot?: ProductMetaWhereInput
  }

  export type OrderItemCountOrderByAggregateInput = {
    id?: SortOrder
    orderId?: SortOrder
    productId?: SortOrder
    qty?: SortOrder
    warehouse?: SortOrder
    pickedAt?: SortOrder
    packedAt?: SortOrder
  }

  export type OrderItemAvgOrderByAggregateInput = {
    id?: SortOrder
    orderId?: SortOrder
    productId?: SortOrder
    qty?: SortOrder
  }

  export type OrderItemMaxOrderByAggregateInput = {
    id?: SortOrder
    orderId?: SortOrder
    productId?: SortOrder
    qty?: SortOrder
    warehouse?: SortOrder
    pickedAt?: SortOrder
    packedAt?: SortOrder
  }

  export type OrderItemMinOrderByAggregateInput = {
    id?: SortOrder
    orderId?: SortOrder
    productId?: SortOrder
    qty?: SortOrder
    warehouse?: SortOrder
    pickedAt?: SortOrder
    packedAt?: SortOrder
  }

  export type OrderItemSumOrderByAggregateInput = {
    id?: SortOrder
    orderId?: SortOrder
    productId?: SortOrder
    qty?: SortOrder
  }

  export type EnumWarehouseWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.Warehouse | EnumWarehouseFieldRefInput<$PrismaModel>
    in?: $Enums.Warehouse[]
    notIn?: $Enums.Warehouse[]
    not?: NestedEnumWarehouseWithAggregatesFilter<$PrismaModel> | $Enums.Warehouse
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumWarehouseFilter<$PrismaModel>
    _max?: NestedEnumWarehouseFilter<$PrismaModel>
  }

  export type EnumSequenceStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.SequenceStatus | EnumSequenceStatusFieldRefInput<$PrismaModel>
    in?: $Enums.SequenceStatus[]
    notIn?: $Enums.SequenceStatus[]
    not?: NestedEnumSequenceStatusFilter<$PrismaModel> | $Enums.SequenceStatus
  }

  export type UserMetaRelationFilter = {
    is?: UserMetaWhereInput
    isNot?: UserMetaWhereInput
  }

  export type SequenceCountOrderByAggregateInput = {
    id?: SortOrder
    mode?: SortOrder
    createdById?: SortOrder
    createdAt?: SortOrder
    closedAt?: SortOrder
    b1ClosedAt?: SortOrder
    b2ClosedAt?: SortOrder
    expectedBags?: SortOrder
    actualBags?: SortOrder
    status?: SortOrder
  }

  export type SequenceAvgOrderByAggregateInput = {
    id?: SortOrder
    createdById?: SortOrder
    expectedBags?: SortOrder
    actualBags?: SortOrder
  }

  export type SequenceMaxOrderByAggregateInput = {
    id?: SortOrder
    mode?: SortOrder
    createdById?: SortOrder
    createdAt?: SortOrder
    closedAt?: SortOrder
    b1ClosedAt?: SortOrder
    b2ClosedAt?: SortOrder
    expectedBags?: SortOrder
    actualBags?: SortOrder
    status?: SortOrder
  }

  export type SequenceMinOrderByAggregateInput = {
    id?: SortOrder
    mode?: SortOrder
    createdById?: SortOrder
    createdAt?: SortOrder
    closedAt?: SortOrder
    b1ClosedAt?: SortOrder
    b2ClosedAt?: SortOrder
    expectedBags?: SortOrder
    actualBags?: SortOrder
    status?: SortOrder
  }

  export type SequenceSumOrderByAggregateInput = {
    id?: SortOrder
    createdById?: SortOrder
    expectedBags?: SortOrder
    actualBags?: SortOrder
  }

  export type EnumSequenceStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.SequenceStatus | EnumSequenceStatusFieldRefInput<$PrismaModel>
    in?: $Enums.SequenceStatus[]
    notIn?: $Enums.SequenceStatus[]
    not?: NestedEnumSequenceStatusWithAggregatesFilter<$PrismaModel> | $Enums.SequenceStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumSequenceStatusFilter<$PrismaModel>
    _max?: NestedEnumSequenceStatusFilter<$PrismaModel>
  }

  export type SequenceRelationFilter = {
    is?: SequenceWhereInput
    isNot?: SequenceWhereInput
  }

  export type SequenceOrderSequenceIdOrderIdCompoundUniqueInput = {
    sequenceId: number
    orderId: number
  }

  export type SequenceOrderCountOrderByAggregateInput = {
    sequenceId?: SortOrder
    orderId?: SortOrder
  }

  export type SequenceOrderAvgOrderByAggregateInput = {
    sequenceId?: SortOrder
    orderId?: SortOrder
  }

  export type SequenceOrderMaxOrderByAggregateInput = {
    sequenceId?: SortOrder
    orderId?: SortOrder
  }

  export type SequenceOrderMinOrderByAggregateInput = {
    sequenceId?: SortOrder
    orderId?: SortOrder
  }

  export type SequenceOrderSumOrderByAggregateInput = {
    sequenceId?: SortOrder
    orderId?: SortOrder
  }
  export type JsonNullableFilter<$PrismaModel = never> = 
    | PatchUndefined<
        Either<Required<JsonNullableFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonNullableFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonNullableFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonNullableFilterBase<$PrismaModel>>, 'path'>>

  export type JsonNullableFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue
    lte?: InputJsonValue
    gt?: InputJsonValue
    gte?: InputJsonValue
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
  }

  export type OrderNullableRelationFilter = {
    is?: OrderWhereInput | null
    isNot?: OrderWhereInput | null
  }

  export type EventCountOrderByAggregateInput = {
    id?: SortOrder
    type?: SortOrder
    actorId?: SortOrder
    orderId?: SortOrder
    payload?: SortOrder
    createdAt?: SortOrder
  }

  export type EventAvgOrderByAggregateInput = {
    id?: SortOrder
    actorId?: SortOrder
    orderId?: SortOrder
  }

  export type EventMaxOrderByAggregateInput = {
    id?: SortOrder
    type?: SortOrder
    actorId?: SortOrder
    orderId?: SortOrder
    createdAt?: SortOrder
  }

  export type EventMinOrderByAggregateInput = {
    id?: SortOrder
    type?: SortOrder
    actorId?: SortOrder
    orderId?: SortOrder
    createdAt?: SortOrder
  }

  export type EventSumOrderByAggregateInput = {
    id?: SortOrder
    actorId?: SortOrder
    orderId?: SortOrder
  }
  export type JsonNullableWithAggregatesFilter<$PrismaModel = never> = 
    | PatchUndefined<
        Either<Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>, 'path'>>

  export type JsonNullableWithAggregatesFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue
    lte?: InputJsonValue
    gt?: InputJsonValue
    gte?: InputJsonValue
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedJsonNullableFilter<$PrismaModel>
    _max?: NestedJsonNullableFilter<$PrismaModel>
  }

  export type SequenceCreateNestedManyWithoutCreatedByInput = {
    create?: XOR<SequenceCreateWithoutCreatedByInput, SequenceUncheckedCreateWithoutCreatedByInput> | SequenceCreateWithoutCreatedByInput[] | SequenceUncheckedCreateWithoutCreatedByInput[]
    connectOrCreate?: SequenceCreateOrConnectWithoutCreatedByInput | SequenceCreateOrConnectWithoutCreatedByInput[]
    createMany?: SequenceCreateManyCreatedByInputEnvelope
    connect?: SequenceWhereUniqueInput | SequenceWhereUniqueInput[]
  }

  export type OrderCreateNestedManyWithoutPackedByInput = {
    create?: XOR<OrderCreateWithoutPackedByInput, OrderUncheckedCreateWithoutPackedByInput> | OrderCreateWithoutPackedByInput[] | OrderUncheckedCreateWithoutPackedByInput[]
    connectOrCreate?: OrderCreateOrConnectWithoutPackedByInput | OrderCreateOrConnectWithoutPackedByInput[]
    createMany?: OrderCreateManyPackedByInputEnvelope
    connect?: OrderWhereUniqueInput | OrderWhereUniqueInput[]
  }

  export type EventCreateNestedManyWithoutActorInput = {
    create?: XOR<EventCreateWithoutActorInput, EventUncheckedCreateWithoutActorInput> | EventCreateWithoutActorInput[] | EventUncheckedCreateWithoutActorInput[]
    connectOrCreate?: EventCreateOrConnectWithoutActorInput | EventCreateOrConnectWithoutActorInput[]
    createMany?: EventCreateManyActorInputEnvelope
    connect?: EventWhereUniqueInput | EventWhereUniqueInput[]
  }

  export type SequenceUncheckedCreateNestedManyWithoutCreatedByInput = {
    create?: XOR<SequenceCreateWithoutCreatedByInput, SequenceUncheckedCreateWithoutCreatedByInput> | SequenceCreateWithoutCreatedByInput[] | SequenceUncheckedCreateWithoutCreatedByInput[]
    connectOrCreate?: SequenceCreateOrConnectWithoutCreatedByInput | SequenceCreateOrConnectWithoutCreatedByInput[]
    createMany?: SequenceCreateManyCreatedByInputEnvelope
    connect?: SequenceWhereUniqueInput | SequenceWhereUniqueInput[]
  }

  export type OrderUncheckedCreateNestedManyWithoutPackedByInput = {
    create?: XOR<OrderCreateWithoutPackedByInput, OrderUncheckedCreateWithoutPackedByInput> | OrderCreateWithoutPackedByInput[] | OrderUncheckedCreateWithoutPackedByInput[]
    connectOrCreate?: OrderCreateOrConnectWithoutPackedByInput | OrderCreateOrConnectWithoutPackedByInput[]
    createMany?: OrderCreateManyPackedByInputEnvelope
    connect?: OrderWhereUniqueInput | OrderWhereUniqueInput[]
  }

  export type EventUncheckedCreateNestedManyWithoutActorInput = {
    create?: XOR<EventCreateWithoutActorInput, EventUncheckedCreateWithoutActorInput> | EventCreateWithoutActorInput[] | EventUncheckedCreateWithoutActorInput[]
    connectOrCreate?: EventCreateOrConnectWithoutActorInput | EventCreateOrConnectWithoutActorInput[]
    createMany?: EventCreateManyActorInputEnvelope
    connect?: EventWhereUniqueInput | EventWhereUniqueInput[]
  }

  export type IntFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type StringFieldUpdateOperationsInput = {
    set?: string
  }

  export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null
  }

  export type BoolFieldUpdateOperationsInput = {
    set?: boolean
  }

  export type NullableDateTimeFieldUpdateOperationsInput = {
    set?: Date | string | null
  }

  export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string
  }

  export type SequenceUpdateManyWithoutCreatedByNestedInput = {
    create?: XOR<SequenceCreateWithoutCreatedByInput, SequenceUncheckedCreateWithoutCreatedByInput> | SequenceCreateWithoutCreatedByInput[] | SequenceUncheckedCreateWithoutCreatedByInput[]
    connectOrCreate?: SequenceCreateOrConnectWithoutCreatedByInput | SequenceCreateOrConnectWithoutCreatedByInput[]
    upsert?: SequenceUpsertWithWhereUniqueWithoutCreatedByInput | SequenceUpsertWithWhereUniqueWithoutCreatedByInput[]
    createMany?: SequenceCreateManyCreatedByInputEnvelope
    set?: SequenceWhereUniqueInput | SequenceWhereUniqueInput[]
    disconnect?: SequenceWhereUniqueInput | SequenceWhereUniqueInput[]
    delete?: SequenceWhereUniqueInput | SequenceWhereUniqueInput[]
    connect?: SequenceWhereUniqueInput | SequenceWhereUniqueInput[]
    update?: SequenceUpdateWithWhereUniqueWithoutCreatedByInput | SequenceUpdateWithWhereUniqueWithoutCreatedByInput[]
    updateMany?: SequenceUpdateManyWithWhereWithoutCreatedByInput | SequenceUpdateManyWithWhereWithoutCreatedByInput[]
    deleteMany?: SequenceScalarWhereInput | SequenceScalarWhereInput[]
  }

  export type OrderUpdateManyWithoutPackedByNestedInput = {
    create?: XOR<OrderCreateWithoutPackedByInput, OrderUncheckedCreateWithoutPackedByInput> | OrderCreateWithoutPackedByInput[] | OrderUncheckedCreateWithoutPackedByInput[]
    connectOrCreate?: OrderCreateOrConnectWithoutPackedByInput | OrderCreateOrConnectWithoutPackedByInput[]
    upsert?: OrderUpsertWithWhereUniqueWithoutPackedByInput | OrderUpsertWithWhereUniqueWithoutPackedByInput[]
    createMany?: OrderCreateManyPackedByInputEnvelope
    set?: OrderWhereUniqueInput | OrderWhereUniqueInput[]
    disconnect?: OrderWhereUniqueInput | OrderWhereUniqueInput[]
    delete?: OrderWhereUniqueInput | OrderWhereUniqueInput[]
    connect?: OrderWhereUniqueInput | OrderWhereUniqueInput[]
    update?: OrderUpdateWithWhereUniqueWithoutPackedByInput | OrderUpdateWithWhereUniqueWithoutPackedByInput[]
    updateMany?: OrderUpdateManyWithWhereWithoutPackedByInput | OrderUpdateManyWithWhereWithoutPackedByInput[]
    deleteMany?: OrderScalarWhereInput | OrderScalarWhereInput[]
  }

  export type EventUpdateManyWithoutActorNestedInput = {
    create?: XOR<EventCreateWithoutActorInput, EventUncheckedCreateWithoutActorInput> | EventCreateWithoutActorInput[] | EventUncheckedCreateWithoutActorInput[]
    connectOrCreate?: EventCreateOrConnectWithoutActorInput | EventCreateOrConnectWithoutActorInput[]
    upsert?: EventUpsertWithWhereUniqueWithoutActorInput | EventUpsertWithWhereUniqueWithoutActorInput[]
    createMany?: EventCreateManyActorInputEnvelope
    set?: EventWhereUniqueInput | EventWhereUniqueInput[]
    disconnect?: EventWhereUniqueInput | EventWhereUniqueInput[]
    delete?: EventWhereUniqueInput | EventWhereUniqueInput[]
    connect?: EventWhereUniqueInput | EventWhereUniqueInput[]
    update?: EventUpdateWithWhereUniqueWithoutActorInput | EventUpdateWithWhereUniqueWithoutActorInput[]
    updateMany?: EventUpdateManyWithWhereWithoutActorInput | EventUpdateManyWithWhereWithoutActorInput[]
    deleteMany?: EventScalarWhereInput | EventScalarWhereInput[]
  }

  export type SequenceUncheckedUpdateManyWithoutCreatedByNestedInput = {
    create?: XOR<SequenceCreateWithoutCreatedByInput, SequenceUncheckedCreateWithoutCreatedByInput> | SequenceCreateWithoutCreatedByInput[] | SequenceUncheckedCreateWithoutCreatedByInput[]
    connectOrCreate?: SequenceCreateOrConnectWithoutCreatedByInput | SequenceCreateOrConnectWithoutCreatedByInput[]
    upsert?: SequenceUpsertWithWhereUniqueWithoutCreatedByInput | SequenceUpsertWithWhereUniqueWithoutCreatedByInput[]
    createMany?: SequenceCreateManyCreatedByInputEnvelope
    set?: SequenceWhereUniqueInput | SequenceWhereUniqueInput[]
    disconnect?: SequenceWhereUniqueInput | SequenceWhereUniqueInput[]
    delete?: SequenceWhereUniqueInput | SequenceWhereUniqueInput[]
    connect?: SequenceWhereUniqueInput | SequenceWhereUniqueInput[]
    update?: SequenceUpdateWithWhereUniqueWithoutCreatedByInput | SequenceUpdateWithWhereUniqueWithoutCreatedByInput[]
    updateMany?: SequenceUpdateManyWithWhereWithoutCreatedByInput | SequenceUpdateManyWithWhereWithoutCreatedByInput[]
    deleteMany?: SequenceScalarWhereInput | SequenceScalarWhereInput[]
  }

  export type OrderUncheckedUpdateManyWithoutPackedByNestedInput = {
    create?: XOR<OrderCreateWithoutPackedByInput, OrderUncheckedCreateWithoutPackedByInput> | OrderCreateWithoutPackedByInput[] | OrderUncheckedCreateWithoutPackedByInput[]
    connectOrCreate?: OrderCreateOrConnectWithoutPackedByInput | OrderCreateOrConnectWithoutPackedByInput[]
    upsert?: OrderUpsertWithWhereUniqueWithoutPackedByInput | OrderUpsertWithWhereUniqueWithoutPackedByInput[]
    createMany?: OrderCreateManyPackedByInputEnvelope
    set?: OrderWhereUniqueInput | OrderWhereUniqueInput[]
    disconnect?: OrderWhereUniqueInput | OrderWhereUniqueInput[]
    delete?: OrderWhereUniqueInput | OrderWhereUniqueInput[]
    connect?: OrderWhereUniqueInput | OrderWhereUniqueInput[]
    update?: OrderUpdateWithWhereUniqueWithoutPackedByInput | OrderUpdateWithWhereUniqueWithoutPackedByInput[]
    updateMany?: OrderUpdateManyWithWhereWithoutPackedByInput | OrderUpdateManyWithWhereWithoutPackedByInput[]
    deleteMany?: OrderScalarWhereInput | OrderScalarWhereInput[]
  }

  export type EventUncheckedUpdateManyWithoutActorNestedInput = {
    create?: XOR<EventCreateWithoutActorInput, EventUncheckedCreateWithoutActorInput> | EventCreateWithoutActorInput[] | EventUncheckedCreateWithoutActorInput[]
    connectOrCreate?: EventCreateOrConnectWithoutActorInput | EventCreateOrConnectWithoutActorInput[]
    upsert?: EventUpsertWithWhereUniqueWithoutActorInput | EventUpsertWithWhereUniqueWithoutActorInput[]
    createMany?: EventCreateManyActorInputEnvelope
    set?: EventWhereUniqueInput | EventWhereUniqueInput[]
    disconnect?: EventWhereUniqueInput | EventWhereUniqueInput[]
    delete?: EventWhereUniqueInput | EventWhereUniqueInput[]
    connect?: EventWhereUniqueInput | EventWhereUniqueInput[]
    update?: EventUpdateWithWhereUniqueWithoutActorInput | EventUpdateWithWhereUniqueWithoutActorInput[]
    updateMany?: EventUpdateManyWithWhereWithoutActorInput | EventUpdateManyWithWhereWithoutActorInput[]
    deleteMany?: EventScalarWhereInput | EventScalarWhereInput[]
  }

  export type OrderItemCreateNestedManyWithoutProductInput = {
    create?: XOR<OrderItemCreateWithoutProductInput, OrderItemUncheckedCreateWithoutProductInput> | OrderItemCreateWithoutProductInput[] | OrderItemUncheckedCreateWithoutProductInput[]
    connectOrCreate?: OrderItemCreateOrConnectWithoutProductInput | OrderItemCreateOrConnectWithoutProductInput[]
    createMany?: OrderItemCreateManyProductInputEnvelope
    connect?: OrderItemWhereUniqueInput | OrderItemWhereUniqueInput[]
  }

  export type OrderItemUncheckedCreateNestedManyWithoutProductInput = {
    create?: XOR<OrderItemCreateWithoutProductInput, OrderItemUncheckedCreateWithoutProductInput> | OrderItemCreateWithoutProductInput[] | OrderItemUncheckedCreateWithoutProductInput[]
    connectOrCreate?: OrderItemCreateOrConnectWithoutProductInput | OrderItemCreateOrConnectWithoutProductInput[]
    createMany?: OrderItemCreateManyProductInputEnvelope
    connect?: OrderItemWhereUniqueInput | OrderItemWhereUniqueInput[]
  }

  export type NullableEnumWarehouseFieldUpdateOperationsInput = {
    set?: $Enums.Warehouse | null
  }

  export type OrderItemUpdateManyWithoutProductNestedInput = {
    create?: XOR<OrderItemCreateWithoutProductInput, OrderItemUncheckedCreateWithoutProductInput> | OrderItemCreateWithoutProductInput[] | OrderItemUncheckedCreateWithoutProductInput[]
    connectOrCreate?: OrderItemCreateOrConnectWithoutProductInput | OrderItemCreateOrConnectWithoutProductInput[]
    upsert?: OrderItemUpsertWithWhereUniqueWithoutProductInput | OrderItemUpsertWithWhereUniqueWithoutProductInput[]
    createMany?: OrderItemCreateManyProductInputEnvelope
    set?: OrderItemWhereUniqueInput | OrderItemWhereUniqueInput[]
    disconnect?: OrderItemWhereUniqueInput | OrderItemWhereUniqueInput[]
    delete?: OrderItemWhereUniqueInput | OrderItemWhereUniqueInput[]
    connect?: OrderItemWhereUniqueInput | OrderItemWhereUniqueInput[]
    update?: OrderItemUpdateWithWhereUniqueWithoutProductInput | OrderItemUpdateWithWhereUniqueWithoutProductInput[]
    updateMany?: OrderItemUpdateManyWithWhereWithoutProductInput | OrderItemUpdateManyWithWhereWithoutProductInput[]
    deleteMany?: OrderItemScalarWhereInput | OrderItemScalarWhereInput[]
  }

  export type OrderItemUncheckedUpdateManyWithoutProductNestedInput = {
    create?: XOR<OrderItemCreateWithoutProductInput, OrderItemUncheckedCreateWithoutProductInput> | OrderItemCreateWithoutProductInput[] | OrderItemUncheckedCreateWithoutProductInput[]
    connectOrCreate?: OrderItemCreateOrConnectWithoutProductInput | OrderItemCreateOrConnectWithoutProductInput[]
    upsert?: OrderItemUpsertWithWhereUniqueWithoutProductInput | OrderItemUpsertWithWhereUniqueWithoutProductInput[]
    createMany?: OrderItemCreateManyProductInputEnvelope
    set?: OrderItemWhereUniqueInput | OrderItemWhereUniqueInput[]
    disconnect?: OrderItemWhereUniqueInput | OrderItemWhereUniqueInput[]
    delete?: OrderItemWhereUniqueInput | OrderItemWhereUniqueInput[]
    connect?: OrderItemWhereUniqueInput | OrderItemWhereUniqueInput[]
    update?: OrderItemUpdateWithWhereUniqueWithoutProductInput | OrderItemUpdateWithWhereUniqueWithoutProductInput[]
    updateMany?: OrderItemUpdateManyWithWhereWithoutProductInput | OrderItemUpdateManyWithWhereWithoutProductInput[]
    deleteMany?: OrderItemScalarWhereInput | OrderItemScalarWhereInput[]
  }

  export type UserMetaCreateNestedOneWithoutPackedOrdersInput = {
    create?: XOR<UserMetaCreateWithoutPackedOrdersInput, UserMetaUncheckedCreateWithoutPackedOrdersInput>
    connectOrCreate?: UserMetaCreateOrConnectWithoutPackedOrdersInput
    connect?: UserMetaWhereUniqueInput
  }

  export type OrderItemCreateNestedManyWithoutOrderInput = {
    create?: XOR<OrderItemCreateWithoutOrderInput, OrderItemUncheckedCreateWithoutOrderInput> | OrderItemCreateWithoutOrderInput[] | OrderItemUncheckedCreateWithoutOrderInput[]
    connectOrCreate?: OrderItemCreateOrConnectWithoutOrderInput | OrderItemCreateOrConnectWithoutOrderInput[]
    createMany?: OrderItemCreateManyOrderInputEnvelope
    connect?: OrderItemWhereUniqueInput | OrderItemWhereUniqueInput[]
  }

  export type SequenceOrderCreateNestedManyWithoutOrderInput = {
    create?: XOR<SequenceOrderCreateWithoutOrderInput, SequenceOrderUncheckedCreateWithoutOrderInput> | SequenceOrderCreateWithoutOrderInput[] | SequenceOrderUncheckedCreateWithoutOrderInput[]
    connectOrCreate?: SequenceOrderCreateOrConnectWithoutOrderInput | SequenceOrderCreateOrConnectWithoutOrderInput[]
    createMany?: SequenceOrderCreateManyOrderInputEnvelope
    connect?: SequenceOrderWhereUniqueInput | SequenceOrderWhereUniqueInput[]
  }

  export type EventCreateNestedManyWithoutOrderInput = {
    create?: XOR<EventCreateWithoutOrderInput, EventUncheckedCreateWithoutOrderInput> | EventCreateWithoutOrderInput[] | EventUncheckedCreateWithoutOrderInput[]
    connectOrCreate?: EventCreateOrConnectWithoutOrderInput | EventCreateOrConnectWithoutOrderInput[]
    createMany?: EventCreateManyOrderInputEnvelope
    connect?: EventWhereUniqueInput | EventWhereUniqueInput[]
  }

  export type OrderItemUncheckedCreateNestedManyWithoutOrderInput = {
    create?: XOR<OrderItemCreateWithoutOrderInput, OrderItemUncheckedCreateWithoutOrderInput> | OrderItemCreateWithoutOrderInput[] | OrderItemUncheckedCreateWithoutOrderInput[]
    connectOrCreate?: OrderItemCreateOrConnectWithoutOrderInput | OrderItemCreateOrConnectWithoutOrderInput[]
    createMany?: OrderItemCreateManyOrderInputEnvelope
    connect?: OrderItemWhereUniqueInput | OrderItemWhereUniqueInput[]
  }

  export type SequenceOrderUncheckedCreateNestedManyWithoutOrderInput = {
    create?: XOR<SequenceOrderCreateWithoutOrderInput, SequenceOrderUncheckedCreateWithoutOrderInput> | SequenceOrderCreateWithoutOrderInput[] | SequenceOrderUncheckedCreateWithoutOrderInput[]
    connectOrCreate?: SequenceOrderCreateOrConnectWithoutOrderInput | SequenceOrderCreateOrConnectWithoutOrderInput[]
    createMany?: SequenceOrderCreateManyOrderInputEnvelope
    connect?: SequenceOrderWhereUniqueInput | SequenceOrderWhereUniqueInput[]
  }

  export type EventUncheckedCreateNestedManyWithoutOrderInput = {
    create?: XOR<EventCreateWithoutOrderInput, EventUncheckedCreateWithoutOrderInput> | EventCreateWithoutOrderInput[] | EventUncheckedCreateWithoutOrderInput[]
    connectOrCreate?: EventCreateOrConnectWithoutOrderInput | EventCreateOrConnectWithoutOrderInput[]
    createMany?: EventCreateManyOrderInputEnvelope
    connect?: EventWhereUniqueInput | EventWhereUniqueInput[]
  }

  export type EnumOrderStatusFieldUpdateOperationsInput = {
    set?: $Enums.OrderStatus
  }

  export type NullableIntFieldUpdateOperationsInput = {
    set?: number | null
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type UserMetaUpdateOneWithoutPackedOrdersNestedInput = {
    create?: XOR<UserMetaCreateWithoutPackedOrdersInput, UserMetaUncheckedCreateWithoutPackedOrdersInput>
    connectOrCreate?: UserMetaCreateOrConnectWithoutPackedOrdersInput
    upsert?: UserMetaUpsertWithoutPackedOrdersInput
    disconnect?: UserMetaWhereInput | boolean
    delete?: UserMetaWhereInput | boolean
    connect?: UserMetaWhereUniqueInput
    update?: XOR<XOR<UserMetaUpdateToOneWithWhereWithoutPackedOrdersInput, UserMetaUpdateWithoutPackedOrdersInput>, UserMetaUncheckedUpdateWithoutPackedOrdersInput>
  }

  export type OrderItemUpdateManyWithoutOrderNestedInput = {
    create?: XOR<OrderItemCreateWithoutOrderInput, OrderItemUncheckedCreateWithoutOrderInput> | OrderItemCreateWithoutOrderInput[] | OrderItemUncheckedCreateWithoutOrderInput[]
    connectOrCreate?: OrderItemCreateOrConnectWithoutOrderInput | OrderItemCreateOrConnectWithoutOrderInput[]
    upsert?: OrderItemUpsertWithWhereUniqueWithoutOrderInput | OrderItemUpsertWithWhereUniqueWithoutOrderInput[]
    createMany?: OrderItemCreateManyOrderInputEnvelope
    set?: OrderItemWhereUniqueInput | OrderItemWhereUniqueInput[]
    disconnect?: OrderItemWhereUniqueInput | OrderItemWhereUniqueInput[]
    delete?: OrderItemWhereUniqueInput | OrderItemWhereUniqueInput[]
    connect?: OrderItemWhereUniqueInput | OrderItemWhereUniqueInput[]
    update?: OrderItemUpdateWithWhereUniqueWithoutOrderInput | OrderItemUpdateWithWhereUniqueWithoutOrderInput[]
    updateMany?: OrderItemUpdateManyWithWhereWithoutOrderInput | OrderItemUpdateManyWithWhereWithoutOrderInput[]
    deleteMany?: OrderItemScalarWhereInput | OrderItemScalarWhereInput[]
  }

  export type SequenceOrderUpdateManyWithoutOrderNestedInput = {
    create?: XOR<SequenceOrderCreateWithoutOrderInput, SequenceOrderUncheckedCreateWithoutOrderInput> | SequenceOrderCreateWithoutOrderInput[] | SequenceOrderUncheckedCreateWithoutOrderInput[]
    connectOrCreate?: SequenceOrderCreateOrConnectWithoutOrderInput | SequenceOrderCreateOrConnectWithoutOrderInput[]
    upsert?: SequenceOrderUpsertWithWhereUniqueWithoutOrderInput | SequenceOrderUpsertWithWhereUniqueWithoutOrderInput[]
    createMany?: SequenceOrderCreateManyOrderInputEnvelope
    set?: SequenceOrderWhereUniqueInput | SequenceOrderWhereUniqueInput[]
    disconnect?: SequenceOrderWhereUniqueInput | SequenceOrderWhereUniqueInput[]
    delete?: SequenceOrderWhereUniqueInput | SequenceOrderWhereUniqueInput[]
    connect?: SequenceOrderWhereUniqueInput | SequenceOrderWhereUniqueInput[]
    update?: SequenceOrderUpdateWithWhereUniqueWithoutOrderInput | SequenceOrderUpdateWithWhereUniqueWithoutOrderInput[]
    updateMany?: SequenceOrderUpdateManyWithWhereWithoutOrderInput | SequenceOrderUpdateManyWithWhereWithoutOrderInput[]
    deleteMany?: SequenceOrderScalarWhereInput | SequenceOrderScalarWhereInput[]
  }

  export type EventUpdateManyWithoutOrderNestedInput = {
    create?: XOR<EventCreateWithoutOrderInput, EventUncheckedCreateWithoutOrderInput> | EventCreateWithoutOrderInput[] | EventUncheckedCreateWithoutOrderInput[]
    connectOrCreate?: EventCreateOrConnectWithoutOrderInput | EventCreateOrConnectWithoutOrderInput[]
    upsert?: EventUpsertWithWhereUniqueWithoutOrderInput | EventUpsertWithWhereUniqueWithoutOrderInput[]
    createMany?: EventCreateManyOrderInputEnvelope
    set?: EventWhereUniqueInput | EventWhereUniqueInput[]
    disconnect?: EventWhereUniqueInput | EventWhereUniqueInput[]
    delete?: EventWhereUniqueInput | EventWhereUniqueInput[]
    connect?: EventWhereUniqueInput | EventWhereUniqueInput[]
    update?: EventUpdateWithWhereUniqueWithoutOrderInput | EventUpdateWithWhereUniqueWithoutOrderInput[]
    updateMany?: EventUpdateManyWithWhereWithoutOrderInput | EventUpdateManyWithWhereWithoutOrderInput[]
    deleteMany?: EventScalarWhereInput | EventScalarWhereInput[]
  }

  export type OrderItemUncheckedUpdateManyWithoutOrderNestedInput = {
    create?: XOR<OrderItemCreateWithoutOrderInput, OrderItemUncheckedCreateWithoutOrderInput> | OrderItemCreateWithoutOrderInput[] | OrderItemUncheckedCreateWithoutOrderInput[]
    connectOrCreate?: OrderItemCreateOrConnectWithoutOrderInput | OrderItemCreateOrConnectWithoutOrderInput[]
    upsert?: OrderItemUpsertWithWhereUniqueWithoutOrderInput | OrderItemUpsertWithWhereUniqueWithoutOrderInput[]
    createMany?: OrderItemCreateManyOrderInputEnvelope
    set?: OrderItemWhereUniqueInput | OrderItemWhereUniqueInput[]
    disconnect?: OrderItemWhereUniqueInput | OrderItemWhereUniqueInput[]
    delete?: OrderItemWhereUniqueInput | OrderItemWhereUniqueInput[]
    connect?: OrderItemWhereUniqueInput | OrderItemWhereUniqueInput[]
    update?: OrderItemUpdateWithWhereUniqueWithoutOrderInput | OrderItemUpdateWithWhereUniqueWithoutOrderInput[]
    updateMany?: OrderItemUpdateManyWithWhereWithoutOrderInput | OrderItemUpdateManyWithWhereWithoutOrderInput[]
    deleteMany?: OrderItemScalarWhereInput | OrderItemScalarWhereInput[]
  }

  export type SequenceOrderUncheckedUpdateManyWithoutOrderNestedInput = {
    create?: XOR<SequenceOrderCreateWithoutOrderInput, SequenceOrderUncheckedCreateWithoutOrderInput> | SequenceOrderCreateWithoutOrderInput[] | SequenceOrderUncheckedCreateWithoutOrderInput[]
    connectOrCreate?: SequenceOrderCreateOrConnectWithoutOrderInput | SequenceOrderCreateOrConnectWithoutOrderInput[]
    upsert?: SequenceOrderUpsertWithWhereUniqueWithoutOrderInput | SequenceOrderUpsertWithWhereUniqueWithoutOrderInput[]
    createMany?: SequenceOrderCreateManyOrderInputEnvelope
    set?: SequenceOrderWhereUniqueInput | SequenceOrderWhereUniqueInput[]
    disconnect?: SequenceOrderWhereUniqueInput | SequenceOrderWhereUniqueInput[]
    delete?: SequenceOrderWhereUniqueInput | SequenceOrderWhereUniqueInput[]
    connect?: SequenceOrderWhereUniqueInput | SequenceOrderWhereUniqueInput[]
    update?: SequenceOrderUpdateWithWhereUniqueWithoutOrderInput | SequenceOrderUpdateWithWhereUniqueWithoutOrderInput[]
    updateMany?: SequenceOrderUpdateManyWithWhereWithoutOrderInput | SequenceOrderUpdateManyWithWhereWithoutOrderInput[]
    deleteMany?: SequenceOrderScalarWhereInput | SequenceOrderScalarWhereInput[]
  }

  export type EventUncheckedUpdateManyWithoutOrderNestedInput = {
    create?: XOR<EventCreateWithoutOrderInput, EventUncheckedCreateWithoutOrderInput> | EventCreateWithoutOrderInput[] | EventUncheckedCreateWithoutOrderInput[]
    connectOrCreate?: EventCreateOrConnectWithoutOrderInput | EventCreateOrConnectWithoutOrderInput[]
    upsert?: EventUpsertWithWhereUniqueWithoutOrderInput | EventUpsertWithWhereUniqueWithoutOrderInput[]
    createMany?: EventCreateManyOrderInputEnvelope
    set?: EventWhereUniqueInput | EventWhereUniqueInput[]
    disconnect?: EventWhereUniqueInput | EventWhereUniqueInput[]
    delete?: EventWhereUniqueInput | EventWhereUniqueInput[]
    connect?: EventWhereUniqueInput | EventWhereUniqueInput[]
    update?: EventUpdateWithWhereUniqueWithoutOrderInput | EventUpdateWithWhereUniqueWithoutOrderInput[]
    updateMany?: EventUpdateManyWithWhereWithoutOrderInput | EventUpdateManyWithWhereWithoutOrderInput[]
    deleteMany?: EventScalarWhereInput | EventScalarWhereInput[]
  }

  export type OrderCreateNestedOneWithoutItemsInput = {
    create?: XOR<OrderCreateWithoutItemsInput, OrderUncheckedCreateWithoutItemsInput>
    connectOrCreate?: OrderCreateOrConnectWithoutItemsInput
    connect?: OrderWhereUniqueInput
  }

  export type ProductMetaCreateNestedOneWithoutOrderItemsInput = {
    create?: XOR<ProductMetaCreateWithoutOrderItemsInput, ProductMetaUncheckedCreateWithoutOrderItemsInput>
    connectOrCreate?: ProductMetaCreateOrConnectWithoutOrderItemsInput
    connect?: ProductMetaWhereUniqueInput
  }

  export type EnumWarehouseFieldUpdateOperationsInput = {
    set?: $Enums.Warehouse
  }

  export type OrderUpdateOneRequiredWithoutItemsNestedInput = {
    create?: XOR<OrderCreateWithoutItemsInput, OrderUncheckedCreateWithoutItemsInput>
    connectOrCreate?: OrderCreateOrConnectWithoutItemsInput
    upsert?: OrderUpsertWithoutItemsInput
    connect?: OrderWhereUniqueInput
    update?: XOR<XOR<OrderUpdateToOneWithWhereWithoutItemsInput, OrderUpdateWithoutItemsInput>, OrderUncheckedUpdateWithoutItemsInput>
  }

  export type ProductMetaUpdateOneRequiredWithoutOrderItemsNestedInput = {
    create?: XOR<ProductMetaCreateWithoutOrderItemsInput, ProductMetaUncheckedCreateWithoutOrderItemsInput>
    connectOrCreate?: ProductMetaCreateOrConnectWithoutOrderItemsInput
    upsert?: ProductMetaUpsertWithoutOrderItemsInput
    connect?: ProductMetaWhereUniqueInput
    update?: XOR<XOR<ProductMetaUpdateToOneWithWhereWithoutOrderItemsInput, ProductMetaUpdateWithoutOrderItemsInput>, ProductMetaUncheckedUpdateWithoutOrderItemsInput>
  }

  export type UserMetaCreateNestedOneWithoutSequencesCreatedInput = {
    create?: XOR<UserMetaCreateWithoutSequencesCreatedInput, UserMetaUncheckedCreateWithoutSequencesCreatedInput>
    connectOrCreate?: UserMetaCreateOrConnectWithoutSequencesCreatedInput
    connect?: UserMetaWhereUniqueInput
  }

  export type SequenceOrderCreateNestedManyWithoutSequenceInput = {
    create?: XOR<SequenceOrderCreateWithoutSequenceInput, SequenceOrderUncheckedCreateWithoutSequenceInput> | SequenceOrderCreateWithoutSequenceInput[] | SequenceOrderUncheckedCreateWithoutSequenceInput[]
    connectOrCreate?: SequenceOrderCreateOrConnectWithoutSequenceInput | SequenceOrderCreateOrConnectWithoutSequenceInput[]
    createMany?: SequenceOrderCreateManySequenceInputEnvelope
    connect?: SequenceOrderWhereUniqueInput | SequenceOrderWhereUniqueInput[]
  }

  export type SequenceOrderUncheckedCreateNestedManyWithoutSequenceInput = {
    create?: XOR<SequenceOrderCreateWithoutSequenceInput, SequenceOrderUncheckedCreateWithoutSequenceInput> | SequenceOrderCreateWithoutSequenceInput[] | SequenceOrderUncheckedCreateWithoutSequenceInput[]
    connectOrCreate?: SequenceOrderCreateOrConnectWithoutSequenceInput | SequenceOrderCreateOrConnectWithoutSequenceInput[]
    createMany?: SequenceOrderCreateManySequenceInputEnvelope
    connect?: SequenceOrderWhereUniqueInput | SequenceOrderWhereUniqueInput[]
  }

  export type EnumSequenceStatusFieldUpdateOperationsInput = {
    set?: $Enums.SequenceStatus
  }

  export type UserMetaUpdateOneRequiredWithoutSequencesCreatedNestedInput = {
    create?: XOR<UserMetaCreateWithoutSequencesCreatedInput, UserMetaUncheckedCreateWithoutSequencesCreatedInput>
    connectOrCreate?: UserMetaCreateOrConnectWithoutSequencesCreatedInput
    upsert?: UserMetaUpsertWithoutSequencesCreatedInput
    connect?: UserMetaWhereUniqueInput
    update?: XOR<XOR<UserMetaUpdateToOneWithWhereWithoutSequencesCreatedInput, UserMetaUpdateWithoutSequencesCreatedInput>, UserMetaUncheckedUpdateWithoutSequencesCreatedInput>
  }

  export type SequenceOrderUpdateManyWithoutSequenceNestedInput = {
    create?: XOR<SequenceOrderCreateWithoutSequenceInput, SequenceOrderUncheckedCreateWithoutSequenceInput> | SequenceOrderCreateWithoutSequenceInput[] | SequenceOrderUncheckedCreateWithoutSequenceInput[]
    connectOrCreate?: SequenceOrderCreateOrConnectWithoutSequenceInput | SequenceOrderCreateOrConnectWithoutSequenceInput[]
    upsert?: SequenceOrderUpsertWithWhereUniqueWithoutSequenceInput | SequenceOrderUpsertWithWhereUniqueWithoutSequenceInput[]
    createMany?: SequenceOrderCreateManySequenceInputEnvelope
    set?: SequenceOrderWhereUniqueInput | SequenceOrderWhereUniqueInput[]
    disconnect?: SequenceOrderWhereUniqueInput | SequenceOrderWhereUniqueInput[]
    delete?: SequenceOrderWhereUniqueInput | SequenceOrderWhereUniqueInput[]
    connect?: SequenceOrderWhereUniqueInput | SequenceOrderWhereUniqueInput[]
    update?: SequenceOrderUpdateWithWhereUniqueWithoutSequenceInput | SequenceOrderUpdateWithWhereUniqueWithoutSequenceInput[]
    updateMany?: SequenceOrderUpdateManyWithWhereWithoutSequenceInput | SequenceOrderUpdateManyWithWhereWithoutSequenceInput[]
    deleteMany?: SequenceOrderScalarWhereInput | SequenceOrderScalarWhereInput[]
  }

  export type SequenceOrderUncheckedUpdateManyWithoutSequenceNestedInput = {
    create?: XOR<SequenceOrderCreateWithoutSequenceInput, SequenceOrderUncheckedCreateWithoutSequenceInput> | SequenceOrderCreateWithoutSequenceInput[] | SequenceOrderUncheckedCreateWithoutSequenceInput[]
    connectOrCreate?: SequenceOrderCreateOrConnectWithoutSequenceInput | SequenceOrderCreateOrConnectWithoutSequenceInput[]
    upsert?: SequenceOrderUpsertWithWhereUniqueWithoutSequenceInput | SequenceOrderUpsertWithWhereUniqueWithoutSequenceInput[]
    createMany?: SequenceOrderCreateManySequenceInputEnvelope
    set?: SequenceOrderWhereUniqueInput | SequenceOrderWhereUniqueInput[]
    disconnect?: SequenceOrderWhereUniqueInput | SequenceOrderWhereUniqueInput[]
    delete?: SequenceOrderWhereUniqueInput | SequenceOrderWhereUniqueInput[]
    connect?: SequenceOrderWhereUniqueInput | SequenceOrderWhereUniqueInput[]
    update?: SequenceOrderUpdateWithWhereUniqueWithoutSequenceInput | SequenceOrderUpdateWithWhereUniqueWithoutSequenceInput[]
    updateMany?: SequenceOrderUpdateManyWithWhereWithoutSequenceInput | SequenceOrderUpdateManyWithWhereWithoutSequenceInput[]
    deleteMany?: SequenceOrderScalarWhereInput | SequenceOrderScalarWhereInput[]
  }

  export type SequenceCreateNestedOneWithoutOrdersInput = {
    create?: XOR<SequenceCreateWithoutOrdersInput, SequenceUncheckedCreateWithoutOrdersInput>
    connectOrCreate?: SequenceCreateOrConnectWithoutOrdersInput
    connect?: SequenceWhereUniqueInput
  }

  export type OrderCreateNestedOneWithoutSequenceLinksInput = {
    create?: XOR<OrderCreateWithoutSequenceLinksInput, OrderUncheckedCreateWithoutSequenceLinksInput>
    connectOrCreate?: OrderCreateOrConnectWithoutSequenceLinksInput
    connect?: OrderWhereUniqueInput
  }

  export type SequenceUpdateOneRequiredWithoutOrdersNestedInput = {
    create?: XOR<SequenceCreateWithoutOrdersInput, SequenceUncheckedCreateWithoutOrdersInput>
    connectOrCreate?: SequenceCreateOrConnectWithoutOrdersInput
    upsert?: SequenceUpsertWithoutOrdersInput
    connect?: SequenceWhereUniqueInput
    update?: XOR<XOR<SequenceUpdateToOneWithWhereWithoutOrdersInput, SequenceUpdateWithoutOrdersInput>, SequenceUncheckedUpdateWithoutOrdersInput>
  }

  export type OrderUpdateOneRequiredWithoutSequenceLinksNestedInput = {
    create?: XOR<OrderCreateWithoutSequenceLinksInput, OrderUncheckedCreateWithoutSequenceLinksInput>
    connectOrCreate?: OrderCreateOrConnectWithoutSequenceLinksInput
    upsert?: OrderUpsertWithoutSequenceLinksInput
    connect?: OrderWhereUniqueInput
    update?: XOR<XOR<OrderUpdateToOneWithWhereWithoutSequenceLinksInput, OrderUpdateWithoutSequenceLinksInput>, OrderUncheckedUpdateWithoutSequenceLinksInput>
  }

  export type UserMetaCreateNestedOneWithoutEventsInput = {
    create?: XOR<UserMetaCreateWithoutEventsInput, UserMetaUncheckedCreateWithoutEventsInput>
    connectOrCreate?: UserMetaCreateOrConnectWithoutEventsInput
    connect?: UserMetaWhereUniqueInput
  }

  export type OrderCreateNestedOneWithoutEventsInput = {
    create?: XOR<OrderCreateWithoutEventsInput, OrderUncheckedCreateWithoutEventsInput>
    connectOrCreate?: OrderCreateOrConnectWithoutEventsInput
    connect?: OrderWhereUniqueInput
  }

  export type UserMetaUpdateOneWithoutEventsNestedInput = {
    create?: XOR<UserMetaCreateWithoutEventsInput, UserMetaUncheckedCreateWithoutEventsInput>
    connectOrCreate?: UserMetaCreateOrConnectWithoutEventsInput
    upsert?: UserMetaUpsertWithoutEventsInput
    disconnect?: UserMetaWhereInput | boolean
    delete?: UserMetaWhereInput | boolean
    connect?: UserMetaWhereUniqueInput
    update?: XOR<XOR<UserMetaUpdateToOneWithWhereWithoutEventsInput, UserMetaUpdateWithoutEventsInput>, UserMetaUncheckedUpdateWithoutEventsInput>
  }

  export type OrderUpdateOneWithoutEventsNestedInput = {
    create?: XOR<OrderCreateWithoutEventsInput, OrderUncheckedCreateWithoutEventsInput>
    connectOrCreate?: OrderCreateOrConnectWithoutEventsInput
    upsert?: OrderUpsertWithoutEventsInput
    disconnect?: OrderWhereInput | boolean
    delete?: OrderWhereInput | boolean
    connect?: OrderWhereUniqueInput
    update?: XOR<XOR<OrderUpdateToOneWithWhereWithoutEventsInput, OrderUpdateWithoutEventsInput>, OrderUncheckedUpdateWithoutEventsInput>
  }

  export type NestedIntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[]
    notIn?: number[]
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type NestedStringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[]
    notIn?: string[]
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type NestedStringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | null
    notIn?: string[] | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type NestedBoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type NestedDateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | null
    notIn?: Date[] | string[] | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type NestedDateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[]
    notIn?: Date[] | string[]
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type NestedIntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[]
    notIn?: number[]
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type NestedFloatFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[]
    notIn?: number[]
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatFilter<$PrismaModel> | number
  }

  export type NestedStringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[]
    notIn?: string[]
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type NestedStringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | null
    notIn?: string[] | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type NestedIntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | null
    notIn?: number[] | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }
  export type NestedJsonFilter<$PrismaModel = never> = 
    | PatchUndefined<
        Either<Required<NestedJsonFilterBase<$PrismaModel>>, Exclude<keyof Required<NestedJsonFilterBase<$PrismaModel>>, 'path'>>,
        Required<NestedJsonFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<NestedJsonFilterBase<$PrismaModel>>, 'path'>>

  export type NestedJsonFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue
    lte?: InputJsonValue
    gt?: InputJsonValue
    gte?: InputJsonValue
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
  }

  export type NestedBoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type NestedDateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | null
    notIn?: Date[] | string[] | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }

  export type NestedDateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[]
    notIn?: Date[] | string[]
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type NestedEnumWarehouseNullableFilter<$PrismaModel = never> = {
    equals?: $Enums.Warehouse | EnumWarehouseFieldRefInput<$PrismaModel> | null
    in?: $Enums.Warehouse[] | null
    notIn?: $Enums.Warehouse[] | null
    not?: NestedEnumWarehouseNullableFilter<$PrismaModel> | $Enums.Warehouse | null
  }

  export type NestedEnumWarehouseNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.Warehouse | EnumWarehouseFieldRefInput<$PrismaModel> | null
    in?: $Enums.Warehouse[] | null
    notIn?: $Enums.Warehouse[] | null
    not?: NestedEnumWarehouseNullableWithAggregatesFilter<$PrismaModel> | $Enums.Warehouse | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedEnumWarehouseNullableFilter<$PrismaModel>
    _max?: NestedEnumWarehouseNullableFilter<$PrismaModel>
  }

  export type NestedEnumOrderStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.OrderStatus | EnumOrderStatusFieldRefInput<$PrismaModel>
    in?: $Enums.OrderStatus[]
    notIn?: $Enums.OrderStatus[]
    not?: NestedEnumOrderStatusFilter<$PrismaModel> | $Enums.OrderStatus
  }

  export type NestedEnumOrderStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.OrderStatus | EnumOrderStatusFieldRefInput<$PrismaModel>
    in?: $Enums.OrderStatus[]
    notIn?: $Enums.OrderStatus[]
    not?: NestedEnumOrderStatusWithAggregatesFilter<$PrismaModel> | $Enums.OrderStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumOrderStatusFilter<$PrismaModel>
    _max?: NestedEnumOrderStatusFilter<$PrismaModel>
  }

  export type NestedIntNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | null
    notIn?: number[] | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedIntNullableFilter<$PrismaModel>
    _max?: NestedIntNullableFilter<$PrismaModel>
  }

  export type NestedFloatNullableFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | null
    notIn?: number[] | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableFilter<$PrismaModel> | number | null
  }

  export type NestedEnumWarehouseFilter<$PrismaModel = never> = {
    equals?: $Enums.Warehouse | EnumWarehouseFieldRefInput<$PrismaModel>
    in?: $Enums.Warehouse[]
    notIn?: $Enums.Warehouse[]
    not?: NestedEnumWarehouseFilter<$PrismaModel> | $Enums.Warehouse
  }

  export type NestedEnumWarehouseWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.Warehouse | EnumWarehouseFieldRefInput<$PrismaModel>
    in?: $Enums.Warehouse[]
    notIn?: $Enums.Warehouse[]
    not?: NestedEnumWarehouseWithAggregatesFilter<$PrismaModel> | $Enums.Warehouse
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumWarehouseFilter<$PrismaModel>
    _max?: NestedEnumWarehouseFilter<$PrismaModel>
  }

  export type NestedEnumSequenceStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.SequenceStatus | EnumSequenceStatusFieldRefInput<$PrismaModel>
    in?: $Enums.SequenceStatus[]
    notIn?: $Enums.SequenceStatus[]
    not?: NestedEnumSequenceStatusFilter<$PrismaModel> | $Enums.SequenceStatus
  }

  export type NestedEnumSequenceStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.SequenceStatus | EnumSequenceStatusFieldRefInput<$PrismaModel>
    in?: $Enums.SequenceStatus[]
    notIn?: $Enums.SequenceStatus[]
    not?: NestedEnumSequenceStatusWithAggregatesFilter<$PrismaModel> | $Enums.SequenceStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumSequenceStatusFilter<$PrismaModel>
    _max?: NestedEnumSequenceStatusFilter<$PrismaModel>
  }
  export type NestedJsonNullableFilter<$PrismaModel = never> = 
    | PatchUndefined<
        Either<Required<NestedJsonNullableFilterBase<$PrismaModel>>, Exclude<keyof Required<NestedJsonNullableFilterBase<$PrismaModel>>, 'path'>>,
        Required<NestedJsonNullableFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<NestedJsonNullableFilterBase<$PrismaModel>>, 'path'>>

  export type NestedJsonNullableFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue
    lte?: InputJsonValue
    gt?: InputJsonValue
    gte?: InputJsonValue
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
  }

  export type SequenceCreateWithoutCreatedByInput = {
    mode?: string
    createdAt?: Date | string
    closedAt?: Date | string | null
    b1ClosedAt?: Date | string | null
    b2ClosedAt?: Date | string | null
    expectedBags?: number
    actualBags?: number
    status?: $Enums.SequenceStatus
    orders?: SequenceOrderCreateNestedManyWithoutSequenceInput
  }

  export type SequenceUncheckedCreateWithoutCreatedByInput = {
    id?: number
    mode?: string
    createdAt?: Date | string
    closedAt?: Date | string | null
    b1ClosedAt?: Date | string | null
    b2ClosedAt?: Date | string | null
    expectedBags?: number
    actualBags?: number
    status?: $Enums.SequenceStatus
    orders?: SequenceOrderUncheckedCreateNestedManyWithoutSequenceInput
  }

  export type SequenceCreateOrConnectWithoutCreatedByInput = {
    where: SequenceWhereUniqueInput
    create: XOR<SequenceCreateWithoutCreatedByInput, SequenceUncheckedCreateWithoutCreatedByInput>
  }

  export type SequenceCreateManyCreatedByInputEnvelope = {
    data: SequenceCreateManyCreatedByInput | SequenceCreateManyCreatedByInput[]
    skipDuplicates?: boolean
  }

  export type OrderCreateWithoutPackedByInput = {
    wpOrderId: number
    number: string
    status?: $Enums.OrderStatus
    route?: string | null
    stopPosition?: number | null
    customerName?: string | null
    customerAddress?: string | null
    hasB2Pending?: boolean
    bagsExpected?: number
    packedAt?: Date | string | null
    classifiedAt?: Date | string | null
    loadedAt?: Date | string | null
    deliveredAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    items?: OrderItemCreateNestedManyWithoutOrderInput
    sequenceLinks?: SequenceOrderCreateNestedManyWithoutOrderInput
    events?: EventCreateNestedManyWithoutOrderInput
  }

  export type OrderUncheckedCreateWithoutPackedByInput = {
    id?: number
    wpOrderId: number
    number: string
    status?: $Enums.OrderStatus
    route?: string | null
    stopPosition?: number | null
    customerName?: string | null
    customerAddress?: string | null
    hasB2Pending?: boolean
    bagsExpected?: number
    packedAt?: Date | string | null
    classifiedAt?: Date | string | null
    loadedAt?: Date | string | null
    deliveredAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    items?: OrderItemUncheckedCreateNestedManyWithoutOrderInput
    sequenceLinks?: SequenceOrderUncheckedCreateNestedManyWithoutOrderInput
    events?: EventUncheckedCreateNestedManyWithoutOrderInput
  }

  export type OrderCreateOrConnectWithoutPackedByInput = {
    where: OrderWhereUniqueInput
    create: XOR<OrderCreateWithoutPackedByInput, OrderUncheckedCreateWithoutPackedByInput>
  }

  export type OrderCreateManyPackedByInputEnvelope = {
    data: OrderCreateManyPackedByInput | OrderCreateManyPackedByInput[]
    skipDuplicates?: boolean
  }

  export type EventCreateWithoutActorInput = {
    type: string
    payload?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    order?: OrderCreateNestedOneWithoutEventsInput
  }

  export type EventUncheckedCreateWithoutActorInput = {
    id?: number
    type: string
    orderId?: number | null
    payload?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
  }

  export type EventCreateOrConnectWithoutActorInput = {
    where: EventWhereUniqueInput
    create: XOR<EventCreateWithoutActorInput, EventUncheckedCreateWithoutActorInput>
  }

  export type EventCreateManyActorInputEnvelope = {
    data: EventCreateManyActorInput | EventCreateManyActorInput[]
    skipDuplicates?: boolean
  }

  export type SequenceUpsertWithWhereUniqueWithoutCreatedByInput = {
    where: SequenceWhereUniqueInput
    update: XOR<SequenceUpdateWithoutCreatedByInput, SequenceUncheckedUpdateWithoutCreatedByInput>
    create: XOR<SequenceCreateWithoutCreatedByInput, SequenceUncheckedCreateWithoutCreatedByInput>
  }

  export type SequenceUpdateWithWhereUniqueWithoutCreatedByInput = {
    where: SequenceWhereUniqueInput
    data: XOR<SequenceUpdateWithoutCreatedByInput, SequenceUncheckedUpdateWithoutCreatedByInput>
  }

  export type SequenceUpdateManyWithWhereWithoutCreatedByInput = {
    where: SequenceScalarWhereInput
    data: XOR<SequenceUpdateManyMutationInput, SequenceUncheckedUpdateManyWithoutCreatedByInput>
  }

  export type SequenceScalarWhereInput = {
    AND?: SequenceScalarWhereInput | SequenceScalarWhereInput[]
    OR?: SequenceScalarWhereInput[]
    NOT?: SequenceScalarWhereInput | SequenceScalarWhereInput[]
    id?: IntFilter<"Sequence"> | number
    mode?: StringFilter<"Sequence"> | string
    createdById?: IntFilter<"Sequence"> | number
    createdAt?: DateTimeFilter<"Sequence"> | Date | string
    closedAt?: DateTimeNullableFilter<"Sequence"> | Date | string | null
    b1ClosedAt?: DateTimeNullableFilter<"Sequence"> | Date | string | null
    b2ClosedAt?: DateTimeNullableFilter<"Sequence"> | Date | string | null
    expectedBags?: IntFilter<"Sequence"> | number
    actualBags?: IntFilter<"Sequence"> | number
    status?: EnumSequenceStatusFilter<"Sequence"> | $Enums.SequenceStatus
  }

  export type OrderUpsertWithWhereUniqueWithoutPackedByInput = {
    where: OrderWhereUniqueInput
    update: XOR<OrderUpdateWithoutPackedByInput, OrderUncheckedUpdateWithoutPackedByInput>
    create: XOR<OrderCreateWithoutPackedByInput, OrderUncheckedCreateWithoutPackedByInput>
  }

  export type OrderUpdateWithWhereUniqueWithoutPackedByInput = {
    where: OrderWhereUniqueInput
    data: XOR<OrderUpdateWithoutPackedByInput, OrderUncheckedUpdateWithoutPackedByInput>
  }

  export type OrderUpdateManyWithWhereWithoutPackedByInput = {
    where: OrderScalarWhereInput
    data: XOR<OrderUpdateManyMutationInput, OrderUncheckedUpdateManyWithoutPackedByInput>
  }

  export type OrderScalarWhereInput = {
    AND?: OrderScalarWhereInput | OrderScalarWhereInput[]
    OR?: OrderScalarWhereInput[]
    NOT?: OrderScalarWhereInput | OrderScalarWhereInput[]
    id?: IntFilter<"Order"> | number
    wpOrderId?: IntFilter<"Order"> | number
    number?: StringFilter<"Order"> | string
    status?: EnumOrderStatusFilter<"Order"> | $Enums.OrderStatus
    route?: StringNullableFilter<"Order"> | string | null
    stopPosition?: IntNullableFilter<"Order"> | number | null
    customerName?: StringNullableFilter<"Order"> | string | null
    customerAddress?: StringNullableFilter<"Order"> | string | null
    hasB2Pending?: BoolFilter<"Order"> | boolean
    bagsExpected?: IntFilter<"Order"> | number
    packedById?: IntNullableFilter<"Order"> | number | null
    packedAt?: DateTimeNullableFilter<"Order"> | Date | string | null
    classifiedAt?: DateTimeNullableFilter<"Order"> | Date | string | null
    loadedAt?: DateTimeNullableFilter<"Order"> | Date | string | null
    deliveredAt?: DateTimeNullableFilter<"Order"> | Date | string | null
    createdAt?: DateTimeFilter<"Order"> | Date | string
    updatedAt?: DateTimeFilter<"Order"> | Date | string
  }

  export type EventUpsertWithWhereUniqueWithoutActorInput = {
    where: EventWhereUniqueInput
    update: XOR<EventUpdateWithoutActorInput, EventUncheckedUpdateWithoutActorInput>
    create: XOR<EventCreateWithoutActorInput, EventUncheckedCreateWithoutActorInput>
  }

  export type EventUpdateWithWhereUniqueWithoutActorInput = {
    where: EventWhereUniqueInput
    data: XOR<EventUpdateWithoutActorInput, EventUncheckedUpdateWithoutActorInput>
  }

  export type EventUpdateManyWithWhereWithoutActorInput = {
    where: EventScalarWhereInput
    data: XOR<EventUpdateManyMutationInput, EventUncheckedUpdateManyWithoutActorInput>
  }

  export type EventScalarWhereInput = {
    AND?: EventScalarWhereInput | EventScalarWhereInput[]
    OR?: EventScalarWhereInput[]
    NOT?: EventScalarWhereInput | EventScalarWhereInput[]
    id?: IntFilter<"Event"> | number
    type?: StringFilter<"Event"> | string
    actorId?: IntNullableFilter<"Event"> | number | null
    orderId?: IntNullableFilter<"Event"> | number | null
    payload?: JsonNullableFilter<"Event">
    createdAt?: DateTimeFilter<"Event"> | Date | string
  }

  export type OrderItemCreateWithoutProductInput = {
    qty: number
    warehouse: $Enums.Warehouse
    pickedAt?: Date | string | null
    packedAt?: Date | string | null
    order: OrderCreateNestedOneWithoutItemsInput
  }

  export type OrderItemUncheckedCreateWithoutProductInput = {
    id?: number
    orderId: number
    qty: number
    warehouse: $Enums.Warehouse
    pickedAt?: Date | string | null
    packedAt?: Date | string | null
  }

  export type OrderItemCreateOrConnectWithoutProductInput = {
    where: OrderItemWhereUniqueInput
    create: XOR<OrderItemCreateWithoutProductInput, OrderItemUncheckedCreateWithoutProductInput>
  }

  export type OrderItemCreateManyProductInputEnvelope = {
    data: OrderItemCreateManyProductInput | OrderItemCreateManyProductInput[]
    skipDuplicates?: boolean
  }

  export type OrderItemUpsertWithWhereUniqueWithoutProductInput = {
    where: OrderItemWhereUniqueInput
    update: XOR<OrderItemUpdateWithoutProductInput, OrderItemUncheckedUpdateWithoutProductInput>
    create: XOR<OrderItemCreateWithoutProductInput, OrderItemUncheckedCreateWithoutProductInput>
  }

  export type OrderItemUpdateWithWhereUniqueWithoutProductInput = {
    where: OrderItemWhereUniqueInput
    data: XOR<OrderItemUpdateWithoutProductInput, OrderItemUncheckedUpdateWithoutProductInput>
  }

  export type OrderItemUpdateManyWithWhereWithoutProductInput = {
    where: OrderItemScalarWhereInput
    data: XOR<OrderItemUpdateManyMutationInput, OrderItemUncheckedUpdateManyWithoutProductInput>
  }

  export type OrderItemScalarWhereInput = {
    AND?: OrderItemScalarWhereInput | OrderItemScalarWhereInput[]
    OR?: OrderItemScalarWhereInput[]
    NOT?: OrderItemScalarWhereInput | OrderItemScalarWhereInput[]
    id?: IntFilter<"OrderItem"> | number
    orderId?: IntFilter<"OrderItem"> | number
    productId?: IntFilter<"OrderItem"> | number
    qty?: IntFilter<"OrderItem"> | number
    warehouse?: EnumWarehouseFilter<"OrderItem"> | $Enums.Warehouse
    pickedAt?: DateTimeNullableFilter<"OrderItem"> | Date | string | null
    packedAt?: DateTimeNullableFilter<"OrderItem"> | Date | string | null
  }

  export type UserMetaCreateWithoutPackedOrdersInput = {
    wpUserId: number
    username: string
    displayName: string
    email?: string | null
    capabilities: JsonNullValueInput | InputJsonValue
    active?: boolean
    lastLoginAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    sequencesCreated?: SequenceCreateNestedManyWithoutCreatedByInput
    events?: EventCreateNestedManyWithoutActorInput
  }

  export type UserMetaUncheckedCreateWithoutPackedOrdersInput = {
    wpUserId: number
    username: string
    displayName: string
    email?: string | null
    capabilities: JsonNullValueInput | InputJsonValue
    active?: boolean
    lastLoginAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    sequencesCreated?: SequenceUncheckedCreateNestedManyWithoutCreatedByInput
    events?: EventUncheckedCreateNestedManyWithoutActorInput
  }

  export type UserMetaCreateOrConnectWithoutPackedOrdersInput = {
    where: UserMetaWhereUniqueInput
    create: XOR<UserMetaCreateWithoutPackedOrdersInput, UserMetaUncheckedCreateWithoutPackedOrdersInput>
  }

  export type OrderItemCreateWithoutOrderInput = {
    qty: number
    warehouse: $Enums.Warehouse
    pickedAt?: Date | string | null
    packedAt?: Date | string | null
    product: ProductMetaCreateNestedOneWithoutOrderItemsInput
  }

  export type OrderItemUncheckedCreateWithoutOrderInput = {
    id?: number
    productId: number
    qty: number
    warehouse: $Enums.Warehouse
    pickedAt?: Date | string | null
    packedAt?: Date | string | null
  }

  export type OrderItemCreateOrConnectWithoutOrderInput = {
    where: OrderItemWhereUniqueInput
    create: XOR<OrderItemCreateWithoutOrderInput, OrderItemUncheckedCreateWithoutOrderInput>
  }

  export type OrderItemCreateManyOrderInputEnvelope = {
    data: OrderItemCreateManyOrderInput | OrderItemCreateManyOrderInput[]
    skipDuplicates?: boolean
  }

  export type SequenceOrderCreateWithoutOrderInput = {
    sequence: SequenceCreateNestedOneWithoutOrdersInput
  }

  export type SequenceOrderUncheckedCreateWithoutOrderInput = {
    sequenceId: number
  }

  export type SequenceOrderCreateOrConnectWithoutOrderInput = {
    where: SequenceOrderWhereUniqueInput
    create: XOR<SequenceOrderCreateWithoutOrderInput, SequenceOrderUncheckedCreateWithoutOrderInput>
  }

  export type SequenceOrderCreateManyOrderInputEnvelope = {
    data: SequenceOrderCreateManyOrderInput | SequenceOrderCreateManyOrderInput[]
    skipDuplicates?: boolean
  }

  export type EventCreateWithoutOrderInput = {
    type: string
    payload?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    actor?: UserMetaCreateNestedOneWithoutEventsInput
  }

  export type EventUncheckedCreateWithoutOrderInput = {
    id?: number
    type: string
    actorId?: number | null
    payload?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
  }

  export type EventCreateOrConnectWithoutOrderInput = {
    where: EventWhereUniqueInput
    create: XOR<EventCreateWithoutOrderInput, EventUncheckedCreateWithoutOrderInput>
  }

  export type EventCreateManyOrderInputEnvelope = {
    data: EventCreateManyOrderInput | EventCreateManyOrderInput[]
    skipDuplicates?: boolean
  }

  export type UserMetaUpsertWithoutPackedOrdersInput = {
    update: XOR<UserMetaUpdateWithoutPackedOrdersInput, UserMetaUncheckedUpdateWithoutPackedOrdersInput>
    create: XOR<UserMetaCreateWithoutPackedOrdersInput, UserMetaUncheckedCreateWithoutPackedOrdersInput>
    where?: UserMetaWhereInput
  }

  export type UserMetaUpdateToOneWithWhereWithoutPackedOrdersInput = {
    where?: UserMetaWhereInput
    data: XOR<UserMetaUpdateWithoutPackedOrdersInput, UserMetaUncheckedUpdateWithoutPackedOrdersInput>
  }

  export type UserMetaUpdateWithoutPackedOrdersInput = {
    wpUserId?: IntFieldUpdateOperationsInput | number
    username?: StringFieldUpdateOperationsInput | string
    displayName?: StringFieldUpdateOperationsInput | string
    email?: NullableStringFieldUpdateOperationsInput | string | null
    capabilities?: JsonNullValueInput | InputJsonValue
    active?: BoolFieldUpdateOperationsInput | boolean
    lastLoginAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    sequencesCreated?: SequenceUpdateManyWithoutCreatedByNestedInput
    events?: EventUpdateManyWithoutActorNestedInput
  }

  export type UserMetaUncheckedUpdateWithoutPackedOrdersInput = {
    wpUserId?: IntFieldUpdateOperationsInput | number
    username?: StringFieldUpdateOperationsInput | string
    displayName?: StringFieldUpdateOperationsInput | string
    email?: NullableStringFieldUpdateOperationsInput | string | null
    capabilities?: JsonNullValueInput | InputJsonValue
    active?: BoolFieldUpdateOperationsInput | boolean
    lastLoginAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    sequencesCreated?: SequenceUncheckedUpdateManyWithoutCreatedByNestedInput
    events?: EventUncheckedUpdateManyWithoutActorNestedInput
  }

  export type OrderItemUpsertWithWhereUniqueWithoutOrderInput = {
    where: OrderItemWhereUniqueInput
    update: XOR<OrderItemUpdateWithoutOrderInput, OrderItemUncheckedUpdateWithoutOrderInput>
    create: XOR<OrderItemCreateWithoutOrderInput, OrderItemUncheckedCreateWithoutOrderInput>
  }

  export type OrderItemUpdateWithWhereUniqueWithoutOrderInput = {
    where: OrderItemWhereUniqueInput
    data: XOR<OrderItemUpdateWithoutOrderInput, OrderItemUncheckedUpdateWithoutOrderInput>
  }

  export type OrderItemUpdateManyWithWhereWithoutOrderInput = {
    where: OrderItemScalarWhereInput
    data: XOR<OrderItemUpdateManyMutationInput, OrderItemUncheckedUpdateManyWithoutOrderInput>
  }

  export type SequenceOrderUpsertWithWhereUniqueWithoutOrderInput = {
    where: SequenceOrderWhereUniqueInput
    update: XOR<SequenceOrderUpdateWithoutOrderInput, SequenceOrderUncheckedUpdateWithoutOrderInput>
    create: XOR<SequenceOrderCreateWithoutOrderInput, SequenceOrderUncheckedCreateWithoutOrderInput>
  }

  export type SequenceOrderUpdateWithWhereUniqueWithoutOrderInput = {
    where: SequenceOrderWhereUniqueInput
    data: XOR<SequenceOrderUpdateWithoutOrderInput, SequenceOrderUncheckedUpdateWithoutOrderInput>
  }

  export type SequenceOrderUpdateManyWithWhereWithoutOrderInput = {
    where: SequenceOrderScalarWhereInput
    data: XOR<SequenceOrderUpdateManyMutationInput, SequenceOrderUncheckedUpdateManyWithoutOrderInput>
  }

  export type SequenceOrderScalarWhereInput = {
    AND?: SequenceOrderScalarWhereInput | SequenceOrderScalarWhereInput[]
    OR?: SequenceOrderScalarWhereInput[]
    NOT?: SequenceOrderScalarWhereInput | SequenceOrderScalarWhereInput[]
    sequenceId?: IntFilter<"SequenceOrder"> | number
    orderId?: IntFilter<"SequenceOrder"> | number
  }

  export type EventUpsertWithWhereUniqueWithoutOrderInput = {
    where: EventWhereUniqueInput
    update: XOR<EventUpdateWithoutOrderInput, EventUncheckedUpdateWithoutOrderInput>
    create: XOR<EventCreateWithoutOrderInput, EventUncheckedCreateWithoutOrderInput>
  }

  export type EventUpdateWithWhereUniqueWithoutOrderInput = {
    where: EventWhereUniqueInput
    data: XOR<EventUpdateWithoutOrderInput, EventUncheckedUpdateWithoutOrderInput>
  }

  export type EventUpdateManyWithWhereWithoutOrderInput = {
    where: EventScalarWhereInput
    data: XOR<EventUpdateManyMutationInput, EventUncheckedUpdateManyWithoutOrderInput>
  }

  export type OrderCreateWithoutItemsInput = {
    wpOrderId: number
    number: string
    status?: $Enums.OrderStatus
    route?: string | null
    stopPosition?: number | null
    customerName?: string | null
    customerAddress?: string | null
    hasB2Pending?: boolean
    bagsExpected?: number
    packedAt?: Date | string | null
    classifiedAt?: Date | string | null
    loadedAt?: Date | string | null
    deliveredAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    packedBy?: UserMetaCreateNestedOneWithoutPackedOrdersInput
    sequenceLinks?: SequenceOrderCreateNestedManyWithoutOrderInput
    events?: EventCreateNestedManyWithoutOrderInput
  }

  export type OrderUncheckedCreateWithoutItemsInput = {
    id?: number
    wpOrderId: number
    number: string
    status?: $Enums.OrderStatus
    route?: string | null
    stopPosition?: number | null
    customerName?: string | null
    customerAddress?: string | null
    hasB2Pending?: boolean
    bagsExpected?: number
    packedById?: number | null
    packedAt?: Date | string | null
    classifiedAt?: Date | string | null
    loadedAt?: Date | string | null
    deliveredAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    sequenceLinks?: SequenceOrderUncheckedCreateNestedManyWithoutOrderInput
    events?: EventUncheckedCreateNestedManyWithoutOrderInput
  }

  export type OrderCreateOrConnectWithoutItemsInput = {
    where: OrderWhereUniqueInput
    create: XOR<OrderCreateWithoutItemsInput, OrderUncheckedCreateWithoutItemsInput>
  }

  export type ProductMetaCreateWithoutOrderItemsInput = {
    wpProductId: number
    sku?: string | null
    name: string
    warehouse?: $Enums.Warehouse | null
    thumbnailUrl?: string | null
    syncedAt?: Date | string
  }

  export type ProductMetaUncheckedCreateWithoutOrderItemsInput = {
    wpProductId: number
    sku?: string | null
    name: string
    warehouse?: $Enums.Warehouse | null
    thumbnailUrl?: string | null
    syncedAt?: Date | string
  }

  export type ProductMetaCreateOrConnectWithoutOrderItemsInput = {
    where: ProductMetaWhereUniqueInput
    create: XOR<ProductMetaCreateWithoutOrderItemsInput, ProductMetaUncheckedCreateWithoutOrderItemsInput>
  }

  export type OrderUpsertWithoutItemsInput = {
    update: XOR<OrderUpdateWithoutItemsInput, OrderUncheckedUpdateWithoutItemsInput>
    create: XOR<OrderCreateWithoutItemsInput, OrderUncheckedCreateWithoutItemsInput>
    where?: OrderWhereInput
  }

  export type OrderUpdateToOneWithWhereWithoutItemsInput = {
    where?: OrderWhereInput
    data: XOR<OrderUpdateWithoutItemsInput, OrderUncheckedUpdateWithoutItemsInput>
  }

  export type OrderUpdateWithoutItemsInput = {
    wpOrderId?: IntFieldUpdateOperationsInput | number
    number?: StringFieldUpdateOperationsInput | string
    status?: EnumOrderStatusFieldUpdateOperationsInput | $Enums.OrderStatus
    route?: NullableStringFieldUpdateOperationsInput | string | null
    stopPosition?: NullableIntFieldUpdateOperationsInput | number | null
    customerName?: NullableStringFieldUpdateOperationsInput | string | null
    customerAddress?: NullableStringFieldUpdateOperationsInput | string | null
    hasB2Pending?: BoolFieldUpdateOperationsInput | boolean
    bagsExpected?: IntFieldUpdateOperationsInput | number
    packedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    classifiedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    loadedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    deliveredAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    packedBy?: UserMetaUpdateOneWithoutPackedOrdersNestedInput
    sequenceLinks?: SequenceOrderUpdateManyWithoutOrderNestedInput
    events?: EventUpdateManyWithoutOrderNestedInput
  }

  export type OrderUncheckedUpdateWithoutItemsInput = {
    id?: IntFieldUpdateOperationsInput | number
    wpOrderId?: IntFieldUpdateOperationsInput | number
    number?: StringFieldUpdateOperationsInput | string
    status?: EnumOrderStatusFieldUpdateOperationsInput | $Enums.OrderStatus
    route?: NullableStringFieldUpdateOperationsInput | string | null
    stopPosition?: NullableIntFieldUpdateOperationsInput | number | null
    customerName?: NullableStringFieldUpdateOperationsInput | string | null
    customerAddress?: NullableStringFieldUpdateOperationsInput | string | null
    hasB2Pending?: BoolFieldUpdateOperationsInput | boolean
    bagsExpected?: IntFieldUpdateOperationsInput | number
    packedById?: NullableIntFieldUpdateOperationsInput | number | null
    packedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    classifiedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    loadedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    deliveredAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    sequenceLinks?: SequenceOrderUncheckedUpdateManyWithoutOrderNestedInput
    events?: EventUncheckedUpdateManyWithoutOrderNestedInput
  }

  export type ProductMetaUpsertWithoutOrderItemsInput = {
    update: XOR<ProductMetaUpdateWithoutOrderItemsInput, ProductMetaUncheckedUpdateWithoutOrderItemsInput>
    create: XOR<ProductMetaCreateWithoutOrderItemsInput, ProductMetaUncheckedCreateWithoutOrderItemsInput>
    where?: ProductMetaWhereInput
  }

  export type ProductMetaUpdateToOneWithWhereWithoutOrderItemsInput = {
    where?: ProductMetaWhereInput
    data: XOR<ProductMetaUpdateWithoutOrderItemsInput, ProductMetaUncheckedUpdateWithoutOrderItemsInput>
  }

  export type ProductMetaUpdateWithoutOrderItemsInput = {
    wpProductId?: IntFieldUpdateOperationsInput | number
    sku?: NullableStringFieldUpdateOperationsInput | string | null
    name?: StringFieldUpdateOperationsInput | string
    warehouse?: NullableEnumWarehouseFieldUpdateOperationsInput | $Enums.Warehouse | null
    thumbnailUrl?: NullableStringFieldUpdateOperationsInput | string | null
    syncedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ProductMetaUncheckedUpdateWithoutOrderItemsInput = {
    wpProductId?: IntFieldUpdateOperationsInput | number
    sku?: NullableStringFieldUpdateOperationsInput | string | null
    name?: StringFieldUpdateOperationsInput | string
    warehouse?: NullableEnumWarehouseFieldUpdateOperationsInput | $Enums.Warehouse | null
    thumbnailUrl?: NullableStringFieldUpdateOperationsInput | string | null
    syncedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserMetaCreateWithoutSequencesCreatedInput = {
    wpUserId: number
    username: string
    displayName: string
    email?: string | null
    capabilities: JsonNullValueInput | InputJsonValue
    active?: boolean
    lastLoginAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    packedOrders?: OrderCreateNestedManyWithoutPackedByInput
    events?: EventCreateNestedManyWithoutActorInput
  }

  export type UserMetaUncheckedCreateWithoutSequencesCreatedInput = {
    wpUserId: number
    username: string
    displayName: string
    email?: string | null
    capabilities: JsonNullValueInput | InputJsonValue
    active?: boolean
    lastLoginAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    packedOrders?: OrderUncheckedCreateNestedManyWithoutPackedByInput
    events?: EventUncheckedCreateNestedManyWithoutActorInput
  }

  export type UserMetaCreateOrConnectWithoutSequencesCreatedInput = {
    where: UserMetaWhereUniqueInput
    create: XOR<UserMetaCreateWithoutSequencesCreatedInput, UserMetaUncheckedCreateWithoutSequencesCreatedInput>
  }

  export type SequenceOrderCreateWithoutSequenceInput = {
    order: OrderCreateNestedOneWithoutSequenceLinksInput
  }

  export type SequenceOrderUncheckedCreateWithoutSequenceInput = {
    orderId: number
  }

  export type SequenceOrderCreateOrConnectWithoutSequenceInput = {
    where: SequenceOrderWhereUniqueInput
    create: XOR<SequenceOrderCreateWithoutSequenceInput, SequenceOrderUncheckedCreateWithoutSequenceInput>
  }

  export type SequenceOrderCreateManySequenceInputEnvelope = {
    data: SequenceOrderCreateManySequenceInput | SequenceOrderCreateManySequenceInput[]
    skipDuplicates?: boolean
  }

  export type UserMetaUpsertWithoutSequencesCreatedInput = {
    update: XOR<UserMetaUpdateWithoutSequencesCreatedInput, UserMetaUncheckedUpdateWithoutSequencesCreatedInput>
    create: XOR<UserMetaCreateWithoutSequencesCreatedInput, UserMetaUncheckedCreateWithoutSequencesCreatedInput>
    where?: UserMetaWhereInput
  }

  export type UserMetaUpdateToOneWithWhereWithoutSequencesCreatedInput = {
    where?: UserMetaWhereInput
    data: XOR<UserMetaUpdateWithoutSequencesCreatedInput, UserMetaUncheckedUpdateWithoutSequencesCreatedInput>
  }

  export type UserMetaUpdateWithoutSequencesCreatedInput = {
    wpUserId?: IntFieldUpdateOperationsInput | number
    username?: StringFieldUpdateOperationsInput | string
    displayName?: StringFieldUpdateOperationsInput | string
    email?: NullableStringFieldUpdateOperationsInput | string | null
    capabilities?: JsonNullValueInput | InputJsonValue
    active?: BoolFieldUpdateOperationsInput | boolean
    lastLoginAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    packedOrders?: OrderUpdateManyWithoutPackedByNestedInput
    events?: EventUpdateManyWithoutActorNestedInput
  }

  export type UserMetaUncheckedUpdateWithoutSequencesCreatedInput = {
    wpUserId?: IntFieldUpdateOperationsInput | number
    username?: StringFieldUpdateOperationsInput | string
    displayName?: StringFieldUpdateOperationsInput | string
    email?: NullableStringFieldUpdateOperationsInput | string | null
    capabilities?: JsonNullValueInput | InputJsonValue
    active?: BoolFieldUpdateOperationsInput | boolean
    lastLoginAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    packedOrders?: OrderUncheckedUpdateManyWithoutPackedByNestedInput
    events?: EventUncheckedUpdateManyWithoutActorNestedInput
  }

  export type SequenceOrderUpsertWithWhereUniqueWithoutSequenceInput = {
    where: SequenceOrderWhereUniqueInput
    update: XOR<SequenceOrderUpdateWithoutSequenceInput, SequenceOrderUncheckedUpdateWithoutSequenceInput>
    create: XOR<SequenceOrderCreateWithoutSequenceInput, SequenceOrderUncheckedCreateWithoutSequenceInput>
  }

  export type SequenceOrderUpdateWithWhereUniqueWithoutSequenceInput = {
    where: SequenceOrderWhereUniqueInput
    data: XOR<SequenceOrderUpdateWithoutSequenceInput, SequenceOrderUncheckedUpdateWithoutSequenceInput>
  }

  export type SequenceOrderUpdateManyWithWhereWithoutSequenceInput = {
    where: SequenceOrderScalarWhereInput
    data: XOR<SequenceOrderUpdateManyMutationInput, SequenceOrderUncheckedUpdateManyWithoutSequenceInput>
  }

  export type SequenceCreateWithoutOrdersInput = {
    mode?: string
    createdAt?: Date | string
    closedAt?: Date | string | null
    b1ClosedAt?: Date | string | null
    b2ClosedAt?: Date | string | null
    expectedBags?: number
    actualBags?: number
    status?: $Enums.SequenceStatus
    createdBy: UserMetaCreateNestedOneWithoutSequencesCreatedInput
  }

  export type SequenceUncheckedCreateWithoutOrdersInput = {
    id?: number
    mode?: string
    createdById: number
    createdAt?: Date | string
    closedAt?: Date | string | null
    b1ClosedAt?: Date | string | null
    b2ClosedAt?: Date | string | null
    expectedBags?: number
    actualBags?: number
    status?: $Enums.SequenceStatus
  }

  export type SequenceCreateOrConnectWithoutOrdersInput = {
    where: SequenceWhereUniqueInput
    create: XOR<SequenceCreateWithoutOrdersInput, SequenceUncheckedCreateWithoutOrdersInput>
  }

  export type OrderCreateWithoutSequenceLinksInput = {
    wpOrderId: number
    number: string
    status?: $Enums.OrderStatus
    route?: string | null
    stopPosition?: number | null
    customerName?: string | null
    customerAddress?: string | null
    hasB2Pending?: boolean
    bagsExpected?: number
    packedAt?: Date | string | null
    classifiedAt?: Date | string | null
    loadedAt?: Date | string | null
    deliveredAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    packedBy?: UserMetaCreateNestedOneWithoutPackedOrdersInput
    items?: OrderItemCreateNestedManyWithoutOrderInput
    events?: EventCreateNestedManyWithoutOrderInput
  }

  export type OrderUncheckedCreateWithoutSequenceLinksInput = {
    id?: number
    wpOrderId: number
    number: string
    status?: $Enums.OrderStatus
    route?: string | null
    stopPosition?: number | null
    customerName?: string | null
    customerAddress?: string | null
    hasB2Pending?: boolean
    bagsExpected?: number
    packedById?: number | null
    packedAt?: Date | string | null
    classifiedAt?: Date | string | null
    loadedAt?: Date | string | null
    deliveredAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    items?: OrderItemUncheckedCreateNestedManyWithoutOrderInput
    events?: EventUncheckedCreateNestedManyWithoutOrderInput
  }

  export type OrderCreateOrConnectWithoutSequenceLinksInput = {
    where: OrderWhereUniqueInput
    create: XOR<OrderCreateWithoutSequenceLinksInput, OrderUncheckedCreateWithoutSequenceLinksInput>
  }

  export type SequenceUpsertWithoutOrdersInput = {
    update: XOR<SequenceUpdateWithoutOrdersInput, SequenceUncheckedUpdateWithoutOrdersInput>
    create: XOR<SequenceCreateWithoutOrdersInput, SequenceUncheckedCreateWithoutOrdersInput>
    where?: SequenceWhereInput
  }

  export type SequenceUpdateToOneWithWhereWithoutOrdersInput = {
    where?: SequenceWhereInput
    data: XOR<SequenceUpdateWithoutOrdersInput, SequenceUncheckedUpdateWithoutOrdersInput>
  }

  export type SequenceUpdateWithoutOrdersInput = {
    mode?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    closedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    b1ClosedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    b2ClosedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    expectedBags?: IntFieldUpdateOperationsInput | number
    actualBags?: IntFieldUpdateOperationsInput | number
    status?: EnumSequenceStatusFieldUpdateOperationsInput | $Enums.SequenceStatus
    createdBy?: UserMetaUpdateOneRequiredWithoutSequencesCreatedNestedInput
  }

  export type SequenceUncheckedUpdateWithoutOrdersInput = {
    id?: IntFieldUpdateOperationsInput | number
    mode?: StringFieldUpdateOperationsInput | string
    createdById?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    closedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    b1ClosedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    b2ClosedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    expectedBags?: IntFieldUpdateOperationsInput | number
    actualBags?: IntFieldUpdateOperationsInput | number
    status?: EnumSequenceStatusFieldUpdateOperationsInput | $Enums.SequenceStatus
  }

  export type OrderUpsertWithoutSequenceLinksInput = {
    update: XOR<OrderUpdateWithoutSequenceLinksInput, OrderUncheckedUpdateWithoutSequenceLinksInput>
    create: XOR<OrderCreateWithoutSequenceLinksInput, OrderUncheckedCreateWithoutSequenceLinksInput>
    where?: OrderWhereInput
  }

  export type OrderUpdateToOneWithWhereWithoutSequenceLinksInput = {
    where?: OrderWhereInput
    data: XOR<OrderUpdateWithoutSequenceLinksInput, OrderUncheckedUpdateWithoutSequenceLinksInput>
  }

  export type OrderUpdateWithoutSequenceLinksInput = {
    wpOrderId?: IntFieldUpdateOperationsInput | number
    number?: StringFieldUpdateOperationsInput | string
    status?: EnumOrderStatusFieldUpdateOperationsInput | $Enums.OrderStatus
    route?: NullableStringFieldUpdateOperationsInput | string | null
    stopPosition?: NullableIntFieldUpdateOperationsInput | number | null
    customerName?: NullableStringFieldUpdateOperationsInput | string | null
    customerAddress?: NullableStringFieldUpdateOperationsInput | string | null
    hasB2Pending?: BoolFieldUpdateOperationsInput | boolean
    bagsExpected?: IntFieldUpdateOperationsInput | number
    packedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    classifiedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    loadedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    deliveredAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    packedBy?: UserMetaUpdateOneWithoutPackedOrdersNestedInput
    items?: OrderItemUpdateManyWithoutOrderNestedInput
    events?: EventUpdateManyWithoutOrderNestedInput
  }

  export type OrderUncheckedUpdateWithoutSequenceLinksInput = {
    id?: IntFieldUpdateOperationsInput | number
    wpOrderId?: IntFieldUpdateOperationsInput | number
    number?: StringFieldUpdateOperationsInput | string
    status?: EnumOrderStatusFieldUpdateOperationsInput | $Enums.OrderStatus
    route?: NullableStringFieldUpdateOperationsInput | string | null
    stopPosition?: NullableIntFieldUpdateOperationsInput | number | null
    customerName?: NullableStringFieldUpdateOperationsInput | string | null
    customerAddress?: NullableStringFieldUpdateOperationsInput | string | null
    hasB2Pending?: BoolFieldUpdateOperationsInput | boolean
    bagsExpected?: IntFieldUpdateOperationsInput | number
    packedById?: NullableIntFieldUpdateOperationsInput | number | null
    packedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    classifiedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    loadedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    deliveredAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    items?: OrderItemUncheckedUpdateManyWithoutOrderNestedInput
    events?: EventUncheckedUpdateManyWithoutOrderNestedInput
  }

  export type UserMetaCreateWithoutEventsInput = {
    wpUserId: number
    username: string
    displayName: string
    email?: string | null
    capabilities: JsonNullValueInput | InputJsonValue
    active?: boolean
    lastLoginAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    sequencesCreated?: SequenceCreateNestedManyWithoutCreatedByInput
    packedOrders?: OrderCreateNestedManyWithoutPackedByInput
  }

  export type UserMetaUncheckedCreateWithoutEventsInput = {
    wpUserId: number
    username: string
    displayName: string
    email?: string | null
    capabilities: JsonNullValueInput | InputJsonValue
    active?: boolean
    lastLoginAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    sequencesCreated?: SequenceUncheckedCreateNestedManyWithoutCreatedByInput
    packedOrders?: OrderUncheckedCreateNestedManyWithoutPackedByInput
  }

  export type UserMetaCreateOrConnectWithoutEventsInput = {
    where: UserMetaWhereUniqueInput
    create: XOR<UserMetaCreateWithoutEventsInput, UserMetaUncheckedCreateWithoutEventsInput>
  }

  export type OrderCreateWithoutEventsInput = {
    wpOrderId: number
    number: string
    status?: $Enums.OrderStatus
    route?: string | null
    stopPosition?: number | null
    customerName?: string | null
    customerAddress?: string | null
    hasB2Pending?: boolean
    bagsExpected?: number
    packedAt?: Date | string | null
    classifiedAt?: Date | string | null
    loadedAt?: Date | string | null
    deliveredAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    packedBy?: UserMetaCreateNestedOneWithoutPackedOrdersInput
    items?: OrderItemCreateNestedManyWithoutOrderInput
    sequenceLinks?: SequenceOrderCreateNestedManyWithoutOrderInput
  }

  export type OrderUncheckedCreateWithoutEventsInput = {
    id?: number
    wpOrderId: number
    number: string
    status?: $Enums.OrderStatus
    route?: string | null
    stopPosition?: number | null
    customerName?: string | null
    customerAddress?: string | null
    hasB2Pending?: boolean
    bagsExpected?: number
    packedById?: number | null
    packedAt?: Date | string | null
    classifiedAt?: Date | string | null
    loadedAt?: Date | string | null
    deliveredAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    items?: OrderItemUncheckedCreateNestedManyWithoutOrderInput
    sequenceLinks?: SequenceOrderUncheckedCreateNestedManyWithoutOrderInput
  }

  export type OrderCreateOrConnectWithoutEventsInput = {
    where: OrderWhereUniqueInput
    create: XOR<OrderCreateWithoutEventsInput, OrderUncheckedCreateWithoutEventsInput>
  }

  export type UserMetaUpsertWithoutEventsInput = {
    update: XOR<UserMetaUpdateWithoutEventsInput, UserMetaUncheckedUpdateWithoutEventsInput>
    create: XOR<UserMetaCreateWithoutEventsInput, UserMetaUncheckedCreateWithoutEventsInput>
    where?: UserMetaWhereInput
  }

  export type UserMetaUpdateToOneWithWhereWithoutEventsInput = {
    where?: UserMetaWhereInput
    data: XOR<UserMetaUpdateWithoutEventsInput, UserMetaUncheckedUpdateWithoutEventsInput>
  }

  export type UserMetaUpdateWithoutEventsInput = {
    wpUserId?: IntFieldUpdateOperationsInput | number
    username?: StringFieldUpdateOperationsInput | string
    displayName?: StringFieldUpdateOperationsInput | string
    email?: NullableStringFieldUpdateOperationsInput | string | null
    capabilities?: JsonNullValueInput | InputJsonValue
    active?: BoolFieldUpdateOperationsInput | boolean
    lastLoginAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    sequencesCreated?: SequenceUpdateManyWithoutCreatedByNestedInput
    packedOrders?: OrderUpdateManyWithoutPackedByNestedInput
  }

  export type UserMetaUncheckedUpdateWithoutEventsInput = {
    wpUserId?: IntFieldUpdateOperationsInput | number
    username?: StringFieldUpdateOperationsInput | string
    displayName?: StringFieldUpdateOperationsInput | string
    email?: NullableStringFieldUpdateOperationsInput | string | null
    capabilities?: JsonNullValueInput | InputJsonValue
    active?: BoolFieldUpdateOperationsInput | boolean
    lastLoginAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    sequencesCreated?: SequenceUncheckedUpdateManyWithoutCreatedByNestedInput
    packedOrders?: OrderUncheckedUpdateManyWithoutPackedByNestedInput
  }

  export type OrderUpsertWithoutEventsInput = {
    update: XOR<OrderUpdateWithoutEventsInput, OrderUncheckedUpdateWithoutEventsInput>
    create: XOR<OrderCreateWithoutEventsInput, OrderUncheckedCreateWithoutEventsInput>
    where?: OrderWhereInput
  }

  export type OrderUpdateToOneWithWhereWithoutEventsInput = {
    where?: OrderWhereInput
    data: XOR<OrderUpdateWithoutEventsInput, OrderUncheckedUpdateWithoutEventsInput>
  }

  export type OrderUpdateWithoutEventsInput = {
    wpOrderId?: IntFieldUpdateOperationsInput | number
    number?: StringFieldUpdateOperationsInput | string
    status?: EnumOrderStatusFieldUpdateOperationsInput | $Enums.OrderStatus
    route?: NullableStringFieldUpdateOperationsInput | string | null
    stopPosition?: NullableIntFieldUpdateOperationsInput | number | null
    customerName?: NullableStringFieldUpdateOperationsInput | string | null
    customerAddress?: NullableStringFieldUpdateOperationsInput | string | null
    hasB2Pending?: BoolFieldUpdateOperationsInput | boolean
    bagsExpected?: IntFieldUpdateOperationsInput | number
    packedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    classifiedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    loadedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    deliveredAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    packedBy?: UserMetaUpdateOneWithoutPackedOrdersNestedInput
    items?: OrderItemUpdateManyWithoutOrderNestedInput
    sequenceLinks?: SequenceOrderUpdateManyWithoutOrderNestedInput
  }

  export type OrderUncheckedUpdateWithoutEventsInput = {
    id?: IntFieldUpdateOperationsInput | number
    wpOrderId?: IntFieldUpdateOperationsInput | number
    number?: StringFieldUpdateOperationsInput | string
    status?: EnumOrderStatusFieldUpdateOperationsInput | $Enums.OrderStatus
    route?: NullableStringFieldUpdateOperationsInput | string | null
    stopPosition?: NullableIntFieldUpdateOperationsInput | number | null
    customerName?: NullableStringFieldUpdateOperationsInput | string | null
    customerAddress?: NullableStringFieldUpdateOperationsInput | string | null
    hasB2Pending?: BoolFieldUpdateOperationsInput | boolean
    bagsExpected?: IntFieldUpdateOperationsInput | number
    packedById?: NullableIntFieldUpdateOperationsInput | number | null
    packedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    classifiedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    loadedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    deliveredAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    items?: OrderItemUncheckedUpdateManyWithoutOrderNestedInput
    sequenceLinks?: SequenceOrderUncheckedUpdateManyWithoutOrderNestedInput
  }

  export type SequenceCreateManyCreatedByInput = {
    id?: number
    mode?: string
    createdAt?: Date | string
    closedAt?: Date | string | null
    b1ClosedAt?: Date | string | null
    b2ClosedAt?: Date | string | null
    expectedBags?: number
    actualBags?: number
    status?: $Enums.SequenceStatus
  }

  export type OrderCreateManyPackedByInput = {
    id?: number
    wpOrderId: number
    number: string
    status?: $Enums.OrderStatus
    route?: string | null
    stopPosition?: number | null
    customerName?: string | null
    customerAddress?: string | null
    hasB2Pending?: boolean
    bagsExpected?: number
    packedAt?: Date | string | null
    classifiedAt?: Date | string | null
    loadedAt?: Date | string | null
    deliveredAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type EventCreateManyActorInput = {
    id?: number
    type: string
    orderId?: number | null
    payload?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
  }

  export type SequenceUpdateWithoutCreatedByInput = {
    mode?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    closedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    b1ClosedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    b2ClosedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    expectedBags?: IntFieldUpdateOperationsInput | number
    actualBags?: IntFieldUpdateOperationsInput | number
    status?: EnumSequenceStatusFieldUpdateOperationsInput | $Enums.SequenceStatus
    orders?: SequenceOrderUpdateManyWithoutSequenceNestedInput
  }

  export type SequenceUncheckedUpdateWithoutCreatedByInput = {
    id?: IntFieldUpdateOperationsInput | number
    mode?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    closedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    b1ClosedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    b2ClosedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    expectedBags?: IntFieldUpdateOperationsInput | number
    actualBags?: IntFieldUpdateOperationsInput | number
    status?: EnumSequenceStatusFieldUpdateOperationsInput | $Enums.SequenceStatus
    orders?: SequenceOrderUncheckedUpdateManyWithoutSequenceNestedInput
  }

  export type SequenceUncheckedUpdateManyWithoutCreatedByInput = {
    id?: IntFieldUpdateOperationsInput | number
    mode?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    closedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    b1ClosedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    b2ClosedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    expectedBags?: IntFieldUpdateOperationsInput | number
    actualBags?: IntFieldUpdateOperationsInput | number
    status?: EnumSequenceStatusFieldUpdateOperationsInput | $Enums.SequenceStatus
  }

  export type OrderUpdateWithoutPackedByInput = {
    wpOrderId?: IntFieldUpdateOperationsInput | number
    number?: StringFieldUpdateOperationsInput | string
    status?: EnumOrderStatusFieldUpdateOperationsInput | $Enums.OrderStatus
    route?: NullableStringFieldUpdateOperationsInput | string | null
    stopPosition?: NullableIntFieldUpdateOperationsInput | number | null
    customerName?: NullableStringFieldUpdateOperationsInput | string | null
    customerAddress?: NullableStringFieldUpdateOperationsInput | string | null
    hasB2Pending?: BoolFieldUpdateOperationsInput | boolean
    bagsExpected?: IntFieldUpdateOperationsInput | number
    packedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    classifiedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    loadedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    deliveredAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    items?: OrderItemUpdateManyWithoutOrderNestedInput
    sequenceLinks?: SequenceOrderUpdateManyWithoutOrderNestedInput
    events?: EventUpdateManyWithoutOrderNestedInput
  }

  export type OrderUncheckedUpdateWithoutPackedByInput = {
    id?: IntFieldUpdateOperationsInput | number
    wpOrderId?: IntFieldUpdateOperationsInput | number
    number?: StringFieldUpdateOperationsInput | string
    status?: EnumOrderStatusFieldUpdateOperationsInput | $Enums.OrderStatus
    route?: NullableStringFieldUpdateOperationsInput | string | null
    stopPosition?: NullableIntFieldUpdateOperationsInput | number | null
    customerName?: NullableStringFieldUpdateOperationsInput | string | null
    customerAddress?: NullableStringFieldUpdateOperationsInput | string | null
    hasB2Pending?: BoolFieldUpdateOperationsInput | boolean
    bagsExpected?: IntFieldUpdateOperationsInput | number
    packedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    classifiedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    loadedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    deliveredAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    items?: OrderItemUncheckedUpdateManyWithoutOrderNestedInput
    sequenceLinks?: SequenceOrderUncheckedUpdateManyWithoutOrderNestedInput
    events?: EventUncheckedUpdateManyWithoutOrderNestedInput
  }

  export type OrderUncheckedUpdateManyWithoutPackedByInput = {
    id?: IntFieldUpdateOperationsInput | number
    wpOrderId?: IntFieldUpdateOperationsInput | number
    number?: StringFieldUpdateOperationsInput | string
    status?: EnumOrderStatusFieldUpdateOperationsInput | $Enums.OrderStatus
    route?: NullableStringFieldUpdateOperationsInput | string | null
    stopPosition?: NullableIntFieldUpdateOperationsInput | number | null
    customerName?: NullableStringFieldUpdateOperationsInput | string | null
    customerAddress?: NullableStringFieldUpdateOperationsInput | string | null
    hasB2Pending?: BoolFieldUpdateOperationsInput | boolean
    bagsExpected?: IntFieldUpdateOperationsInput | number
    packedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    classifiedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    loadedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    deliveredAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type EventUpdateWithoutActorInput = {
    type?: StringFieldUpdateOperationsInput | string
    payload?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    order?: OrderUpdateOneWithoutEventsNestedInput
  }

  export type EventUncheckedUpdateWithoutActorInput = {
    id?: IntFieldUpdateOperationsInput | number
    type?: StringFieldUpdateOperationsInput | string
    orderId?: NullableIntFieldUpdateOperationsInput | number | null
    payload?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type EventUncheckedUpdateManyWithoutActorInput = {
    id?: IntFieldUpdateOperationsInput | number
    type?: StringFieldUpdateOperationsInput | string
    orderId?: NullableIntFieldUpdateOperationsInput | number | null
    payload?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type OrderItemCreateManyProductInput = {
    id?: number
    orderId: number
    qty: number
    warehouse: $Enums.Warehouse
    pickedAt?: Date | string | null
    packedAt?: Date | string | null
  }

  export type OrderItemUpdateWithoutProductInput = {
    qty?: IntFieldUpdateOperationsInput | number
    warehouse?: EnumWarehouseFieldUpdateOperationsInput | $Enums.Warehouse
    pickedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    packedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    order?: OrderUpdateOneRequiredWithoutItemsNestedInput
  }

  export type OrderItemUncheckedUpdateWithoutProductInput = {
    id?: IntFieldUpdateOperationsInput | number
    orderId?: IntFieldUpdateOperationsInput | number
    qty?: IntFieldUpdateOperationsInput | number
    warehouse?: EnumWarehouseFieldUpdateOperationsInput | $Enums.Warehouse
    pickedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    packedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type OrderItemUncheckedUpdateManyWithoutProductInput = {
    id?: IntFieldUpdateOperationsInput | number
    orderId?: IntFieldUpdateOperationsInput | number
    qty?: IntFieldUpdateOperationsInput | number
    warehouse?: EnumWarehouseFieldUpdateOperationsInput | $Enums.Warehouse
    pickedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    packedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type OrderItemCreateManyOrderInput = {
    id?: number
    productId: number
    qty: number
    warehouse: $Enums.Warehouse
    pickedAt?: Date | string | null
    packedAt?: Date | string | null
  }

  export type SequenceOrderCreateManyOrderInput = {
    sequenceId: number
  }

  export type EventCreateManyOrderInput = {
    id?: number
    type: string
    actorId?: number | null
    payload?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
  }

  export type OrderItemUpdateWithoutOrderInput = {
    qty?: IntFieldUpdateOperationsInput | number
    warehouse?: EnumWarehouseFieldUpdateOperationsInput | $Enums.Warehouse
    pickedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    packedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    product?: ProductMetaUpdateOneRequiredWithoutOrderItemsNestedInput
  }

  export type OrderItemUncheckedUpdateWithoutOrderInput = {
    id?: IntFieldUpdateOperationsInput | number
    productId?: IntFieldUpdateOperationsInput | number
    qty?: IntFieldUpdateOperationsInput | number
    warehouse?: EnumWarehouseFieldUpdateOperationsInput | $Enums.Warehouse
    pickedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    packedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type OrderItemUncheckedUpdateManyWithoutOrderInput = {
    id?: IntFieldUpdateOperationsInput | number
    productId?: IntFieldUpdateOperationsInput | number
    qty?: IntFieldUpdateOperationsInput | number
    warehouse?: EnumWarehouseFieldUpdateOperationsInput | $Enums.Warehouse
    pickedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    packedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type SequenceOrderUpdateWithoutOrderInput = {
    sequence?: SequenceUpdateOneRequiredWithoutOrdersNestedInput
  }

  export type SequenceOrderUncheckedUpdateWithoutOrderInput = {
    sequenceId?: IntFieldUpdateOperationsInput | number
  }

  export type SequenceOrderUncheckedUpdateManyWithoutOrderInput = {
    sequenceId?: IntFieldUpdateOperationsInput | number
  }

  export type EventUpdateWithoutOrderInput = {
    type?: StringFieldUpdateOperationsInput | string
    payload?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    actor?: UserMetaUpdateOneWithoutEventsNestedInput
  }

  export type EventUncheckedUpdateWithoutOrderInput = {
    id?: IntFieldUpdateOperationsInput | number
    type?: StringFieldUpdateOperationsInput | string
    actorId?: NullableIntFieldUpdateOperationsInput | number | null
    payload?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type EventUncheckedUpdateManyWithoutOrderInput = {
    id?: IntFieldUpdateOperationsInput | number
    type?: StringFieldUpdateOperationsInput | string
    actorId?: NullableIntFieldUpdateOperationsInput | number | null
    payload?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SequenceOrderCreateManySequenceInput = {
    orderId: number
  }

  export type SequenceOrderUpdateWithoutSequenceInput = {
    order?: OrderUpdateOneRequiredWithoutSequenceLinksNestedInput
  }

  export type SequenceOrderUncheckedUpdateWithoutSequenceInput = {
    orderId?: IntFieldUpdateOperationsInput | number
  }

  export type SequenceOrderUncheckedUpdateManyWithoutSequenceInput = {
    orderId?: IntFieldUpdateOperationsInput | number
  }



  /**
   * Aliases for legacy arg types
   */
    /**
     * @deprecated Use UserMetaCountOutputTypeDefaultArgs instead
     */
    export type UserMetaCountOutputTypeArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = UserMetaCountOutputTypeDefaultArgs<ExtArgs>
    /**
     * @deprecated Use ProductMetaCountOutputTypeDefaultArgs instead
     */
    export type ProductMetaCountOutputTypeArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = ProductMetaCountOutputTypeDefaultArgs<ExtArgs>
    /**
     * @deprecated Use OrderCountOutputTypeDefaultArgs instead
     */
    export type OrderCountOutputTypeArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = OrderCountOutputTypeDefaultArgs<ExtArgs>
    /**
     * @deprecated Use SequenceCountOutputTypeDefaultArgs instead
     */
    export type SequenceCountOutputTypeArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = SequenceCountOutputTypeDefaultArgs<ExtArgs>
    /**
     * @deprecated Use UserMetaDefaultArgs instead
     */
    export type UserMetaArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = UserMetaDefaultArgs<ExtArgs>
    /**
     * @deprecated Use ProductMetaDefaultArgs instead
     */
    export type ProductMetaArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = ProductMetaDefaultArgs<ExtArgs>
    /**
     * @deprecated Use OrderDefaultArgs instead
     */
    export type OrderArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = OrderDefaultArgs<ExtArgs>
    /**
     * @deprecated Use OrderItemDefaultArgs instead
     */
    export type OrderItemArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = OrderItemDefaultArgs<ExtArgs>
    /**
     * @deprecated Use SequenceDefaultArgs instead
     */
    export type SequenceArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = SequenceDefaultArgs<ExtArgs>
    /**
     * @deprecated Use SequenceOrderDefaultArgs instead
     */
    export type SequenceOrderArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = SequenceOrderDefaultArgs<ExtArgs>
    /**
     * @deprecated Use EventDefaultArgs instead
     */
    export type EventArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = EventDefaultArgs<ExtArgs>

  /**
   * Batch Payload for updateMany & deleteMany & createMany
   */

  export type BatchPayload = {
    count: number
  }

  /**
   * DMMF
   */
  export const dmmf: runtime.BaseDMMF
}