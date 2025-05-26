
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
 * Model Employee
 * 
 */
export type Employee = $Result.DefaultSelection<Prisma.$EmployeePayload>
/**
 * Model WorkInfo
 * 
 */
export type WorkInfo = $Result.DefaultSelection<Prisma.$WorkInfoPayload>
/**
 * Model PersonalInfo
 * 
 */
export type PersonalInfo = $Result.DefaultSelection<Prisma.$PersonalInfoPayload>
/**
 * Model ContactInfo
 * 
 */
export type ContactInfo = $Result.DefaultSelection<Prisma.$ContactInfoPayload>
/**
 * Model OtherInfo
 * 
 */
export type OtherInfo = $Result.DefaultSelection<Prisma.$OtherInfoPayload>
/**
 * Model LeaveRequest
 * 
 */
export type LeaveRequest = $Result.DefaultSelection<Prisma.$LeaveRequestPayload>
/**
 * Model Attendance
 * 
 */
export type Attendance = $Result.DefaultSelection<Prisma.$AttendancePayload>

/**
 * Enums
 */
export namespace $Enums {
  export const Role: {
  USER: 'USER',
  MANAGER: 'MANAGER',
  ADMIN: 'ADMIN'
};

export type Role = (typeof Role)[keyof typeof Role]


export const Sex: {
  MALE: 'MALE',
  FEMALE: 'FEMALE'
};

export type Sex = (typeof Sex)[keyof typeof Sex]


export const WorkStatus: {
  OFFICIAL: 'OFFICIAL',
  PROBATION: 'PROBATION',
  RESIGNED: 'RESIGNED'
};

export type WorkStatus = (typeof WorkStatus)[keyof typeof WorkStatus]


export const LeaveTypeEnum: {
  PN: 'PN',
  NB: 'NB',
  PC: 'PC',
  PT: 'PT',
  Cgt: 'Cgt',
  PB: 'PB',
  TS: 'TS',
  PR: 'PR'
};

export type LeaveTypeEnum = (typeof LeaveTypeEnum)[keyof typeof LeaveTypeEnum]


export const LeaveStatus: {
  pending: 'pending',
  approved: 'approved',
  rejected: 'rejected'
};

export type LeaveStatus = (typeof LeaveStatus)[keyof typeof LeaveStatus]

}

export type Role = $Enums.Role

export const Role: typeof $Enums.Role

export type Sex = $Enums.Sex

export const Sex: typeof $Enums.Sex

export type WorkStatus = $Enums.WorkStatus

export const WorkStatus: typeof $Enums.WorkStatus

export type LeaveTypeEnum = $Enums.LeaveTypeEnum

export const LeaveTypeEnum: typeof $Enums.LeaveTypeEnum

export type LeaveStatus = $Enums.LeaveStatus

export const LeaveStatus: typeof $Enums.LeaveStatus

/**
 * ##  Prisma Client ʲˢ
 *
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient()
 * // Fetch zero or more Employees
 * const employees = await prisma.employee.findMany()
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
   * // Fetch zero or more Employees
   * const employees = await prisma.employee.findMany()
   * ```
   *
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
   */

  constructor(optionsArg ?: Prisma.Subset<ClientOptions, Prisma.PrismaClientOptions>);
  $on<V extends U>(eventType: V, callback: (event: V extends 'query' ? Prisma.QueryEvent : Prisma.LogEvent) => void): PrismaClient;

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


  $extends: $Extensions.ExtendsHook<"extends", Prisma.TypeMapCb<ClientOptions>, ExtArgs, $Utils.Call<Prisma.TypeMapCb<ClientOptions>, {
    extArgs: ExtArgs
  }>>

      /**
   * `prisma.employee`: Exposes CRUD operations for the **Employee** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Employees
    * const employees = await prisma.employee.findMany()
    * ```
    */
  get employee(): Prisma.EmployeeDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.workInfo`: Exposes CRUD operations for the **WorkInfo** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more WorkInfos
    * const workInfos = await prisma.workInfo.findMany()
    * ```
    */
  get workInfo(): Prisma.WorkInfoDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.personalInfo`: Exposes CRUD operations for the **PersonalInfo** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more PersonalInfos
    * const personalInfos = await prisma.personalInfo.findMany()
    * ```
    */
  get personalInfo(): Prisma.PersonalInfoDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.contactInfo`: Exposes CRUD operations for the **ContactInfo** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more ContactInfos
    * const contactInfos = await prisma.contactInfo.findMany()
    * ```
    */
  get contactInfo(): Prisma.ContactInfoDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.otherInfo`: Exposes CRUD operations for the **OtherInfo** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more OtherInfos
    * const otherInfos = await prisma.otherInfo.findMany()
    * ```
    */
  get otherInfo(): Prisma.OtherInfoDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.leaveRequest`: Exposes CRUD operations for the **LeaveRequest** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more LeaveRequests
    * const leaveRequests = await prisma.leaveRequest.findMany()
    * ```
    */
  get leaveRequest(): Prisma.LeaveRequestDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.attendance`: Exposes CRUD operations for the **Attendance** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Attendances
    * const attendances = await prisma.attendance.findMany()
    * ```
    */
  get attendance(): Prisma.AttendanceDelegate<ExtArgs, ClientOptions>;
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
   * Prisma Client JS version: 6.8.1
   * Query Engine version: 2060c79ba17c6bb9f5823312b6f6b7f4a845738e
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
      | {[P in keyof O as P extends K ? P : never]-?: O[P]} & O
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
    Employee: 'Employee',
    WorkInfo: 'WorkInfo',
    PersonalInfo: 'PersonalInfo',
    ContactInfo: 'ContactInfo',
    OtherInfo: 'OtherInfo',
    LeaveRequest: 'LeaveRequest',
    Attendance: 'Attendance'
  };

  export type ModelName = (typeof ModelName)[keyof typeof ModelName]


  export type Datasources = {
    db?: Datasource
  }

  interface TypeMapCb<ClientOptions = {}> extends $Utils.Fn<{extArgs: $Extensions.InternalArgs }, $Utils.Record<string, any>> {
    returns: Prisma.TypeMap<this['params']['extArgs'], ClientOptions extends { omit: infer OmitOptions } ? OmitOptions : {}>
  }

  export type TypeMap<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> = {
    globalOmitOptions: {
      omit: GlobalOmitOptions
    }
    meta: {
      modelProps: "employee" | "workInfo" | "personalInfo" | "contactInfo" | "otherInfo" | "leaveRequest" | "attendance"
      txIsolationLevel: Prisma.TransactionIsolationLevel
    }
    model: {
      Employee: {
        payload: Prisma.$EmployeePayload<ExtArgs>
        fields: Prisma.EmployeeFieldRefs
        operations: {
          findUnique: {
            args: Prisma.EmployeeFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EmployeePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.EmployeeFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EmployeePayload>
          }
          findFirst: {
            args: Prisma.EmployeeFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EmployeePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.EmployeeFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EmployeePayload>
          }
          findMany: {
            args: Prisma.EmployeeFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EmployeePayload>[]
          }
          create: {
            args: Prisma.EmployeeCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EmployeePayload>
          }
          createMany: {
            args: Prisma.EmployeeCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          delete: {
            args: Prisma.EmployeeDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EmployeePayload>
          }
          update: {
            args: Prisma.EmployeeUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EmployeePayload>
          }
          deleteMany: {
            args: Prisma.EmployeeDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.EmployeeUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.EmployeeUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EmployeePayload>
          }
          aggregate: {
            args: Prisma.EmployeeAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateEmployee>
          }
          groupBy: {
            args: Prisma.EmployeeGroupByArgs<ExtArgs>
            result: $Utils.Optional<EmployeeGroupByOutputType>[]
          }
          count: {
            args: Prisma.EmployeeCountArgs<ExtArgs>
            result: $Utils.Optional<EmployeeCountAggregateOutputType> | number
          }
        }
      }
      WorkInfo: {
        payload: Prisma.$WorkInfoPayload<ExtArgs>
        fields: Prisma.WorkInfoFieldRefs
        operations: {
          findUnique: {
            args: Prisma.WorkInfoFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WorkInfoPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.WorkInfoFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WorkInfoPayload>
          }
          findFirst: {
            args: Prisma.WorkInfoFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WorkInfoPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.WorkInfoFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WorkInfoPayload>
          }
          findMany: {
            args: Prisma.WorkInfoFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WorkInfoPayload>[]
          }
          create: {
            args: Prisma.WorkInfoCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WorkInfoPayload>
          }
          createMany: {
            args: Prisma.WorkInfoCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          delete: {
            args: Prisma.WorkInfoDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WorkInfoPayload>
          }
          update: {
            args: Prisma.WorkInfoUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WorkInfoPayload>
          }
          deleteMany: {
            args: Prisma.WorkInfoDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.WorkInfoUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.WorkInfoUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WorkInfoPayload>
          }
          aggregate: {
            args: Prisma.WorkInfoAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateWorkInfo>
          }
          groupBy: {
            args: Prisma.WorkInfoGroupByArgs<ExtArgs>
            result: $Utils.Optional<WorkInfoGroupByOutputType>[]
          }
          count: {
            args: Prisma.WorkInfoCountArgs<ExtArgs>
            result: $Utils.Optional<WorkInfoCountAggregateOutputType> | number
          }
        }
      }
      PersonalInfo: {
        payload: Prisma.$PersonalInfoPayload<ExtArgs>
        fields: Prisma.PersonalInfoFieldRefs
        operations: {
          findUnique: {
            args: Prisma.PersonalInfoFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PersonalInfoPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.PersonalInfoFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PersonalInfoPayload>
          }
          findFirst: {
            args: Prisma.PersonalInfoFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PersonalInfoPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.PersonalInfoFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PersonalInfoPayload>
          }
          findMany: {
            args: Prisma.PersonalInfoFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PersonalInfoPayload>[]
          }
          create: {
            args: Prisma.PersonalInfoCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PersonalInfoPayload>
          }
          createMany: {
            args: Prisma.PersonalInfoCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          delete: {
            args: Prisma.PersonalInfoDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PersonalInfoPayload>
          }
          update: {
            args: Prisma.PersonalInfoUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PersonalInfoPayload>
          }
          deleteMany: {
            args: Prisma.PersonalInfoDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.PersonalInfoUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.PersonalInfoUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PersonalInfoPayload>
          }
          aggregate: {
            args: Prisma.PersonalInfoAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregatePersonalInfo>
          }
          groupBy: {
            args: Prisma.PersonalInfoGroupByArgs<ExtArgs>
            result: $Utils.Optional<PersonalInfoGroupByOutputType>[]
          }
          count: {
            args: Prisma.PersonalInfoCountArgs<ExtArgs>
            result: $Utils.Optional<PersonalInfoCountAggregateOutputType> | number
          }
        }
      }
      ContactInfo: {
        payload: Prisma.$ContactInfoPayload<ExtArgs>
        fields: Prisma.ContactInfoFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ContactInfoFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ContactInfoPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ContactInfoFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ContactInfoPayload>
          }
          findFirst: {
            args: Prisma.ContactInfoFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ContactInfoPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ContactInfoFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ContactInfoPayload>
          }
          findMany: {
            args: Prisma.ContactInfoFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ContactInfoPayload>[]
          }
          create: {
            args: Prisma.ContactInfoCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ContactInfoPayload>
          }
          createMany: {
            args: Prisma.ContactInfoCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          delete: {
            args: Prisma.ContactInfoDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ContactInfoPayload>
          }
          update: {
            args: Prisma.ContactInfoUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ContactInfoPayload>
          }
          deleteMany: {
            args: Prisma.ContactInfoDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ContactInfoUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.ContactInfoUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ContactInfoPayload>
          }
          aggregate: {
            args: Prisma.ContactInfoAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateContactInfo>
          }
          groupBy: {
            args: Prisma.ContactInfoGroupByArgs<ExtArgs>
            result: $Utils.Optional<ContactInfoGroupByOutputType>[]
          }
          count: {
            args: Prisma.ContactInfoCountArgs<ExtArgs>
            result: $Utils.Optional<ContactInfoCountAggregateOutputType> | number
          }
        }
      }
      OtherInfo: {
        payload: Prisma.$OtherInfoPayload<ExtArgs>
        fields: Prisma.OtherInfoFieldRefs
        operations: {
          findUnique: {
            args: Prisma.OtherInfoFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OtherInfoPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.OtherInfoFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OtherInfoPayload>
          }
          findFirst: {
            args: Prisma.OtherInfoFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OtherInfoPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.OtherInfoFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OtherInfoPayload>
          }
          findMany: {
            args: Prisma.OtherInfoFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OtherInfoPayload>[]
          }
          create: {
            args: Prisma.OtherInfoCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OtherInfoPayload>
          }
          createMany: {
            args: Prisma.OtherInfoCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          delete: {
            args: Prisma.OtherInfoDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OtherInfoPayload>
          }
          update: {
            args: Prisma.OtherInfoUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OtherInfoPayload>
          }
          deleteMany: {
            args: Prisma.OtherInfoDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.OtherInfoUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.OtherInfoUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OtherInfoPayload>
          }
          aggregate: {
            args: Prisma.OtherInfoAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateOtherInfo>
          }
          groupBy: {
            args: Prisma.OtherInfoGroupByArgs<ExtArgs>
            result: $Utils.Optional<OtherInfoGroupByOutputType>[]
          }
          count: {
            args: Prisma.OtherInfoCountArgs<ExtArgs>
            result: $Utils.Optional<OtherInfoCountAggregateOutputType> | number
          }
        }
      }
      LeaveRequest: {
        payload: Prisma.$LeaveRequestPayload<ExtArgs>
        fields: Prisma.LeaveRequestFieldRefs
        operations: {
          findUnique: {
            args: Prisma.LeaveRequestFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LeaveRequestPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.LeaveRequestFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LeaveRequestPayload>
          }
          findFirst: {
            args: Prisma.LeaveRequestFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LeaveRequestPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.LeaveRequestFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LeaveRequestPayload>
          }
          findMany: {
            args: Prisma.LeaveRequestFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LeaveRequestPayload>[]
          }
          create: {
            args: Prisma.LeaveRequestCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LeaveRequestPayload>
          }
          createMany: {
            args: Prisma.LeaveRequestCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          delete: {
            args: Prisma.LeaveRequestDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LeaveRequestPayload>
          }
          update: {
            args: Prisma.LeaveRequestUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LeaveRequestPayload>
          }
          deleteMany: {
            args: Prisma.LeaveRequestDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.LeaveRequestUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.LeaveRequestUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LeaveRequestPayload>
          }
          aggregate: {
            args: Prisma.LeaveRequestAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateLeaveRequest>
          }
          groupBy: {
            args: Prisma.LeaveRequestGroupByArgs<ExtArgs>
            result: $Utils.Optional<LeaveRequestGroupByOutputType>[]
          }
          count: {
            args: Prisma.LeaveRequestCountArgs<ExtArgs>
            result: $Utils.Optional<LeaveRequestCountAggregateOutputType> | number
          }
        }
      }
      Attendance: {
        payload: Prisma.$AttendancePayload<ExtArgs>
        fields: Prisma.AttendanceFieldRefs
        operations: {
          findUnique: {
            args: Prisma.AttendanceFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AttendancePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.AttendanceFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AttendancePayload>
          }
          findFirst: {
            args: Prisma.AttendanceFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AttendancePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.AttendanceFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AttendancePayload>
          }
          findMany: {
            args: Prisma.AttendanceFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AttendancePayload>[]
          }
          create: {
            args: Prisma.AttendanceCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AttendancePayload>
          }
          createMany: {
            args: Prisma.AttendanceCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          delete: {
            args: Prisma.AttendanceDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AttendancePayload>
          }
          update: {
            args: Prisma.AttendanceUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AttendancePayload>
          }
          deleteMany: {
            args: Prisma.AttendanceDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.AttendanceUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.AttendanceUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AttendancePayload>
          }
          aggregate: {
            args: Prisma.AttendanceAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateAttendance>
          }
          groupBy: {
            args: Prisma.AttendanceGroupByArgs<ExtArgs>
            result: $Utils.Optional<AttendanceGroupByOutputType>[]
          }
          count: {
            args: Prisma.AttendanceCountArgs<ExtArgs>
            result: $Utils.Optional<AttendanceCountAggregateOutputType> | number
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
    /**
     * Global configuration for omitting model fields by default.
     * 
     * @example
     * ```
     * const prisma = new PrismaClient({
     *   omit: {
     *     user: {
     *       password: true
     *     }
     *   }
     * })
     * ```
     */
    omit?: Prisma.GlobalOmitConfig
  }
  export type GlobalOmitConfig = {
    employee?: EmployeeOmit
    workInfo?: WorkInfoOmit
    personalInfo?: PersonalInfoOmit
    contactInfo?: ContactInfoOmit
    otherInfo?: OtherInfoOmit
    leaveRequest?: LeaveRequestOmit
    attendance?: AttendanceOmit
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
    | 'updateManyAndReturn'
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
   * Count Type EmployeeCountOutputType
   */

  export type EmployeeCountOutputType = {
    LeaveRequest: number
    Attendance: number
  }

  export type EmployeeCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    LeaveRequest?: boolean | EmployeeCountOutputTypeCountLeaveRequestArgs
    Attendance?: boolean | EmployeeCountOutputTypeCountAttendanceArgs
  }

  // Custom InputTypes
  /**
   * EmployeeCountOutputType without action
   */
  export type EmployeeCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the EmployeeCountOutputType
     */
    select?: EmployeeCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * EmployeeCountOutputType without action
   */
  export type EmployeeCountOutputTypeCountLeaveRequestArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: LeaveRequestWhereInput
  }

  /**
   * EmployeeCountOutputType without action
   */
  export type EmployeeCountOutputTypeCountAttendanceArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: AttendanceWhereInput
  }


  /**
   * Models
   */

  /**
   * Model Employee
   */

  export type AggregateEmployee = {
    _count: EmployeeCountAggregateOutputType | null
    _avg: EmployeeAvgAggregateOutputType | null
    _sum: EmployeeSumAggregateOutputType | null
    _min: EmployeeMinAggregateOutputType | null
    _max: EmployeeMaxAggregateOutputType | null
  }

  export type EmployeeAvgAggregateOutputType = {
    id: number | null
  }

  export type EmployeeSumAggregateOutputType = {
    id: number | null
  }

  export type EmployeeMinAggregateOutputType = {
    id: number | null
    employeeCode: string | null
    name: string | null
    gender: $Enums.Sex | null
    birthDate: Date | null
    password: string | null
    role: $Enums.Role | null
    avatar: string | null
  }

  export type EmployeeMaxAggregateOutputType = {
    id: number | null
    employeeCode: string | null
    name: string | null
    gender: $Enums.Sex | null
    birthDate: Date | null
    password: string | null
    role: $Enums.Role | null
    avatar: string | null
  }

  export type EmployeeCountAggregateOutputType = {
    id: number
    employeeCode: number
    name: number
    gender: number
    birthDate: number
    password: number
    role: number
    avatar: number
    _all: number
  }


  export type EmployeeAvgAggregateInputType = {
    id?: true
  }

  export type EmployeeSumAggregateInputType = {
    id?: true
  }

  export type EmployeeMinAggregateInputType = {
    id?: true
    employeeCode?: true
    name?: true
    gender?: true
    birthDate?: true
    password?: true
    role?: true
    avatar?: true
  }

  export type EmployeeMaxAggregateInputType = {
    id?: true
    employeeCode?: true
    name?: true
    gender?: true
    birthDate?: true
    password?: true
    role?: true
    avatar?: true
  }

  export type EmployeeCountAggregateInputType = {
    id?: true
    employeeCode?: true
    name?: true
    gender?: true
    birthDate?: true
    password?: true
    role?: true
    avatar?: true
    _all?: true
  }

  export type EmployeeAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Employee to aggregate.
     */
    where?: EmployeeWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Employees to fetch.
     */
    orderBy?: EmployeeOrderByWithRelationInput | EmployeeOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: EmployeeWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Employees from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Employees.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Employees
    **/
    _count?: true | EmployeeCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: EmployeeAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: EmployeeSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: EmployeeMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: EmployeeMaxAggregateInputType
  }

  export type GetEmployeeAggregateType<T extends EmployeeAggregateArgs> = {
        [P in keyof T & keyof AggregateEmployee]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateEmployee[P]>
      : GetScalarType<T[P], AggregateEmployee[P]>
  }




  export type EmployeeGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: EmployeeWhereInput
    orderBy?: EmployeeOrderByWithAggregationInput | EmployeeOrderByWithAggregationInput[]
    by: EmployeeScalarFieldEnum[] | EmployeeScalarFieldEnum
    having?: EmployeeScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: EmployeeCountAggregateInputType | true
    _avg?: EmployeeAvgAggregateInputType
    _sum?: EmployeeSumAggregateInputType
    _min?: EmployeeMinAggregateInputType
    _max?: EmployeeMaxAggregateInputType
  }

  export type EmployeeGroupByOutputType = {
    id: number
    employeeCode: string
    name: string
    gender: $Enums.Sex
    birthDate: Date | null
    password: string
    role: $Enums.Role
    avatar: string | null
    _count: EmployeeCountAggregateOutputType | null
    _avg: EmployeeAvgAggregateOutputType | null
    _sum: EmployeeSumAggregateOutputType | null
    _min: EmployeeMinAggregateOutputType | null
    _max: EmployeeMaxAggregateOutputType | null
  }

  type GetEmployeeGroupByPayload<T extends EmployeeGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<EmployeeGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof EmployeeGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], EmployeeGroupByOutputType[P]>
            : GetScalarType<T[P], EmployeeGroupByOutputType[P]>
        }
      >
    >


  export type EmployeeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    employeeCode?: boolean
    name?: boolean
    gender?: boolean
    birthDate?: boolean
    password?: boolean
    role?: boolean
    avatar?: boolean
    workInfo?: boolean | Employee$workInfoArgs<ExtArgs>
    personalInfo?: boolean | Employee$personalInfoArgs<ExtArgs>
    contactInfo?: boolean | Employee$contactInfoArgs<ExtArgs>
    otherInfo?: boolean | Employee$otherInfoArgs<ExtArgs>
    LeaveRequest?: boolean | Employee$LeaveRequestArgs<ExtArgs>
    Attendance?: boolean | Employee$AttendanceArgs<ExtArgs>
    _count?: boolean | EmployeeCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["employee"]>



  export type EmployeeSelectScalar = {
    id?: boolean
    employeeCode?: boolean
    name?: boolean
    gender?: boolean
    birthDate?: boolean
    password?: boolean
    role?: boolean
    avatar?: boolean
  }

  export type EmployeeOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "employeeCode" | "name" | "gender" | "birthDate" | "password" | "role" | "avatar", ExtArgs["result"]["employee"]>
  export type EmployeeInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    workInfo?: boolean | Employee$workInfoArgs<ExtArgs>
    personalInfo?: boolean | Employee$personalInfoArgs<ExtArgs>
    contactInfo?: boolean | Employee$contactInfoArgs<ExtArgs>
    otherInfo?: boolean | Employee$otherInfoArgs<ExtArgs>
    LeaveRequest?: boolean | Employee$LeaveRequestArgs<ExtArgs>
    Attendance?: boolean | Employee$AttendanceArgs<ExtArgs>
    _count?: boolean | EmployeeCountOutputTypeDefaultArgs<ExtArgs>
  }

  export type $EmployeePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Employee"
    objects: {
      workInfo: Prisma.$WorkInfoPayload<ExtArgs> | null
      personalInfo: Prisma.$PersonalInfoPayload<ExtArgs> | null
      contactInfo: Prisma.$ContactInfoPayload<ExtArgs> | null
      otherInfo: Prisma.$OtherInfoPayload<ExtArgs> | null
      LeaveRequest: Prisma.$LeaveRequestPayload<ExtArgs>[]
      Attendance: Prisma.$AttendancePayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: number
      employeeCode: string
      name: string
      gender: $Enums.Sex
      birthDate: Date | null
      password: string
      role: $Enums.Role
      avatar: string | null
    }, ExtArgs["result"]["employee"]>
    composites: {}
  }

  type EmployeeGetPayload<S extends boolean | null | undefined | EmployeeDefaultArgs> = $Result.GetResult<Prisma.$EmployeePayload, S>

  type EmployeeCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<EmployeeFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: EmployeeCountAggregateInputType | true
    }

  export interface EmployeeDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Employee'], meta: { name: 'Employee' } }
    /**
     * Find zero or one Employee that matches the filter.
     * @param {EmployeeFindUniqueArgs} args - Arguments to find a Employee
     * @example
     * // Get one Employee
     * const employee = await prisma.employee.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends EmployeeFindUniqueArgs>(args: SelectSubset<T, EmployeeFindUniqueArgs<ExtArgs>>): Prisma__EmployeeClient<$Result.GetResult<Prisma.$EmployeePayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Employee that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {EmployeeFindUniqueOrThrowArgs} args - Arguments to find a Employee
     * @example
     * // Get one Employee
     * const employee = await prisma.employee.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends EmployeeFindUniqueOrThrowArgs>(args: SelectSubset<T, EmployeeFindUniqueOrThrowArgs<ExtArgs>>): Prisma__EmployeeClient<$Result.GetResult<Prisma.$EmployeePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Employee that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {EmployeeFindFirstArgs} args - Arguments to find a Employee
     * @example
     * // Get one Employee
     * const employee = await prisma.employee.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends EmployeeFindFirstArgs>(args?: SelectSubset<T, EmployeeFindFirstArgs<ExtArgs>>): Prisma__EmployeeClient<$Result.GetResult<Prisma.$EmployeePayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Employee that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {EmployeeFindFirstOrThrowArgs} args - Arguments to find a Employee
     * @example
     * // Get one Employee
     * const employee = await prisma.employee.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends EmployeeFindFirstOrThrowArgs>(args?: SelectSubset<T, EmployeeFindFirstOrThrowArgs<ExtArgs>>): Prisma__EmployeeClient<$Result.GetResult<Prisma.$EmployeePayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Employees that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {EmployeeFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Employees
     * const employees = await prisma.employee.findMany()
     * 
     * // Get first 10 Employees
     * const employees = await prisma.employee.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const employeeWithIdOnly = await prisma.employee.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends EmployeeFindManyArgs>(args?: SelectSubset<T, EmployeeFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$EmployeePayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Employee.
     * @param {EmployeeCreateArgs} args - Arguments to create a Employee.
     * @example
     * // Create one Employee
     * const Employee = await prisma.employee.create({
     *   data: {
     *     // ... data to create a Employee
     *   }
     * })
     * 
     */
    create<T extends EmployeeCreateArgs>(args: SelectSubset<T, EmployeeCreateArgs<ExtArgs>>): Prisma__EmployeeClient<$Result.GetResult<Prisma.$EmployeePayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Employees.
     * @param {EmployeeCreateManyArgs} args - Arguments to create many Employees.
     * @example
     * // Create many Employees
     * const employee = await prisma.employee.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends EmployeeCreateManyArgs>(args?: SelectSubset<T, EmployeeCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a Employee.
     * @param {EmployeeDeleteArgs} args - Arguments to delete one Employee.
     * @example
     * // Delete one Employee
     * const Employee = await prisma.employee.delete({
     *   where: {
     *     // ... filter to delete one Employee
     *   }
     * })
     * 
     */
    delete<T extends EmployeeDeleteArgs>(args: SelectSubset<T, EmployeeDeleteArgs<ExtArgs>>): Prisma__EmployeeClient<$Result.GetResult<Prisma.$EmployeePayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Employee.
     * @param {EmployeeUpdateArgs} args - Arguments to update one Employee.
     * @example
     * // Update one Employee
     * const employee = await prisma.employee.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends EmployeeUpdateArgs>(args: SelectSubset<T, EmployeeUpdateArgs<ExtArgs>>): Prisma__EmployeeClient<$Result.GetResult<Prisma.$EmployeePayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Employees.
     * @param {EmployeeDeleteManyArgs} args - Arguments to filter Employees to delete.
     * @example
     * // Delete a few Employees
     * const { count } = await prisma.employee.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends EmployeeDeleteManyArgs>(args?: SelectSubset<T, EmployeeDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Employees.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {EmployeeUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Employees
     * const employee = await prisma.employee.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends EmployeeUpdateManyArgs>(args: SelectSubset<T, EmployeeUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Employee.
     * @param {EmployeeUpsertArgs} args - Arguments to update or create a Employee.
     * @example
     * // Update or create a Employee
     * const employee = await prisma.employee.upsert({
     *   create: {
     *     // ... data to create a Employee
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Employee we want to update
     *   }
     * })
     */
    upsert<T extends EmployeeUpsertArgs>(args: SelectSubset<T, EmployeeUpsertArgs<ExtArgs>>): Prisma__EmployeeClient<$Result.GetResult<Prisma.$EmployeePayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Employees.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {EmployeeCountArgs} args - Arguments to filter Employees to count.
     * @example
     * // Count the number of Employees
     * const count = await prisma.employee.count({
     *   where: {
     *     // ... the filter for the Employees we want to count
     *   }
     * })
    **/
    count<T extends EmployeeCountArgs>(
      args?: Subset<T, EmployeeCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], EmployeeCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Employee.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {EmployeeAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends EmployeeAggregateArgs>(args: Subset<T, EmployeeAggregateArgs>): Prisma.PrismaPromise<GetEmployeeAggregateType<T>>

    /**
     * Group by Employee.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {EmployeeGroupByArgs} args - Group by arguments.
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
      T extends EmployeeGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: EmployeeGroupByArgs['orderBy'] }
        : { orderBy?: EmployeeGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, EmployeeGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetEmployeeGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Employee model
   */
  readonly fields: EmployeeFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Employee.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__EmployeeClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    workInfo<T extends Employee$workInfoArgs<ExtArgs> = {}>(args?: Subset<T, Employee$workInfoArgs<ExtArgs>>): Prisma__WorkInfoClient<$Result.GetResult<Prisma.$WorkInfoPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>
    personalInfo<T extends Employee$personalInfoArgs<ExtArgs> = {}>(args?: Subset<T, Employee$personalInfoArgs<ExtArgs>>): Prisma__PersonalInfoClient<$Result.GetResult<Prisma.$PersonalInfoPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>
    contactInfo<T extends Employee$contactInfoArgs<ExtArgs> = {}>(args?: Subset<T, Employee$contactInfoArgs<ExtArgs>>): Prisma__ContactInfoClient<$Result.GetResult<Prisma.$ContactInfoPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>
    otherInfo<T extends Employee$otherInfoArgs<ExtArgs> = {}>(args?: Subset<T, Employee$otherInfoArgs<ExtArgs>>): Prisma__OtherInfoClient<$Result.GetResult<Prisma.$OtherInfoPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>
    LeaveRequest<T extends Employee$LeaveRequestArgs<ExtArgs> = {}>(args?: Subset<T, Employee$LeaveRequestArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$LeaveRequestPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    Attendance<T extends Employee$AttendanceArgs<ExtArgs> = {}>(args?: Subset<T, Employee$AttendanceArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AttendancePayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
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
   * Fields of the Employee model
   */
  interface EmployeeFieldRefs {
    readonly id: FieldRef<"Employee", 'Int'>
    readonly employeeCode: FieldRef<"Employee", 'String'>
    readonly name: FieldRef<"Employee", 'String'>
    readonly gender: FieldRef<"Employee", 'Sex'>
    readonly birthDate: FieldRef<"Employee", 'DateTime'>
    readonly password: FieldRef<"Employee", 'String'>
    readonly role: FieldRef<"Employee", 'Role'>
    readonly avatar: FieldRef<"Employee", 'String'>
  }
    

  // Custom InputTypes
  /**
   * Employee findUnique
   */
  export type EmployeeFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Employee
     */
    select?: EmployeeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Employee
     */
    omit?: EmployeeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EmployeeInclude<ExtArgs> | null
    /**
     * Filter, which Employee to fetch.
     */
    where: EmployeeWhereUniqueInput
  }

  /**
   * Employee findUniqueOrThrow
   */
  export type EmployeeFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Employee
     */
    select?: EmployeeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Employee
     */
    omit?: EmployeeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EmployeeInclude<ExtArgs> | null
    /**
     * Filter, which Employee to fetch.
     */
    where: EmployeeWhereUniqueInput
  }

  /**
   * Employee findFirst
   */
  export type EmployeeFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Employee
     */
    select?: EmployeeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Employee
     */
    omit?: EmployeeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EmployeeInclude<ExtArgs> | null
    /**
     * Filter, which Employee to fetch.
     */
    where?: EmployeeWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Employees to fetch.
     */
    orderBy?: EmployeeOrderByWithRelationInput | EmployeeOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Employees.
     */
    cursor?: EmployeeWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Employees from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Employees.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Employees.
     */
    distinct?: EmployeeScalarFieldEnum | EmployeeScalarFieldEnum[]
  }

  /**
   * Employee findFirstOrThrow
   */
  export type EmployeeFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Employee
     */
    select?: EmployeeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Employee
     */
    omit?: EmployeeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EmployeeInclude<ExtArgs> | null
    /**
     * Filter, which Employee to fetch.
     */
    where?: EmployeeWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Employees to fetch.
     */
    orderBy?: EmployeeOrderByWithRelationInput | EmployeeOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Employees.
     */
    cursor?: EmployeeWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Employees from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Employees.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Employees.
     */
    distinct?: EmployeeScalarFieldEnum | EmployeeScalarFieldEnum[]
  }

  /**
   * Employee findMany
   */
  export type EmployeeFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Employee
     */
    select?: EmployeeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Employee
     */
    omit?: EmployeeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EmployeeInclude<ExtArgs> | null
    /**
     * Filter, which Employees to fetch.
     */
    where?: EmployeeWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Employees to fetch.
     */
    orderBy?: EmployeeOrderByWithRelationInput | EmployeeOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Employees.
     */
    cursor?: EmployeeWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Employees from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Employees.
     */
    skip?: number
    distinct?: EmployeeScalarFieldEnum | EmployeeScalarFieldEnum[]
  }

  /**
   * Employee create
   */
  export type EmployeeCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Employee
     */
    select?: EmployeeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Employee
     */
    omit?: EmployeeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EmployeeInclude<ExtArgs> | null
    /**
     * The data needed to create a Employee.
     */
    data: XOR<EmployeeCreateInput, EmployeeUncheckedCreateInput>
  }

  /**
   * Employee createMany
   */
  export type EmployeeCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Employees.
     */
    data: EmployeeCreateManyInput | EmployeeCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Employee update
   */
  export type EmployeeUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Employee
     */
    select?: EmployeeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Employee
     */
    omit?: EmployeeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EmployeeInclude<ExtArgs> | null
    /**
     * The data needed to update a Employee.
     */
    data: XOR<EmployeeUpdateInput, EmployeeUncheckedUpdateInput>
    /**
     * Choose, which Employee to update.
     */
    where: EmployeeWhereUniqueInput
  }

  /**
   * Employee updateMany
   */
  export type EmployeeUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Employees.
     */
    data: XOR<EmployeeUpdateManyMutationInput, EmployeeUncheckedUpdateManyInput>
    /**
     * Filter which Employees to update
     */
    where?: EmployeeWhereInput
    /**
     * Limit how many Employees to update.
     */
    limit?: number
  }

  /**
   * Employee upsert
   */
  export type EmployeeUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Employee
     */
    select?: EmployeeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Employee
     */
    omit?: EmployeeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EmployeeInclude<ExtArgs> | null
    /**
     * The filter to search for the Employee to update in case it exists.
     */
    where: EmployeeWhereUniqueInput
    /**
     * In case the Employee found by the `where` argument doesn't exist, create a new Employee with this data.
     */
    create: XOR<EmployeeCreateInput, EmployeeUncheckedCreateInput>
    /**
     * In case the Employee was found with the provided `where` argument, update it with this data.
     */
    update: XOR<EmployeeUpdateInput, EmployeeUncheckedUpdateInput>
  }

  /**
   * Employee delete
   */
  export type EmployeeDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Employee
     */
    select?: EmployeeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Employee
     */
    omit?: EmployeeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EmployeeInclude<ExtArgs> | null
    /**
     * Filter which Employee to delete.
     */
    where: EmployeeWhereUniqueInput
  }

  /**
   * Employee deleteMany
   */
  export type EmployeeDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Employees to delete
     */
    where?: EmployeeWhereInput
    /**
     * Limit how many Employees to delete.
     */
    limit?: number
  }

  /**
   * Employee.workInfo
   */
  export type Employee$workInfoArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WorkInfo
     */
    select?: WorkInfoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the WorkInfo
     */
    omit?: WorkInfoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WorkInfoInclude<ExtArgs> | null
    where?: WorkInfoWhereInput
  }

  /**
   * Employee.personalInfo
   */
  export type Employee$personalInfoArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PersonalInfo
     */
    select?: PersonalInfoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PersonalInfo
     */
    omit?: PersonalInfoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PersonalInfoInclude<ExtArgs> | null
    where?: PersonalInfoWhereInput
  }

  /**
   * Employee.contactInfo
   */
  export type Employee$contactInfoArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ContactInfo
     */
    select?: ContactInfoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ContactInfo
     */
    omit?: ContactInfoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ContactInfoInclude<ExtArgs> | null
    where?: ContactInfoWhereInput
  }

  /**
   * Employee.otherInfo
   */
  export type Employee$otherInfoArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OtherInfo
     */
    select?: OtherInfoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OtherInfo
     */
    omit?: OtherInfoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OtherInfoInclude<ExtArgs> | null
    where?: OtherInfoWhereInput
  }

  /**
   * Employee.LeaveRequest
   */
  export type Employee$LeaveRequestArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LeaveRequest
     */
    select?: LeaveRequestSelect<ExtArgs> | null
    /**
     * Omit specific fields from the LeaveRequest
     */
    omit?: LeaveRequestOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LeaveRequestInclude<ExtArgs> | null
    where?: LeaveRequestWhereInput
    orderBy?: LeaveRequestOrderByWithRelationInput | LeaveRequestOrderByWithRelationInput[]
    cursor?: LeaveRequestWhereUniqueInput
    take?: number
    skip?: number
    distinct?: LeaveRequestScalarFieldEnum | LeaveRequestScalarFieldEnum[]
  }

  /**
   * Employee.Attendance
   */
  export type Employee$AttendanceArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Attendance
     */
    select?: AttendanceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Attendance
     */
    omit?: AttendanceOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AttendanceInclude<ExtArgs> | null
    where?: AttendanceWhereInput
    orderBy?: AttendanceOrderByWithRelationInput | AttendanceOrderByWithRelationInput[]
    cursor?: AttendanceWhereUniqueInput
    take?: number
    skip?: number
    distinct?: AttendanceScalarFieldEnum | AttendanceScalarFieldEnum[]
  }

  /**
   * Employee without action
   */
  export type EmployeeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Employee
     */
    select?: EmployeeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Employee
     */
    omit?: EmployeeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EmployeeInclude<ExtArgs> | null
  }


  /**
   * Model WorkInfo
   */

  export type AggregateWorkInfo = {
    _count: WorkInfoCountAggregateOutputType | null
    _avg: WorkInfoAvgAggregateOutputType | null
    _sum: WorkInfoSumAggregateOutputType | null
    _min: WorkInfoMinAggregateOutputType | null
    _max: WorkInfoMaxAggregateOutputType | null
  }

  export type WorkInfoAvgAggregateOutputType = {
    id: number | null
    employeeId: number | null
  }

  export type WorkInfoSumAggregateOutputType = {
    id: number | null
    employeeId: number | null
  }

  export type WorkInfoMinAggregateOutputType = {
    id: number | null
    department: string | null
    position: string | null
    specialization: string | null
    joinedTBD: Date | null
    joinedTeSCC: Date | null
    seniorityStart: Date | null
    seniority: string | null
    contractNumber: string | null
    contractDate: Date | null
    contractType: string | null
    contractEndDate: Date | null
    employeeId: number | null
  }

  export type WorkInfoMaxAggregateOutputType = {
    id: number | null
    department: string | null
    position: string | null
    specialization: string | null
    joinedTBD: Date | null
    joinedTeSCC: Date | null
    seniorityStart: Date | null
    seniority: string | null
    contractNumber: string | null
    contractDate: Date | null
    contractType: string | null
    contractEndDate: Date | null
    employeeId: number | null
  }

  export type WorkInfoCountAggregateOutputType = {
    id: number
    department: number
    position: number
    specialization: number
    joinedTBD: number
    joinedTeSCC: number
    seniorityStart: number
    seniority: number
    contractNumber: number
    contractDate: number
    contractType: number
    contractEndDate: number
    employeeId: number
    _all: number
  }


  export type WorkInfoAvgAggregateInputType = {
    id?: true
    employeeId?: true
  }

  export type WorkInfoSumAggregateInputType = {
    id?: true
    employeeId?: true
  }

  export type WorkInfoMinAggregateInputType = {
    id?: true
    department?: true
    position?: true
    specialization?: true
    joinedTBD?: true
    joinedTeSCC?: true
    seniorityStart?: true
    seniority?: true
    contractNumber?: true
    contractDate?: true
    contractType?: true
    contractEndDate?: true
    employeeId?: true
  }

  export type WorkInfoMaxAggregateInputType = {
    id?: true
    department?: true
    position?: true
    specialization?: true
    joinedTBD?: true
    joinedTeSCC?: true
    seniorityStart?: true
    seniority?: true
    contractNumber?: true
    contractDate?: true
    contractType?: true
    contractEndDate?: true
    employeeId?: true
  }

  export type WorkInfoCountAggregateInputType = {
    id?: true
    department?: true
    position?: true
    specialization?: true
    joinedTBD?: true
    joinedTeSCC?: true
    seniorityStart?: true
    seniority?: true
    contractNumber?: true
    contractDate?: true
    contractType?: true
    contractEndDate?: true
    employeeId?: true
    _all?: true
  }

  export type WorkInfoAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which WorkInfo to aggregate.
     */
    where?: WorkInfoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of WorkInfos to fetch.
     */
    orderBy?: WorkInfoOrderByWithRelationInput | WorkInfoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: WorkInfoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` WorkInfos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` WorkInfos.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned WorkInfos
    **/
    _count?: true | WorkInfoCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: WorkInfoAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: WorkInfoSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: WorkInfoMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: WorkInfoMaxAggregateInputType
  }

  export type GetWorkInfoAggregateType<T extends WorkInfoAggregateArgs> = {
        [P in keyof T & keyof AggregateWorkInfo]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateWorkInfo[P]>
      : GetScalarType<T[P], AggregateWorkInfo[P]>
  }




  export type WorkInfoGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: WorkInfoWhereInput
    orderBy?: WorkInfoOrderByWithAggregationInput | WorkInfoOrderByWithAggregationInput[]
    by: WorkInfoScalarFieldEnum[] | WorkInfoScalarFieldEnum
    having?: WorkInfoScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: WorkInfoCountAggregateInputType | true
    _avg?: WorkInfoAvgAggregateInputType
    _sum?: WorkInfoSumAggregateInputType
    _min?: WorkInfoMinAggregateInputType
    _max?: WorkInfoMaxAggregateInputType
  }

  export type WorkInfoGroupByOutputType = {
    id: number
    department: string
    position: string
    specialization: string | null
    joinedTBD: Date | null
    joinedTeSCC: Date | null
    seniorityStart: Date | null
    seniority: string | null
    contractNumber: string | null
    contractDate: Date | null
    contractType: string | null
    contractEndDate: Date | null
    employeeId: number
    _count: WorkInfoCountAggregateOutputType | null
    _avg: WorkInfoAvgAggregateOutputType | null
    _sum: WorkInfoSumAggregateOutputType | null
    _min: WorkInfoMinAggregateOutputType | null
    _max: WorkInfoMaxAggregateOutputType | null
  }

  type GetWorkInfoGroupByPayload<T extends WorkInfoGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<WorkInfoGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof WorkInfoGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], WorkInfoGroupByOutputType[P]>
            : GetScalarType<T[P], WorkInfoGroupByOutputType[P]>
        }
      >
    >


  export type WorkInfoSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    department?: boolean
    position?: boolean
    specialization?: boolean
    joinedTBD?: boolean
    joinedTeSCC?: boolean
    seniorityStart?: boolean
    seniority?: boolean
    contractNumber?: boolean
    contractDate?: boolean
    contractType?: boolean
    contractEndDate?: boolean
    employeeId?: boolean
    employee?: boolean | EmployeeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["workInfo"]>



  export type WorkInfoSelectScalar = {
    id?: boolean
    department?: boolean
    position?: boolean
    specialization?: boolean
    joinedTBD?: boolean
    joinedTeSCC?: boolean
    seniorityStart?: boolean
    seniority?: boolean
    contractNumber?: boolean
    contractDate?: boolean
    contractType?: boolean
    contractEndDate?: boolean
    employeeId?: boolean
  }

  export type WorkInfoOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "department" | "position" | "specialization" | "joinedTBD" | "joinedTeSCC" | "seniorityStart" | "seniority" | "contractNumber" | "contractDate" | "contractType" | "contractEndDate" | "employeeId", ExtArgs["result"]["workInfo"]>
  export type WorkInfoInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    employee?: boolean | EmployeeDefaultArgs<ExtArgs>
  }

  export type $WorkInfoPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "WorkInfo"
    objects: {
      employee: Prisma.$EmployeePayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: number
      department: string
      position: string
      specialization: string | null
      joinedTBD: Date | null
      joinedTeSCC: Date | null
      seniorityStart: Date | null
      seniority: string | null
      contractNumber: string | null
      contractDate: Date | null
      contractType: string | null
      contractEndDate: Date | null
      employeeId: number
    }, ExtArgs["result"]["workInfo"]>
    composites: {}
  }

  type WorkInfoGetPayload<S extends boolean | null | undefined | WorkInfoDefaultArgs> = $Result.GetResult<Prisma.$WorkInfoPayload, S>

  type WorkInfoCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<WorkInfoFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: WorkInfoCountAggregateInputType | true
    }

  export interface WorkInfoDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['WorkInfo'], meta: { name: 'WorkInfo' } }
    /**
     * Find zero or one WorkInfo that matches the filter.
     * @param {WorkInfoFindUniqueArgs} args - Arguments to find a WorkInfo
     * @example
     * // Get one WorkInfo
     * const workInfo = await prisma.workInfo.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends WorkInfoFindUniqueArgs>(args: SelectSubset<T, WorkInfoFindUniqueArgs<ExtArgs>>): Prisma__WorkInfoClient<$Result.GetResult<Prisma.$WorkInfoPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one WorkInfo that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {WorkInfoFindUniqueOrThrowArgs} args - Arguments to find a WorkInfo
     * @example
     * // Get one WorkInfo
     * const workInfo = await prisma.workInfo.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends WorkInfoFindUniqueOrThrowArgs>(args: SelectSubset<T, WorkInfoFindUniqueOrThrowArgs<ExtArgs>>): Prisma__WorkInfoClient<$Result.GetResult<Prisma.$WorkInfoPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first WorkInfo that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WorkInfoFindFirstArgs} args - Arguments to find a WorkInfo
     * @example
     * // Get one WorkInfo
     * const workInfo = await prisma.workInfo.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends WorkInfoFindFirstArgs>(args?: SelectSubset<T, WorkInfoFindFirstArgs<ExtArgs>>): Prisma__WorkInfoClient<$Result.GetResult<Prisma.$WorkInfoPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first WorkInfo that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WorkInfoFindFirstOrThrowArgs} args - Arguments to find a WorkInfo
     * @example
     * // Get one WorkInfo
     * const workInfo = await prisma.workInfo.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends WorkInfoFindFirstOrThrowArgs>(args?: SelectSubset<T, WorkInfoFindFirstOrThrowArgs<ExtArgs>>): Prisma__WorkInfoClient<$Result.GetResult<Prisma.$WorkInfoPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more WorkInfos that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WorkInfoFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all WorkInfos
     * const workInfos = await prisma.workInfo.findMany()
     * 
     * // Get first 10 WorkInfos
     * const workInfos = await prisma.workInfo.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const workInfoWithIdOnly = await prisma.workInfo.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends WorkInfoFindManyArgs>(args?: SelectSubset<T, WorkInfoFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$WorkInfoPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a WorkInfo.
     * @param {WorkInfoCreateArgs} args - Arguments to create a WorkInfo.
     * @example
     * // Create one WorkInfo
     * const WorkInfo = await prisma.workInfo.create({
     *   data: {
     *     // ... data to create a WorkInfo
     *   }
     * })
     * 
     */
    create<T extends WorkInfoCreateArgs>(args: SelectSubset<T, WorkInfoCreateArgs<ExtArgs>>): Prisma__WorkInfoClient<$Result.GetResult<Prisma.$WorkInfoPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many WorkInfos.
     * @param {WorkInfoCreateManyArgs} args - Arguments to create many WorkInfos.
     * @example
     * // Create many WorkInfos
     * const workInfo = await prisma.workInfo.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends WorkInfoCreateManyArgs>(args?: SelectSubset<T, WorkInfoCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a WorkInfo.
     * @param {WorkInfoDeleteArgs} args - Arguments to delete one WorkInfo.
     * @example
     * // Delete one WorkInfo
     * const WorkInfo = await prisma.workInfo.delete({
     *   where: {
     *     // ... filter to delete one WorkInfo
     *   }
     * })
     * 
     */
    delete<T extends WorkInfoDeleteArgs>(args: SelectSubset<T, WorkInfoDeleteArgs<ExtArgs>>): Prisma__WorkInfoClient<$Result.GetResult<Prisma.$WorkInfoPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one WorkInfo.
     * @param {WorkInfoUpdateArgs} args - Arguments to update one WorkInfo.
     * @example
     * // Update one WorkInfo
     * const workInfo = await prisma.workInfo.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends WorkInfoUpdateArgs>(args: SelectSubset<T, WorkInfoUpdateArgs<ExtArgs>>): Prisma__WorkInfoClient<$Result.GetResult<Prisma.$WorkInfoPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more WorkInfos.
     * @param {WorkInfoDeleteManyArgs} args - Arguments to filter WorkInfos to delete.
     * @example
     * // Delete a few WorkInfos
     * const { count } = await prisma.workInfo.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends WorkInfoDeleteManyArgs>(args?: SelectSubset<T, WorkInfoDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more WorkInfos.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WorkInfoUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many WorkInfos
     * const workInfo = await prisma.workInfo.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends WorkInfoUpdateManyArgs>(args: SelectSubset<T, WorkInfoUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one WorkInfo.
     * @param {WorkInfoUpsertArgs} args - Arguments to update or create a WorkInfo.
     * @example
     * // Update or create a WorkInfo
     * const workInfo = await prisma.workInfo.upsert({
     *   create: {
     *     // ... data to create a WorkInfo
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the WorkInfo we want to update
     *   }
     * })
     */
    upsert<T extends WorkInfoUpsertArgs>(args: SelectSubset<T, WorkInfoUpsertArgs<ExtArgs>>): Prisma__WorkInfoClient<$Result.GetResult<Prisma.$WorkInfoPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of WorkInfos.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WorkInfoCountArgs} args - Arguments to filter WorkInfos to count.
     * @example
     * // Count the number of WorkInfos
     * const count = await prisma.workInfo.count({
     *   where: {
     *     // ... the filter for the WorkInfos we want to count
     *   }
     * })
    **/
    count<T extends WorkInfoCountArgs>(
      args?: Subset<T, WorkInfoCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], WorkInfoCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a WorkInfo.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WorkInfoAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends WorkInfoAggregateArgs>(args: Subset<T, WorkInfoAggregateArgs>): Prisma.PrismaPromise<GetWorkInfoAggregateType<T>>

    /**
     * Group by WorkInfo.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WorkInfoGroupByArgs} args - Group by arguments.
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
      T extends WorkInfoGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: WorkInfoGroupByArgs['orderBy'] }
        : { orderBy?: WorkInfoGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, WorkInfoGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetWorkInfoGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the WorkInfo model
   */
  readonly fields: WorkInfoFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for WorkInfo.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__WorkInfoClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    employee<T extends EmployeeDefaultArgs<ExtArgs> = {}>(args?: Subset<T, EmployeeDefaultArgs<ExtArgs>>): Prisma__EmployeeClient<$Result.GetResult<Prisma.$EmployeePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
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
   * Fields of the WorkInfo model
   */
  interface WorkInfoFieldRefs {
    readonly id: FieldRef<"WorkInfo", 'Int'>
    readonly department: FieldRef<"WorkInfo", 'String'>
    readonly position: FieldRef<"WorkInfo", 'String'>
    readonly specialization: FieldRef<"WorkInfo", 'String'>
    readonly joinedTBD: FieldRef<"WorkInfo", 'DateTime'>
    readonly joinedTeSCC: FieldRef<"WorkInfo", 'DateTime'>
    readonly seniorityStart: FieldRef<"WorkInfo", 'DateTime'>
    readonly seniority: FieldRef<"WorkInfo", 'String'>
    readonly contractNumber: FieldRef<"WorkInfo", 'String'>
    readonly contractDate: FieldRef<"WorkInfo", 'DateTime'>
    readonly contractType: FieldRef<"WorkInfo", 'String'>
    readonly contractEndDate: FieldRef<"WorkInfo", 'DateTime'>
    readonly employeeId: FieldRef<"WorkInfo", 'Int'>
  }
    

  // Custom InputTypes
  /**
   * WorkInfo findUnique
   */
  export type WorkInfoFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WorkInfo
     */
    select?: WorkInfoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the WorkInfo
     */
    omit?: WorkInfoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WorkInfoInclude<ExtArgs> | null
    /**
     * Filter, which WorkInfo to fetch.
     */
    where: WorkInfoWhereUniqueInput
  }

  /**
   * WorkInfo findUniqueOrThrow
   */
  export type WorkInfoFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WorkInfo
     */
    select?: WorkInfoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the WorkInfo
     */
    omit?: WorkInfoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WorkInfoInclude<ExtArgs> | null
    /**
     * Filter, which WorkInfo to fetch.
     */
    where: WorkInfoWhereUniqueInput
  }

  /**
   * WorkInfo findFirst
   */
  export type WorkInfoFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WorkInfo
     */
    select?: WorkInfoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the WorkInfo
     */
    omit?: WorkInfoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WorkInfoInclude<ExtArgs> | null
    /**
     * Filter, which WorkInfo to fetch.
     */
    where?: WorkInfoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of WorkInfos to fetch.
     */
    orderBy?: WorkInfoOrderByWithRelationInput | WorkInfoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for WorkInfos.
     */
    cursor?: WorkInfoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` WorkInfos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` WorkInfos.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of WorkInfos.
     */
    distinct?: WorkInfoScalarFieldEnum | WorkInfoScalarFieldEnum[]
  }

  /**
   * WorkInfo findFirstOrThrow
   */
  export type WorkInfoFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WorkInfo
     */
    select?: WorkInfoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the WorkInfo
     */
    omit?: WorkInfoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WorkInfoInclude<ExtArgs> | null
    /**
     * Filter, which WorkInfo to fetch.
     */
    where?: WorkInfoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of WorkInfos to fetch.
     */
    orderBy?: WorkInfoOrderByWithRelationInput | WorkInfoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for WorkInfos.
     */
    cursor?: WorkInfoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` WorkInfos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` WorkInfos.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of WorkInfos.
     */
    distinct?: WorkInfoScalarFieldEnum | WorkInfoScalarFieldEnum[]
  }

  /**
   * WorkInfo findMany
   */
  export type WorkInfoFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WorkInfo
     */
    select?: WorkInfoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the WorkInfo
     */
    omit?: WorkInfoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WorkInfoInclude<ExtArgs> | null
    /**
     * Filter, which WorkInfos to fetch.
     */
    where?: WorkInfoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of WorkInfos to fetch.
     */
    orderBy?: WorkInfoOrderByWithRelationInput | WorkInfoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing WorkInfos.
     */
    cursor?: WorkInfoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` WorkInfos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` WorkInfos.
     */
    skip?: number
    distinct?: WorkInfoScalarFieldEnum | WorkInfoScalarFieldEnum[]
  }

  /**
   * WorkInfo create
   */
  export type WorkInfoCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WorkInfo
     */
    select?: WorkInfoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the WorkInfo
     */
    omit?: WorkInfoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WorkInfoInclude<ExtArgs> | null
    /**
     * The data needed to create a WorkInfo.
     */
    data: XOR<WorkInfoCreateInput, WorkInfoUncheckedCreateInput>
  }

  /**
   * WorkInfo createMany
   */
  export type WorkInfoCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many WorkInfos.
     */
    data: WorkInfoCreateManyInput | WorkInfoCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * WorkInfo update
   */
  export type WorkInfoUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WorkInfo
     */
    select?: WorkInfoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the WorkInfo
     */
    omit?: WorkInfoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WorkInfoInclude<ExtArgs> | null
    /**
     * The data needed to update a WorkInfo.
     */
    data: XOR<WorkInfoUpdateInput, WorkInfoUncheckedUpdateInput>
    /**
     * Choose, which WorkInfo to update.
     */
    where: WorkInfoWhereUniqueInput
  }

  /**
   * WorkInfo updateMany
   */
  export type WorkInfoUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update WorkInfos.
     */
    data: XOR<WorkInfoUpdateManyMutationInput, WorkInfoUncheckedUpdateManyInput>
    /**
     * Filter which WorkInfos to update
     */
    where?: WorkInfoWhereInput
    /**
     * Limit how many WorkInfos to update.
     */
    limit?: number
  }

  /**
   * WorkInfo upsert
   */
  export type WorkInfoUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WorkInfo
     */
    select?: WorkInfoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the WorkInfo
     */
    omit?: WorkInfoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WorkInfoInclude<ExtArgs> | null
    /**
     * The filter to search for the WorkInfo to update in case it exists.
     */
    where: WorkInfoWhereUniqueInput
    /**
     * In case the WorkInfo found by the `where` argument doesn't exist, create a new WorkInfo with this data.
     */
    create: XOR<WorkInfoCreateInput, WorkInfoUncheckedCreateInput>
    /**
     * In case the WorkInfo was found with the provided `where` argument, update it with this data.
     */
    update: XOR<WorkInfoUpdateInput, WorkInfoUncheckedUpdateInput>
  }

  /**
   * WorkInfo delete
   */
  export type WorkInfoDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WorkInfo
     */
    select?: WorkInfoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the WorkInfo
     */
    omit?: WorkInfoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WorkInfoInclude<ExtArgs> | null
    /**
     * Filter which WorkInfo to delete.
     */
    where: WorkInfoWhereUniqueInput
  }

  /**
   * WorkInfo deleteMany
   */
  export type WorkInfoDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which WorkInfos to delete
     */
    where?: WorkInfoWhereInput
    /**
     * Limit how many WorkInfos to delete.
     */
    limit?: number
  }

  /**
   * WorkInfo without action
   */
  export type WorkInfoDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WorkInfo
     */
    select?: WorkInfoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the WorkInfo
     */
    omit?: WorkInfoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WorkInfoInclude<ExtArgs> | null
  }


  /**
   * Model PersonalInfo
   */

  export type AggregatePersonalInfo = {
    _count: PersonalInfoCountAggregateOutputType | null
    _avg: PersonalInfoAvgAggregateOutputType | null
    _sum: PersonalInfoSumAggregateOutputType | null
    _min: PersonalInfoMinAggregateOutputType | null
    _max: PersonalInfoMaxAggregateOutputType | null
  }

  export type PersonalInfoAvgAggregateOutputType = {
    id: number | null
    insuranceSalary: number | null
    employeeId: number | null
  }

  export type PersonalInfoSumAggregateOutputType = {
    id: number | null
    insuranceSalary: number | null
    employeeId: number | null
  }

  export type PersonalInfoMinAggregateOutputType = {
    id: number | null
    identityNumber: string | null
    issueDate: Date | null
    issuePlace: string | null
    hometown: string | null
    idAddress: string | null
    education: string | null
    drivingLicense: string | null
    toyotaCertificate: string | null
    taxCode: string | null
    insuranceNumber: string | null
    insuranceSalary: number | null
    employeeId: number | null
  }

  export type PersonalInfoMaxAggregateOutputType = {
    id: number | null
    identityNumber: string | null
    issueDate: Date | null
    issuePlace: string | null
    hometown: string | null
    idAddress: string | null
    education: string | null
    drivingLicense: string | null
    toyotaCertificate: string | null
    taxCode: string | null
    insuranceNumber: string | null
    insuranceSalary: number | null
    employeeId: number | null
  }

  export type PersonalInfoCountAggregateOutputType = {
    id: number
    identityNumber: number
    issueDate: number
    issuePlace: number
    hometown: number
    idAddress: number
    education: number
    drivingLicense: number
    toyotaCertificate: number
    taxCode: number
    insuranceNumber: number
    insuranceSalary: number
    employeeId: number
    _all: number
  }


  export type PersonalInfoAvgAggregateInputType = {
    id?: true
    insuranceSalary?: true
    employeeId?: true
  }

  export type PersonalInfoSumAggregateInputType = {
    id?: true
    insuranceSalary?: true
    employeeId?: true
  }

  export type PersonalInfoMinAggregateInputType = {
    id?: true
    identityNumber?: true
    issueDate?: true
    issuePlace?: true
    hometown?: true
    idAddress?: true
    education?: true
    drivingLicense?: true
    toyotaCertificate?: true
    taxCode?: true
    insuranceNumber?: true
    insuranceSalary?: true
    employeeId?: true
  }

  export type PersonalInfoMaxAggregateInputType = {
    id?: true
    identityNumber?: true
    issueDate?: true
    issuePlace?: true
    hometown?: true
    idAddress?: true
    education?: true
    drivingLicense?: true
    toyotaCertificate?: true
    taxCode?: true
    insuranceNumber?: true
    insuranceSalary?: true
    employeeId?: true
  }

  export type PersonalInfoCountAggregateInputType = {
    id?: true
    identityNumber?: true
    issueDate?: true
    issuePlace?: true
    hometown?: true
    idAddress?: true
    education?: true
    drivingLicense?: true
    toyotaCertificate?: true
    taxCode?: true
    insuranceNumber?: true
    insuranceSalary?: true
    employeeId?: true
    _all?: true
  }

  export type PersonalInfoAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which PersonalInfo to aggregate.
     */
    where?: PersonalInfoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PersonalInfos to fetch.
     */
    orderBy?: PersonalInfoOrderByWithRelationInput | PersonalInfoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: PersonalInfoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PersonalInfos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PersonalInfos.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned PersonalInfos
    **/
    _count?: true | PersonalInfoCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: PersonalInfoAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: PersonalInfoSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: PersonalInfoMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: PersonalInfoMaxAggregateInputType
  }

  export type GetPersonalInfoAggregateType<T extends PersonalInfoAggregateArgs> = {
        [P in keyof T & keyof AggregatePersonalInfo]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregatePersonalInfo[P]>
      : GetScalarType<T[P], AggregatePersonalInfo[P]>
  }




  export type PersonalInfoGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: PersonalInfoWhereInput
    orderBy?: PersonalInfoOrderByWithAggregationInput | PersonalInfoOrderByWithAggregationInput[]
    by: PersonalInfoScalarFieldEnum[] | PersonalInfoScalarFieldEnum
    having?: PersonalInfoScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: PersonalInfoCountAggregateInputType | true
    _avg?: PersonalInfoAvgAggregateInputType
    _sum?: PersonalInfoSumAggregateInputType
    _min?: PersonalInfoMinAggregateInputType
    _max?: PersonalInfoMaxAggregateInputType
  }

  export type PersonalInfoGroupByOutputType = {
    id: number
    identityNumber: string | null
    issueDate: Date | null
    issuePlace: string | null
    hometown: string | null
    idAddress: string | null
    education: string | null
    drivingLicense: string | null
    toyotaCertificate: string | null
    taxCode: string | null
    insuranceNumber: string | null
    insuranceSalary: number | null
    employeeId: number
    _count: PersonalInfoCountAggregateOutputType | null
    _avg: PersonalInfoAvgAggregateOutputType | null
    _sum: PersonalInfoSumAggregateOutputType | null
    _min: PersonalInfoMinAggregateOutputType | null
    _max: PersonalInfoMaxAggregateOutputType | null
  }

  type GetPersonalInfoGroupByPayload<T extends PersonalInfoGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<PersonalInfoGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof PersonalInfoGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], PersonalInfoGroupByOutputType[P]>
            : GetScalarType<T[P], PersonalInfoGroupByOutputType[P]>
        }
      >
    >


  export type PersonalInfoSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    identityNumber?: boolean
    issueDate?: boolean
    issuePlace?: boolean
    hometown?: boolean
    idAddress?: boolean
    education?: boolean
    drivingLicense?: boolean
    toyotaCertificate?: boolean
    taxCode?: boolean
    insuranceNumber?: boolean
    insuranceSalary?: boolean
    employeeId?: boolean
    employee?: boolean | EmployeeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["personalInfo"]>



  export type PersonalInfoSelectScalar = {
    id?: boolean
    identityNumber?: boolean
    issueDate?: boolean
    issuePlace?: boolean
    hometown?: boolean
    idAddress?: boolean
    education?: boolean
    drivingLicense?: boolean
    toyotaCertificate?: boolean
    taxCode?: boolean
    insuranceNumber?: boolean
    insuranceSalary?: boolean
    employeeId?: boolean
  }

  export type PersonalInfoOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "identityNumber" | "issueDate" | "issuePlace" | "hometown" | "idAddress" | "education" | "drivingLicense" | "toyotaCertificate" | "taxCode" | "insuranceNumber" | "insuranceSalary" | "employeeId", ExtArgs["result"]["personalInfo"]>
  export type PersonalInfoInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    employee?: boolean | EmployeeDefaultArgs<ExtArgs>
  }

  export type $PersonalInfoPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "PersonalInfo"
    objects: {
      employee: Prisma.$EmployeePayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: number
      identityNumber: string | null
      issueDate: Date | null
      issuePlace: string | null
      hometown: string | null
      idAddress: string | null
      education: string | null
      drivingLicense: string | null
      toyotaCertificate: string | null
      taxCode: string | null
      insuranceNumber: string | null
      insuranceSalary: number | null
      employeeId: number
    }, ExtArgs["result"]["personalInfo"]>
    composites: {}
  }

  type PersonalInfoGetPayload<S extends boolean | null | undefined | PersonalInfoDefaultArgs> = $Result.GetResult<Prisma.$PersonalInfoPayload, S>

  type PersonalInfoCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<PersonalInfoFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: PersonalInfoCountAggregateInputType | true
    }

  export interface PersonalInfoDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['PersonalInfo'], meta: { name: 'PersonalInfo' } }
    /**
     * Find zero or one PersonalInfo that matches the filter.
     * @param {PersonalInfoFindUniqueArgs} args - Arguments to find a PersonalInfo
     * @example
     * // Get one PersonalInfo
     * const personalInfo = await prisma.personalInfo.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends PersonalInfoFindUniqueArgs>(args: SelectSubset<T, PersonalInfoFindUniqueArgs<ExtArgs>>): Prisma__PersonalInfoClient<$Result.GetResult<Prisma.$PersonalInfoPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one PersonalInfo that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {PersonalInfoFindUniqueOrThrowArgs} args - Arguments to find a PersonalInfo
     * @example
     * // Get one PersonalInfo
     * const personalInfo = await prisma.personalInfo.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends PersonalInfoFindUniqueOrThrowArgs>(args: SelectSubset<T, PersonalInfoFindUniqueOrThrowArgs<ExtArgs>>): Prisma__PersonalInfoClient<$Result.GetResult<Prisma.$PersonalInfoPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first PersonalInfo that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PersonalInfoFindFirstArgs} args - Arguments to find a PersonalInfo
     * @example
     * // Get one PersonalInfo
     * const personalInfo = await prisma.personalInfo.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends PersonalInfoFindFirstArgs>(args?: SelectSubset<T, PersonalInfoFindFirstArgs<ExtArgs>>): Prisma__PersonalInfoClient<$Result.GetResult<Prisma.$PersonalInfoPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first PersonalInfo that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PersonalInfoFindFirstOrThrowArgs} args - Arguments to find a PersonalInfo
     * @example
     * // Get one PersonalInfo
     * const personalInfo = await prisma.personalInfo.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends PersonalInfoFindFirstOrThrowArgs>(args?: SelectSubset<T, PersonalInfoFindFirstOrThrowArgs<ExtArgs>>): Prisma__PersonalInfoClient<$Result.GetResult<Prisma.$PersonalInfoPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more PersonalInfos that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PersonalInfoFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all PersonalInfos
     * const personalInfos = await prisma.personalInfo.findMany()
     * 
     * // Get first 10 PersonalInfos
     * const personalInfos = await prisma.personalInfo.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const personalInfoWithIdOnly = await prisma.personalInfo.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends PersonalInfoFindManyArgs>(args?: SelectSubset<T, PersonalInfoFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PersonalInfoPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a PersonalInfo.
     * @param {PersonalInfoCreateArgs} args - Arguments to create a PersonalInfo.
     * @example
     * // Create one PersonalInfo
     * const PersonalInfo = await prisma.personalInfo.create({
     *   data: {
     *     // ... data to create a PersonalInfo
     *   }
     * })
     * 
     */
    create<T extends PersonalInfoCreateArgs>(args: SelectSubset<T, PersonalInfoCreateArgs<ExtArgs>>): Prisma__PersonalInfoClient<$Result.GetResult<Prisma.$PersonalInfoPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many PersonalInfos.
     * @param {PersonalInfoCreateManyArgs} args - Arguments to create many PersonalInfos.
     * @example
     * // Create many PersonalInfos
     * const personalInfo = await prisma.personalInfo.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends PersonalInfoCreateManyArgs>(args?: SelectSubset<T, PersonalInfoCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a PersonalInfo.
     * @param {PersonalInfoDeleteArgs} args - Arguments to delete one PersonalInfo.
     * @example
     * // Delete one PersonalInfo
     * const PersonalInfo = await prisma.personalInfo.delete({
     *   where: {
     *     // ... filter to delete one PersonalInfo
     *   }
     * })
     * 
     */
    delete<T extends PersonalInfoDeleteArgs>(args: SelectSubset<T, PersonalInfoDeleteArgs<ExtArgs>>): Prisma__PersonalInfoClient<$Result.GetResult<Prisma.$PersonalInfoPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one PersonalInfo.
     * @param {PersonalInfoUpdateArgs} args - Arguments to update one PersonalInfo.
     * @example
     * // Update one PersonalInfo
     * const personalInfo = await prisma.personalInfo.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends PersonalInfoUpdateArgs>(args: SelectSubset<T, PersonalInfoUpdateArgs<ExtArgs>>): Prisma__PersonalInfoClient<$Result.GetResult<Prisma.$PersonalInfoPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more PersonalInfos.
     * @param {PersonalInfoDeleteManyArgs} args - Arguments to filter PersonalInfos to delete.
     * @example
     * // Delete a few PersonalInfos
     * const { count } = await prisma.personalInfo.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends PersonalInfoDeleteManyArgs>(args?: SelectSubset<T, PersonalInfoDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more PersonalInfos.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PersonalInfoUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many PersonalInfos
     * const personalInfo = await prisma.personalInfo.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends PersonalInfoUpdateManyArgs>(args: SelectSubset<T, PersonalInfoUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one PersonalInfo.
     * @param {PersonalInfoUpsertArgs} args - Arguments to update or create a PersonalInfo.
     * @example
     * // Update or create a PersonalInfo
     * const personalInfo = await prisma.personalInfo.upsert({
     *   create: {
     *     // ... data to create a PersonalInfo
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the PersonalInfo we want to update
     *   }
     * })
     */
    upsert<T extends PersonalInfoUpsertArgs>(args: SelectSubset<T, PersonalInfoUpsertArgs<ExtArgs>>): Prisma__PersonalInfoClient<$Result.GetResult<Prisma.$PersonalInfoPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of PersonalInfos.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PersonalInfoCountArgs} args - Arguments to filter PersonalInfos to count.
     * @example
     * // Count the number of PersonalInfos
     * const count = await prisma.personalInfo.count({
     *   where: {
     *     // ... the filter for the PersonalInfos we want to count
     *   }
     * })
    **/
    count<T extends PersonalInfoCountArgs>(
      args?: Subset<T, PersonalInfoCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], PersonalInfoCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a PersonalInfo.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PersonalInfoAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends PersonalInfoAggregateArgs>(args: Subset<T, PersonalInfoAggregateArgs>): Prisma.PrismaPromise<GetPersonalInfoAggregateType<T>>

    /**
     * Group by PersonalInfo.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PersonalInfoGroupByArgs} args - Group by arguments.
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
      T extends PersonalInfoGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: PersonalInfoGroupByArgs['orderBy'] }
        : { orderBy?: PersonalInfoGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, PersonalInfoGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetPersonalInfoGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the PersonalInfo model
   */
  readonly fields: PersonalInfoFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for PersonalInfo.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__PersonalInfoClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    employee<T extends EmployeeDefaultArgs<ExtArgs> = {}>(args?: Subset<T, EmployeeDefaultArgs<ExtArgs>>): Prisma__EmployeeClient<$Result.GetResult<Prisma.$EmployeePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
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
   * Fields of the PersonalInfo model
   */
  interface PersonalInfoFieldRefs {
    readonly id: FieldRef<"PersonalInfo", 'Int'>
    readonly identityNumber: FieldRef<"PersonalInfo", 'String'>
    readonly issueDate: FieldRef<"PersonalInfo", 'DateTime'>
    readonly issuePlace: FieldRef<"PersonalInfo", 'String'>
    readonly hometown: FieldRef<"PersonalInfo", 'String'>
    readonly idAddress: FieldRef<"PersonalInfo", 'String'>
    readonly education: FieldRef<"PersonalInfo", 'String'>
    readonly drivingLicense: FieldRef<"PersonalInfo", 'String'>
    readonly toyotaCertificate: FieldRef<"PersonalInfo", 'String'>
    readonly taxCode: FieldRef<"PersonalInfo", 'String'>
    readonly insuranceNumber: FieldRef<"PersonalInfo", 'String'>
    readonly insuranceSalary: FieldRef<"PersonalInfo", 'Int'>
    readonly employeeId: FieldRef<"PersonalInfo", 'Int'>
  }
    

  // Custom InputTypes
  /**
   * PersonalInfo findUnique
   */
  export type PersonalInfoFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PersonalInfo
     */
    select?: PersonalInfoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PersonalInfo
     */
    omit?: PersonalInfoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PersonalInfoInclude<ExtArgs> | null
    /**
     * Filter, which PersonalInfo to fetch.
     */
    where: PersonalInfoWhereUniqueInput
  }

  /**
   * PersonalInfo findUniqueOrThrow
   */
  export type PersonalInfoFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PersonalInfo
     */
    select?: PersonalInfoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PersonalInfo
     */
    omit?: PersonalInfoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PersonalInfoInclude<ExtArgs> | null
    /**
     * Filter, which PersonalInfo to fetch.
     */
    where: PersonalInfoWhereUniqueInput
  }

  /**
   * PersonalInfo findFirst
   */
  export type PersonalInfoFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PersonalInfo
     */
    select?: PersonalInfoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PersonalInfo
     */
    omit?: PersonalInfoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PersonalInfoInclude<ExtArgs> | null
    /**
     * Filter, which PersonalInfo to fetch.
     */
    where?: PersonalInfoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PersonalInfos to fetch.
     */
    orderBy?: PersonalInfoOrderByWithRelationInput | PersonalInfoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for PersonalInfos.
     */
    cursor?: PersonalInfoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PersonalInfos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PersonalInfos.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of PersonalInfos.
     */
    distinct?: PersonalInfoScalarFieldEnum | PersonalInfoScalarFieldEnum[]
  }

  /**
   * PersonalInfo findFirstOrThrow
   */
  export type PersonalInfoFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PersonalInfo
     */
    select?: PersonalInfoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PersonalInfo
     */
    omit?: PersonalInfoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PersonalInfoInclude<ExtArgs> | null
    /**
     * Filter, which PersonalInfo to fetch.
     */
    where?: PersonalInfoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PersonalInfos to fetch.
     */
    orderBy?: PersonalInfoOrderByWithRelationInput | PersonalInfoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for PersonalInfos.
     */
    cursor?: PersonalInfoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PersonalInfos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PersonalInfos.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of PersonalInfos.
     */
    distinct?: PersonalInfoScalarFieldEnum | PersonalInfoScalarFieldEnum[]
  }

  /**
   * PersonalInfo findMany
   */
  export type PersonalInfoFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PersonalInfo
     */
    select?: PersonalInfoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PersonalInfo
     */
    omit?: PersonalInfoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PersonalInfoInclude<ExtArgs> | null
    /**
     * Filter, which PersonalInfos to fetch.
     */
    where?: PersonalInfoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PersonalInfos to fetch.
     */
    orderBy?: PersonalInfoOrderByWithRelationInput | PersonalInfoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing PersonalInfos.
     */
    cursor?: PersonalInfoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PersonalInfos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PersonalInfos.
     */
    skip?: number
    distinct?: PersonalInfoScalarFieldEnum | PersonalInfoScalarFieldEnum[]
  }

  /**
   * PersonalInfo create
   */
  export type PersonalInfoCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PersonalInfo
     */
    select?: PersonalInfoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PersonalInfo
     */
    omit?: PersonalInfoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PersonalInfoInclude<ExtArgs> | null
    /**
     * The data needed to create a PersonalInfo.
     */
    data: XOR<PersonalInfoCreateInput, PersonalInfoUncheckedCreateInput>
  }

  /**
   * PersonalInfo createMany
   */
  export type PersonalInfoCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many PersonalInfos.
     */
    data: PersonalInfoCreateManyInput | PersonalInfoCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * PersonalInfo update
   */
  export type PersonalInfoUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PersonalInfo
     */
    select?: PersonalInfoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PersonalInfo
     */
    omit?: PersonalInfoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PersonalInfoInclude<ExtArgs> | null
    /**
     * The data needed to update a PersonalInfo.
     */
    data: XOR<PersonalInfoUpdateInput, PersonalInfoUncheckedUpdateInput>
    /**
     * Choose, which PersonalInfo to update.
     */
    where: PersonalInfoWhereUniqueInput
  }

  /**
   * PersonalInfo updateMany
   */
  export type PersonalInfoUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update PersonalInfos.
     */
    data: XOR<PersonalInfoUpdateManyMutationInput, PersonalInfoUncheckedUpdateManyInput>
    /**
     * Filter which PersonalInfos to update
     */
    where?: PersonalInfoWhereInput
    /**
     * Limit how many PersonalInfos to update.
     */
    limit?: number
  }

  /**
   * PersonalInfo upsert
   */
  export type PersonalInfoUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PersonalInfo
     */
    select?: PersonalInfoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PersonalInfo
     */
    omit?: PersonalInfoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PersonalInfoInclude<ExtArgs> | null
    /**
     * The filter to search for the PersonalInfo to update in case it exists.
     */
    where: PersonalInfoWhereUniqueInput
    /**
     * In case the PersonalInfo found by the `where` argument doesn't exist, create a new PersonalInfo with this data.
     */
    create: XOR<PersonalInfoCreateInput, PersonalInfoUncheckedCreateInput>
    /**
     * In case the PersonalInfo was found with the provided `where` argument, update it with this data.
     */
    update: XOR<PersonalInfoUpdateInput, PersonalInfoUncheckedUpdateInput>
  }

  /**
   * PersonalInfo delete
   */
  export type PersonalInfoDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PersonalInfo
     */
    select?: PersonalInfoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PersonalInfo
     */
    omit?: PersonalInfoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PersonalInfoInclude<ExtArgs> | null
    /**
     * Filter which PersonalInfo to delete.
     */
    where: PersonalInfoWhereUniqueInput
  }

  /**
   * PersonalInfo deleteMany
   */
  export type PersonalInfoDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which PersonalInfos to delete
     */
    where?: PersonalInfoWhereInput
    /**
     * Limit how many PersonalInfos to delete.
     */
    limit?: number
  }

  /**
   * PersonalInfo without action
   */
  export type PersonalInfoDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PersonalInfo
     */
    select?: PersonalInfoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PersonalInfo
     */
    omit?: PersonalInfoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PersonalInfoInclude<ExtArgs> | null
  }


  /**
   * Model ContactInfo
   */

  export type AggregateContactInfo = {
    _count: ContactInfoCountAggregateOutputType | null
    _avg: ContactInfoAvgAggregateOutputType | null
    _sum: ContactInfoSumAggregateOutputType | null
    _min: ContactInfoMinAggregateOutputType | null
    _max: ContactInfoMaxAggregateOutputType | null
  }

  export type ContactInfoAvgAggregateOutputType = {
    id: number | null
    employeeId: number | null
  }

  export type ContactInfoSumAggregateOutputType = {
    id: number | null
    employeeId: number | null
  }

  export type ContactInfoMinAggregateOutputType = {
    id: number | null
    phoneNumber: string | null
    relativePhone: string | null
    companyPhone: string | null
    email: string | null
    employeeId: number | null
  }

  export type ContactInfoMaxAggregateOutputType = {
    id: number | null
    phoneNumber: string | null
    relativePhone: string | null
    companyPhone: string | null
    email: string | null
    employeeId: number | null
  }

  export type ContactInfoCountAggregateOutputType = {
    id: number
    phoneNumber: number
    relativePhone: number
    companyPhone: number
    email: number
    employeeId: number
    _all: number
  }


  export type ContactInfoAvgAggregateInputType = {
    id?: true
    employeeId?: true
  }

  export type ContactInfoSumAggregateInputType = {
    id?: true
    employeeId?: true
  }

  export type ContactInfoMinAggregateInputType = {
    id?: true
    phoneNumber?: true
    relativePhone?: true
    companyPhone?: true
    email?: true
    employeeId?: true
  }

  export type ContactInfoMaxAggregateInputType = {
    id?: true
    phoneNumber?: true
    relativePhone?: true
    companyPhone?: true
    email?: true
    employeeId?: true
  }

  export type ContactInfoCountAggregateInputType = {
    id?: true
    phoneNumber?: true
    relativePhone?: true
    companyPhone?: true
    email?: true
    employeeId?: true
    _all?: true
  }

  export type ContactInfoAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ContactInfo to aggregate.
     */
    where?: ContactInfoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ContactInfos to fetch.
     */
    orderBy?: ContactInfoOrderByWithRelationInput | ContactInfoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ContactInfoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ContactInfos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ContactInfos.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned ContactInfos
    **/
    _count?: true | ContactInfoCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: ContactInfoAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: ContactInfoSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: ContactInfoMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: ContactInfoMaxAggregateInputType
  }

  export type GetContactInfoAggregateType<T extends ContactInfoAggregateArgs> = {
        [P in keyof T & keyof AggregateContactInfo]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateContactInfo[P]>
      : GetScalarType<T[P], AggregateContactInfo[P]>
  }




  export type ContactInfoGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ContactInfoWhereInput
    orderBy?: ContactInfoOrderByWithAggregationInput | ContactInfoOrderByWithAggregationInput[]
    by: ContactInfoScalarFieldEnum[] | ContactInfoScalarFieldEnum
    having?: ContactInfoScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: ContactInfoCountAggregateInputType | true
    _avg?: ContactInfoAvgAggregateInputType
    _sum?: ContactInfoSumAggregateInputType
    _min?: ContactInfoMinAggregateInputType
    _max?: ContactInfoMaxAggregateInputType
  }

  export type ContactInfoGroupByOutputType = {
    id: number
    phoneNumber: string | null
    relativePhone: string | null
    companyPhone: string | null
    email: string | null
    employeeId: number
    _count: ContactInfoCountAggregateOutputType | null
    _avg: ContactInfoAvgAggregateOutputType | null
    _sum: ContactInfoSumAggregateOutputType | null
    _min: ContactInfoMinAggregateOutputType | null
    _max: ContactInfoMaxAggregateOutputType | null
  }

  type GetContactInfoGroupByPayload<T extends ContactInfoGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<ContactInfoGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof ContactInfoGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ContactInfoGroupByOutputType[P]>
            : GetScalarType<T[P], ContactInfoGroupByOutputType[P]>
        }
      >
    >


  export type ContactInfoSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    phoneNumber?: boolean
    relativePhone?: boolean
    companyPhone?: boolean
    email?: boolean
    employeeId?: boolean
    employee?: boolean | EmployeeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["contactInfo"]>



  export type ContactInfoSelectScalar = {
    id?: boolean
    phoneNumber?: boolean
    relativePhone?: boolean
    companyPhone?: boolean
    email?: boolean
    employeeId?: boolean
  }

  export type ContactInfoOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "phoneNumber" | "relativePhone" | "companyPhone" | "email" | "employeeId", ExtArgs["result"]["contactInfo"]>
  export type ContactInfoInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    employee?: boolean | EmployeeDefaultArgs<ExtArgs>
  }

  export type $ContactInfoPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "ContactInfo"
    objects: {
      employee: Prisma.$EmployeePayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: number
      phoneNumber: string | null
      relativePhone: string | null
      companyPhone: string | null
      email: string | null
      employeeId: number
    }, ExtArgs["result"]["contactInfo"]>
    composites: {}
  }

  type ContactInfoGetPayload<S extends boolean | null | undefined | ContactInfoDefaultArgs> = $Result.GetResult<Prisma.$ContactInfoPayload, S>

  type ContactInfoCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<ContactInfoFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: ContactInfoCountAggregateInputType | true
    }

  export interface ContactInfoDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['ContactInfo'], meta: { name: 'ContactInfo' } }
    /**
     * Find zero or one ContactInfo that matches the filter.
     * @param {ContactInfoFindUniqueArgs} args - Arguments to find a ContactInfo
     * @example
     * // Get one ContactInfo
     * const contactInfo = await prisma.contactInfo.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ContactInfoFindUniqueArgs>(args: SelectSubset<T, ContactInfoFindUniqueArgs<ExtArgs>>): Prisma__ContactInfoClient<$Result.GetResult<Prisma.$ContactInfoPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one ContactInfo that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {ContactInfoFindUniqueOrThrowArgs} args - Arguments to find a ContactInfo
     * @example
     * // Get one ContactInfo
     * const contactInfo = await prisma.contactInfo.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ContactInfoFindUniqueOrThrowArgs>(args: SelectSubset<T, ContactInfoFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ContactInfoClient<$Result.GetResult<Prisma.$ContactInfoPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first ContactInfo that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ContactInfoFindFirstArgs} args - Arguments to find a ContactInfo
     * @example
     * // Get one ContactInfo
     * const contactInfo = await prisma.contactInfo.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ContactInfoFindFirstArgs>(args?: SelectSubset<T, ContactInfoFindFirstArgs<ExtArgs>>): Prisma__ContactInfoClient<$Result.GetResult<Prisma.$ContactInfoPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first ContactInfo that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ContactInfoFindFirstOrThrowArgs} args - Arguments to find a ContactInfo
     * @example
     * // Get one ContactInfo
     * const contactInfo = await prisma.contactInfo.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ContactInfoFindFirstOrThrowArgs>(args?: SelectSubset<T, ContactInfoFindFirstOrThrowArgs<ExtArgs>>): Prisma__ContactInfoClient<$Result.GetResult<Prisma.$ContactInfoPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more ContactInfos that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ContactInfoFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all ContactInfos
     * const contactInfos = await prisma.contactInfo.findMany()
     * 
     * // Get first 10 ContactInfos
     * const contactInfos = await prisma.contactInfo.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const contactInfoWithIdOnly = await prisma.contactInfo.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends ContactInfoFindManyArgs>(args?: SelectSubset<T, ContactInfoFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ContactInfoPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a ContactInfo.
     * @param {ContactInfoCreateArgs} args - Arguments to create a ContactInfo.
     * @example
     * // Create one ContactInfo
     * const ContactInfo = await prisma.contactInfo.create({
     *   data: {
     *     // ... data to create a ContactInfo
     *   }
     * })
     * 
     */
    create<T extends ContactInfoCreateArgs>(args: SelectSubset<T, ContactInfoCreateArgs<ExtArgs>>): Prisma__ContactInfoClient<$Result.GetResult<Prisma.$ContactInfoPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many ContactInfos.
     * @param {ContactInfoCreateManyArgs} args - Arguments to create many ContactInfos.
     * @example
     * // Create many ContactInfos
     * const contactInfo = await prisma.contactInfo.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ContactInfoCreateManyArgs>(args?: SelectSubset<T, ContactInfoCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a ContactInfo.
     * @param {ContactInfoDeleteArgs} args - Arguments to delete one ContactInfo.
     * @example
     * // Delete one ContactInfo
     * const ContactInfo = await prisma.contactInfo.delete({
     *   where: {
     *     // ... filter to delete one ContactInfo
     *   }
     * })
     * 
     */
    delete<T extends ContactInfoDeleteArgs>(args: SelectSubset<T, ContactInfoDeleteArgs<ExtArgs>>): Prisma__ContactInfoClient<$Result.GetResult<Prisma.$ContactInfoPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one ContactInfo.
     * @param {ContactInfoUpdateArgs} args - Arguments to update one ContactInfo.
     * @example
     * // Update one ContactInfo
     * const contactInfo = await prisma.contactInfo.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ContactInfoUpdateArgs>(args: SelectSubset<T, ContactInfoUpdateArgs<ExtArgs>>): Prisma__ContactInfoClient<$Result.GetResult<Prisma.$ContactInfoPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more ContactInfos.
     * @param {ContactInfoDeleteManyArgs} args - Arguments to filter ContactInfos to delete.
     * @example
     * // Delete a few ContactInfos
     * const { count } = await prisma.contactInfo.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ContactInfoDeleteManyArgs>(args?: SelectSubset<T, ContactInfoDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more ContactInfos.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ContactInfoUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many ContactInfos
     * const contactInfo = await prisma.contactInfo.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ContactInfoUpdateManyArgs>(args: SelectSubset<T, ContactInfoUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one ContactInfo.
     * @param {ContactInfoUpsertArgs} args - Arguments to update or create a ContactInfo.
     * @example
     * // Update or create a ContactInfo
     * const contactInfo = await prisma.contactInfo.upsert({
     *   create: {
     *     // ... data to create a ContactInfo
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the ContactInfo we want to update
     *   }
     * })
     */
    upsert<T extends ContactInfoUpsertArgs>(args: SelectSubset<T, ContactInfoUpsertArgs<ExtArgs>>): Prisma__ContactInfoClient<$Result.GetResult<Prisma.$ContactInfoPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of ContactInfos.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ContactInfoCountArgs} args - Arguments to filter ContactInfos to count.
     * @example
     * // Count the number of ContactInfos
     * const count = await prisma.contactInfo.count({
     *   where: {
     *     // ... the filter for the ContactInfos we want to count
     *   }
     * })
    **/
    count<T extends ContactInfoCountArgs>(
      args?: Subset<T, ContactInfoCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], ContactInfoCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a ContactInfo.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ContactInfoAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends ContactInfoAggregateArgs>(args: Subset<T, ContactInfoAggregateArgs>): Prisma.PrismaPromise<GetContactInfoAggregateType<T>>

    /**
     * Group by ContactInfo.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ContactInfoGroupByArgs} args - Group by arguments.
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
      T extends ContactInfoGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ContactInfoGroupByArgs['orderBy'] }
        : { orderBy?: ContactInfoGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, ContactInfoGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetContactInfoGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the ContactInfo model
   */
  readonly fields: ContactInfoFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for ContactInfo.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ContactInfoClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    employee<T extends EmployeeDefaultArgs<ExtArgs> = {}>(args?: Subset<T, EmployeeDefaultArgs<ExtArgs>>): Prisma__EmployeeClient<$Result.GetResult<Prisma.$EmployeePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
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
   * Fields of the ContactInfo model
   */
  interface ContactInfoFieldRefs {
    readonly id: FieldRef<"ContactInfo", 'Int'>
    readonly phoneNumber: FieldRef<"ContactInfo", 'String'>
    readonly relativePhone: FieldRef<"ContactInfo", 'String'>
    readonly companyPhone: FieldRef<"ContactInfo", 'String'>
    readonly email: FieldRef<"ContactInfo", 'String'>
    readonly employeeId: FieldRef<"ContactInfo", 'Int'>
  }
    

  // Custom InputTypes
  /**
   * ContactInfo findUnique
   */
  export type ContactInfoFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ContactInfo
     */
    select?: ContactInfoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ContactInfo
     */
    omit?: ContactInfoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ContactInfoInclude<ExtArgs> | null
    /**
     * Filter, which ContactInfo to fetch.
     */
    where: ContactInfoWhereUniqueInput
  }

  /**
   * ContactInfo findUniqueOrThrow
   */
  export type ContactInfoFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ContactInfo
     */
    select?: ContactInfoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ContactInfo
     */
    omit?: ContactInfoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ContactInfoInclude<ExtArgs> | null
    /**
     * Filter, which ContactInfo to fetch.
     */
    where: ContactInfoWhereUniqueInput
  }

  /**
   * ContactInfo findFirst
   */
  export type ContactInfoFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ContactInfo
     */
    select?: ContactInfoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ContactInfo
     */
    omit?: ContactInfoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ContactInfoInclude<ExtArgs> | null
    /**
     * Filter, which ContactInfo to fetch.
     */
    where?: ContactInfoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ContactInfos to fetch.
     */
    orderBy?: ContactInfoOrderByWithRelationInput | ContactInfoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ContactInfos.
     */
    cursor?: ContactInfoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ContactInfos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ContactInfos.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ContactInfos.
     */
    distinct?: ContactInfoScalarFieldEnum | ContactInfoScalarFieldEnum[]
  }

  /**
   * ContactInfo findFirstOrThrow
   */
  export type ContactInfoFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ContactInfo
     */
    select?: ContactInfoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ContactInfo
     */
    omit?: ContactInfoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ContactInfoInclude<ExtArgs> | null
    /**
     * Filter, which ContactInfo to fetch.
     */
    where?: ContactInfoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ContactInfos to fetch.
     */
    orderBy?: ContactInfoOrderByWithRelationInput | ContactInfoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ContactInfos.
     */
    cursor?: ContactInfoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ContactInfos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ContactInfos.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ContactInfos.
     */
    distinct?: ContactInfoScalarFieldEnum | ContactInfoScalarFieldEnum[]
  }

  /**
   * ContactInfo findMany
   */
  export type ContactInfoFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ContactInfo
     */
    select?: ContactInfoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ContactInfo
     */
    omit?: ContactInfoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ContactInfoInclude<ExtArgs> | null
    /**
     * Filter, which ContactInfos to fetch.
     */
    where?: ContactInfoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ContactInfos to fetch.
     */
    orderBy?: ContactInfoOrderByWithRelationInput | ContactInfoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing ContactInfos.
     */
    cursor?: ContactInfoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ContactInfos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ContactInfos.
     */
    skip?: number
    distinct?: ContactInfoScalarFieldEnum | ContactInfoScalarFieldEnum[]
  }

  /**
   * ContactInfo create
   */
  export type ContactInfoCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ContactInfo
     */
    select?: ContactInfoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ContactInfo
     */
    omit?: ContactInfoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ContactInfoInclude<ExtArgs> | null
    /**
     * The data needed to create a ContactInfo.
     */
    data: XOR<ContactInfoCreateInput, ContactInfoUncheckedCreateInput>
  }

  /**
   * ContactInfo createMany
   */
  export type ContactInfoCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many ContactInfos.
     */
    data: ContactInfoCreateManyInput | ContactInfoCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * ContactInfo update
   */
  export type ContactInfoUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ContactInfo
     */
    select?: ContactInfoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ContactInfo
     */
    omit?: ContactInfoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ContactInfoInclude<ExtArgs> | null
    /**
     * The data needed to update a ContactInfo.
     */
    data: XOR<ContactInfoUpdateInput, ContactInfoUncheckedUpdateInput>
    /**
     * Choose, which ContactInfo to update.
     */
    where: ContactInfoWhereUniqueInput
  }

  /**
   * ContactInfo updateMany
   */
  export type ContactInfoUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update ContactInfos.
     */
    data: XOR<ContactInfoUpdateManyMutationInput, ContactInfoUncheckedUpdateManyInput>
    /**
     * Filter which ContactInfos to update
     */
    where?: ContactInfoWhereInput
    /**
     * Limit how many ContactInfos to update.
     */
    limit?: number
  }

  /**
   * ContactInfo upsert
   */
  export type ContactInfoUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ContactInfo
     */
    select?: ContactInfoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ContactInfo
     */
    omit?: ContactInfoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ContactInfoInclude<ExtArgs> | null
    /**
     * The filter to search for the ContactInfo to update in case it exists.
     */
    where: ContactInfoWhereUniqueInput
    /**
     * In case the ContactInfo found by the `where` argument doesn't exist, create a new ContactInfo with this data.
     */
    create: XOR<ContactInfoCreateInput, ContactInfoUncheckedCreateInput>
    /**
     * In case the ContactInfo was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ContactInfoUpdateInput, ContactInfoUncheckedUpdateInput>
  }

  /**
   * ContactInfo delete
   */
  export type ContactInfoDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ContactInfo
     */
    select?: ContactInfoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ContactInfo
     */
    omit?: ContactInfoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ContactInfoInclude<ExtArgs> | null
    /**
     * Filter which ContactInfo to delete.
     */
    where: ContactInfoWhereUniqueInput
  }

  /**
   * ContactInfo deleteMany
   */
  export type ContactInfoDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ContactInfos to delete
     */
    where?: ContactInfoWhereInput
    /**
     * Limit how many ContactInfos to delete.
     */
    limit?: number
  }

  /**
   * ContactInfo without action
   */
  export type ContactInfoDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ContactInfo
     */
    select?: ContactInfoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ContactInfo
     */
    omit?: ContactInfoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ContactInfoInclude<ExtArgs> | null
  }


  /**
   * Model OtherInfo
   */

  export type AggregateOtherInfo = {
    _count: OtherInfoCountAggregateOutputType | null
    _avg: OtherInfoAvgAggregateOutputType | null
    _sum: OtherInfoSumAggregateOutputType | null
    _min: OtherInfoMinAggregateOutputType | null
    _max: OtherInfoMaxAggregateOutputType | null
  }

  export type OtherInfoAvgAggregateOutputType = {
    id: number | null
    employeeId: number | null
  }

  export type OtherInfoSumAggregateOutputType = {
    id: number | null
    employeeId: number | null
  }

  export type OtherInfoMinAggregateOutputType = {
    id: number | null
    workStatus: $Enums.WorkStatus | null
    resignedDate: Date | null
    documentsChecked: string | null
    updatedAt: Date | null
    VCB: string | null
    MTCV: string | null
    PNJ: string | null
    employeeId: number | null
  }

  export type OtherInfoMaxAggregateOutputType = {
    id: number | null
    workStatus: $Enums.WorkStatus | null
    resignedDate: Date | null
    documentsChecked: string | null
    updatedAt: Date | null
    VCB: string | null
    MTCV: string | null
    PNJ: string | null
    employeeId: number | null
  }

  export type OtherInfoCountAggregateOutputType = {
    id: number
    workStatus: number
    resignedDate: number
    documentsChecked: number
    updatedAt: number
    VCB: number
    MTCV: number
    PNJ: number
    employeeId: number
    _all: number
  }


  export type OtherInfoAvgAggregateInputType = {
    id?: true
    employeeId?: true
  }

  export type OtherInfoSumAggregateInputType = {
    id?: true
    employeeId?: true
  }

  export type OtherInfoMinAggregateInputType = {
    id?: true
    workStatus?: true
    resignedDate?: true
    documentsChecked?: true
    updatedAt?: true
    VCB?: true
    MTCV?: true
    PNJ?: true
    employeeId?: true
  }

  export type OtherInfoMaxAggregateInputType = {
    id?: true
    workStatus?: true
    resignedDate?: true
    documentsChecked?: true
    updatedAt?: true
    VCB?: true
    MTCV?: true
    PNJ?: true
    employeeId?: true
  }

  export type OtherInfoCountAggregateInputType = {
    id?: true
    workStatus?: true
    resignedDate?: true
    documentsChecked?: true
    updatedAt?: true
    VCB?: true
    MTCV?: true
    PNJ?: true
    employeeId?: true
    _all?: true
  }

  export type OtherInfoAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which OtherInfo to aggregate.
     */
    where?: OtherInfoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of OtherInfos to fetch.
     */
    orderBy?: OtherInfoOrderByWithRelationInput | OtherInfoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: OtherInfoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` OtherInfos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` OtherInfos.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned OtherInfos
    **/
    _count?: true | OtherInfoCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: OtherInfoAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: OtherInfoSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: OtherInfoMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: OtherInfoMaxAggregateInputType
  }

  export type GetOtherInfoAggregateType<T extends OtherInfoAggregateArgs> = {
        [P in keyof T & keyof AggregateOtherInfo]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateOtherInfo[P]>
      : GetScalarType<T[P], AggregateOtherInfo[P]>
  }




  export type OtherInfoGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: OtherInfoWhereInput
    orderBy?: OtherInfoOrderByWithAggregationInput | OtherInfoOrderByWithAggregationInput[]
    by: OtherInfoScalarFieldEnum[] | OtherInfoScalarFieldEnum
    having?: OtherInfoScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: OtherInfoCountAggregateInputType | true
    _avg?: OtherInfoAvgAggregateInputType
    _sum?: OtherInfoSumAggregateInputType
    _min?: OtherInfoMinAggregateInputType
    _max?: OtherInfoMaxAggregateInputType
  }

  export type OtherInfoGroupByOutputType = {
    id: number
    workStatus: $Enums.WorkStatus
    resignedDate: Date | null
    documentsChecked: string | null
    updatedAt: Date | null
    VCB: string | null
    MTCV: string | null
    PNJ: string | null
    employeeId: number
    _count: OtherInfoCountAggregateOutputType | null
    _avg: OtherInfoAvgAggregateOutputType | null
    _sum: OtherInfoSumAggregateOutputType | null
    _min: OtherInfoMinAggregateOutputType | null
    _max: OtherInfoMaxAggregateOutputType | null
  }

  type GetOtherInfoGroupByPayload<T extends OtherInfoGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<OtherInfoGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof OtherInfoGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], OtherInfoGroupByOutputType[P]>
            : GetScalarType<T[P], OtherInfoGroupByOutputType[P]>
        }
      >
    >


  export type OtherInfoSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    workStatus?: boolean
    resignedDate?: boolean
    documentsChecked?: boolean
    updatedAt?: boolean
    VCB?: boolean
    MTCV?: boolean
    PNJ?: boolean
    employeeId?: boolean
    employee?: boolean | EmployeeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["otherInfo"]>



  export type OtherInfoSelectScalar = {
    id?: boolean
    workStatus?: boolean
    resignedDate?: boolean
    documentsChecked?: boolean
    updatedAt?: boolean
    VCB?: boolean
    MTCV?: boolean
    PNJ?: boolean
    employeeId?: boolean
  }

  export type OtherInfoOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "workStatus" | "resignedDate" | "documentsChecked" | "updatedAt" | "VCB" | "MTCV" | "PNJ" | "employeeId", ExtArgs["result"]["otherInfo"]>
  export type OtherInfoInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    employee?: boolean | EmployeeDefaultArgs<ExtArgs>
  }

  export type $OtherInfoPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "OtherInfo"
    objects: {
      employee: Prisma.$EmployeePayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: number
      workStatus: $Enums.WorkStatus
      resignedDate: Date | null
      documentsChecked: string | null
      updatedAt: Date | null
      VCB: string | null
      MTCV: string | null
      PNJ: string | null
      employeeId: number
    }, ExtArgs["result"]["otherInfo"]>
    composites: {}
  }

  type OtherInfoGetPayload<S extends boolean | null | undefined | OtherInfoDefaultArgs> = $Result.GetResult<Prisma.$OtherInfoPayload, S>

  type OtherInfoCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<OtherInfoFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: OtherInfoCountAggregateInputType | true
    }

  export interface OtherInfoDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['OtherInfo'], meta: { name: 'OtherInfo' } }
    /**
     * Find zero or one OtherInfo that matches the filter.
     * @param {OtherInfoFindUniqueArgs} args - Arguments to find a OtherInfo
     * @example
     * // Get one OtherInfo
     * const otherInfo = await prisma.otherInfo.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends OtherInfoFindUniqueArgs>(args: SelectSubset<T, OtherInfoFindUniqueArgs<ExtArgs>>): Prisma__OtherInfoClient<$Result.GetResult<Prisma.$OtherInfoPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one OtherInfo that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {OtherInfoFindUniqueOrThrowArgs} args - Arguments to find a OtherInfo
     * @example
     * // Get one OtherInfo
     * const otherInfo = await prisma.otherInfo.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends OtherInfoFindUniqueOrThrowArgs>(args: SelectSubset<T, OtherInfoFindUniqueOrThrowArgs<ExtArgs>>): Prisma__OtherInfoClient<$Result.GetResult<Prisma.$OtherInfoPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first OtherInfo that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OtherInfoFindFirstArgs} args - Arguments to find a OtherInfo
     * @example
     * // Get one OtherInfo
     * const otherInfo = await prisma.otherInfo.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends OtherInfoFindFirstArgs>(args?: SelectSubset<T, OtherInfoFindFirstArgs<ExtArgs>>): Prisma__OtherInfoClient<$Result.GetResult<Prisma.$OtherInfoPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first OtherInfo that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OtherInfoFindFirstOrThrowArgs} args - Arguments to find a OtherInfo
     * @example
     * // Get one OtherInfo
     * const otherInfo = await prisma.otherInfo.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends OtherInfoFindFirstOrThrowArgs>(args?: SelectSubset<T, OtherInfoFindFirstOrThrowArgs<ExtArgs>>): Prisma__OtherInfoClient<$Result.GetResult<Prisma.$OtherInfoPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more OtherInfos that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OtherInfoFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all OtherInfos
     * const otherInfos = await prisma.otherInfo.findMany()
     * 
     * // Get first 10 OtherInfos
     * const otherInfos = await prisma.otherInfo.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const otherInfoWithIdOnly = await prisma.otherInfo.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends OtherInfoFindManyArgs>(args?: SelectSubset<T, OtherInfoFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$OtherInfoPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a OtherInfo.
     * @param {OtherInfoCreateArgs} args - Arguments to create a OtherInfo.
     * @example
     * // Create one OtherInfo
     * const OtherInfo = await prisma.otherInfo.create({
     *   data: {
     *     // ... data to create a OtherInfo
     *   }
     * })
     * 
     */
    create<T extends OtherInfoCreateArgs>(args: SelectSubset<T, OtherInfoCreateArgs<ExtArgs>>): Prisma__OtherInfoClient<$Result.GetResult<Prisma.$OtherInfoPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many OtherInfos.
     * @param {OtherInfoCreateManyArgs} args - Arguments to create many OtherInfos.
     * @example
     * // Create many OtherInfos
     * const otherInfo = await prisma.otherInfo.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends OtherInfoCreateManyArgs>(args?: SelectSubset<T, OtherInfoCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a OtherInfo.
     * @param {OtherInfoDeleteArgs} args - Arguments to delete one OtherInfo.
     * @example
     * // Delete one OtherInfo
     * const OtherInfo = await prisma.otherInfo.delete({
     *   where: {
     *     // ... filter to delete one OtherInfo
     *   }
     * })
     * 
     */
    delete<T extends OtherInfoDeleteArgs>(args: SelectSubset<T, OtherInfoDeleteArgs<ExtArgs>>): Prisma__OtherInfoClient<$Result.GetResult<Prisma.$OtherInfoPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one OtherInfo.
     * @param {OtherInfoUpdateArgs} args - Arguments to update one OtherInfo.
     * @example
     * // Update one OtherInfo
     * const otherInfo = await prisma.otherInfo.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends OtherInfoUpdateArgs>(args: SelectSubset<T, OtherInfoUpdateArgs<ExtArgs>>): Prisma__OtherInfoClient<$Result.GetResult<Prisma.$OtherInfoPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more OtherInfos.
     * @param {OtherInfoDeleteManyArgs} args - Arguments to filter OtherInfos to delete.
     * @example
     * // Delete a few OtherInfos
     * const { count } = await prisma.otherInfo.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends OtherInfoDeleteManyArgs>(args?: SelectSubset<T, OtherInfoDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more OtherInfos.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OtherInfoUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many OtherInfos
     * const otherInfo = await prisma.otherInfo.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends OtherInfoUpdateManyArgs>(args: SelectSubset<T, OtherInfoUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one OtherInfo.
     * @param {OtherInfoUpsertArgs} args - Arguments to update or create a OtherInfo.
     * @example
     * // Update or create a OtherInfo
     * const otherInfo = await prisma.otherInfo.upsert({
     *   create: {
     *     // ... data to create a OtherInfo
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the OtherInfo we want to update
     *   }
     * })
     */
    upsert<T extends OtherInfoUpsertArgs>(args: SelectSubset<T, OtherInfoUpsertArgs<ExtArgs>>): Prisma__OtherInfoClient<$Result.GetResult<Prisma.$OtherInfoPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of OtherInfos.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OtherInfoCountArgs} args - Arguments to filter OtherInfos to count.
     * @example
     * // Count the number of OtherInfos
     * const count = await prisma.otherInfo.count({
     *   where: {
     *     // ... the filter for the OtherInfos we want to count
     *   }
     * })
    **/
    count<T extends OtherInfoCountArgs>(
      args?: Subset<T, OtherInfoCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], OtherInfoCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a OtherInfo.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OtherInfoAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends OtherInfoAggregateArgs>(args: Subset<T, OtherInfoAggregateArgs>): Prisma.PrismaPromise<GetOtherInfoAggregateType<T>>

    /**
     * Group by OtherInfo.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OtherInfoGroupByArgs} args - Group by arguments.
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
      T extends OtherInfoGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: OtherInfoGroupByArgs['orderBy'] }
        : { orderBy?: OtherInfoGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, OtherInfoGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetOtherInfoGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the OtherInfo model
   */
  readonly fields: OtherInfoFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for OtherInfo.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__OtherInfoClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    employee<T extends EmployeeDefaultArgs<ExtArgs> = {}>(args?: Subset<T, EmployeeDefaultArgs<ExtArgs>>): Prisma__EmployeeClient<$Result.GetResult<Prisma.$EmployeePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
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
   * Fields of the OtherInfo model
   */
  interface OtherInfoFieldRefs {
    readonly id: FieldRef<"OtherInfo", 'Int'>
    readonly workStatus: FieldRef<"OtherInfo", 'WorkStatus'>
    readonly resignedDate: FieldRef<"OtherInfo", 'DateTime'>
    readonly documentsChecked: FieldRef<"OtherInfo", 'String'>
    readonly updatedAt: FieldRef<"OtherInfo", 'DateTime'>
    readonly VCB: FieldRef<"OtherInfo", 'String'>
    readonly MTCV: FieldRef<"OtherInfo", 'String'>
    readonly PNJ: FieldRef<"OtherInfo", 'String'>
    readonly employeeId: FieldRef<"OtherInfo", 'Int'>
  }
    

  // Custom InputTypes
  /**
   * OtherInfo findUnique
   */
  export type OtherInfoFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OtherInfo
     */
    select?: OtherInfoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OtherInfo
     */
    omit?: OtherInfoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OtherInfoInclude<ExtArgs> | null
    /**
     * Filter, which OtherInfo to fetch.
     */
    where: OtherInfoWhereUniqueInput
  }

  /**
   * OtherInfo findUniqueOrThrow
   */
  export type OtherInfoFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OtherInfo
     */
    select?: OtherInfoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OtherInfo
     */
    omit?: OtherInfoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OtherInfoInclude<ExtArgs> | null
    /**
     * Filter, which OtherInfo to fetch.
     */
    where: OtherInfoWhereUniqueInput
  }

  /**
   * OtherInfo findFirst
   */
  export type OtherInfoFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OtherInfo
     */
    select?: OtherInfoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OtherInfo
     */
    omit?: OtherInfoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OtherInfoInclude<ExtArgs> | null
    /**
     * Filter, which OtherInfo to fetch.
     */
    where?: OtherInfoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of OtherInfos to fetch.
     */
    orderBy?: OtherInfoOrderByWithRelationInput | OtherInfoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for OtherInfos.
     */
    cursor?: OtherInfoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` OtherInfos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` OtherInfos.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of OtherInfos.
     */
    distinct?: OtherInfoScalarFieldEnum | OtherInfoScalarFieldEnum[]
  }

  /**
   * OtherInfo findFirstOrThrow
   */
  export type OtherInfoFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OtherInfo
     */
    select?: OtherInfoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OtherInfo
     */
    omit?: OtherInfoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OtherInfoInclude<ExtArgs> | null
    /**
     * Filter, which OtherInfo to fetch.
     */
    where?: OtherInfoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of OtherInfos to fetch.
     */
    orderBy?: OtherInfoOrderByWithRelationInput | OtherInfoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for OtherInfos.
     */
    cursor?: OtherInfoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` OtherInfos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` OtherInfos.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of OtherInfos.
     */
    distinct?: OtherInfoScalarFieldEnum | OtherInfoScalarFieldEnum[]
  }

  /**
   * OtherInfo findMany
   */
  export type OtherInfoFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OtherInfo
     */
    select?: OtherInfoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OtherInfo
     */
    omit?: OtherInfoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OtherInfoInclude<ExtArgs> | null
    /**
     * Filter, which OtherInfos to fetch.
     */
    where?: OtherInfoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of OtherInfos to fetch.
     */
    orderBy?: OtherInfoOrderByWithRelationInput | OtherInfoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing OtherInfos.
     */
    cursor?: OtherInfoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` OtherInfos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` OtherInfos.
     */
    skip?: number
    distinct?: OtherInfoScalarFieldEnum | OtherInfoScalarFieldEnum[]
  }

  /**
   * OtherInfo create
   */
  export type OtherInfoCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OtherInfo
     */
    select?: OtherInfoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OtherInfo
     */
    omit?: OtherInfoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OtherInfoInclude<ExtArgs> | null
    /**
     * The data needed to create a OtherInfo.
     */
    data: XOR<OtherInfoCreateInput, OtherInfoUncheckedCreateInput>
  }

  /**
   * OtherInfo createMany
   */
  export type OtherInfoCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many OtherInfos.
     */
    data: OtherInfoCreateManyInput | OtherInfoCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * OtherInfo update
   */
  export type OtherInfoUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OtherInfo
     */
    select?: OtherInfoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OtherInfo
     */
    omit?: OtherInfoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OtherInfoInclude<ExtArgs> | null
    /**
     * The data needed to update a OtherInfo.
     */
    data: XOR<OtherInfoUpdateInput, OtherInfoUncheckedUpdateInput>
    /**
     * Choose, which OtherInfo to update.
     */
    where: OtherInfoWhereUniqueInput
  }

  /**
   * OtherInfo updateMany
   */
  export type OtherInfoUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update OtherInfos.
     */
    data: XOR<OtherInfoUpdateManyMutationInput, OtherInfoUncheckedUpdateManyInput>
    /**
     * Filter which OtherInfos to update
     */
    where?: OtherInfoWhereInput
    /**
     * Limit how many OtherInfos to update.
     */
    limit?: number
  }

  /**
   * OtherInfo upsert
   */
  export type OtherInfoUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OtherInfo
     */
    select?: OtherInfoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OtherInfo
     */
    omit?: OtherInfoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OtherInfoInclude<ExtArgs> | null
    /**
     * The filter to search for the OtherInfo to update in case it exists.
     */
    where: OtherInfoWhereUniqueInput
    /**
     * In case the OtherInfo found by the `where` argument doesn't exist, create a new OtherInfo with this data.
     */
    create: XOR<OtherInfoCreateInput, OtherInfoUncheckedCreateInput>
    /**
     * In case the OtherInfo was found with the provided `where` argument, update it with this data.
     */
    update: XOR<OtherInfoUpdateInput, OtherInfoUncheckedUpdateInput>
  }

  /**
   * OtherInfo delete
   */
  export type OtherInfoDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OtherInfo
     */
    select?: OtherInfoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OtherInfo
     */
    omit?: OtherInfoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OtherInfoInclude<ExtArgs> | null
    /**
     * Filter which OtherInfo to delete.
     */
    where: OtherInfoWhereUniqueInput
  }

  /**
   * OtherInfo deleteMany
   */
  export type OtherInfoDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which OtherInfos to delete
     */
    where?: OtherInfoWhereInput
    /**
     * Limit how many OtherInfos to delete.
     */
    limit?: number
  }

  /**
   * OtherInfo without action
   */
  export type OtherInfoDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OtherInfo
     */
    select?: OtherInfoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OtherInfo
     */
    omit?: OtherInfoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OtherInfoInclude<ExtArgs> | null
  }


  /**
   * Model LeaveRequest
   */

  export type AggregateLeaveRequest = {
    _count: LeaveRequestCountAggregateOutputType | null
    _avg: LeaveRequestAvgAggregateOutputType | null
    _sum: LeaveRequestSumAggregateOutputType | null
    _min: LeaveRequestMinAggregateOutputType | null
    _max: LeaveRequestMaxAggregateOutputType | null
  }

  export type LeaveRequestAvgAggregateOutputType = {
    id: number | null
    employeeId: number | null
    totalHours: number | null
  }

  export type LeaveRequestSumAggregateOutputType = {
    id: number | null
    employeeId: number | null
    totalHours: number | null
  }

  export type LeaveRequestMinAggregateOutputType = {
    id: number | null
    employeeId: number | null
    leaveType: $Enums.LeaveTypeEnum | null
    startDate: Date | null
    endDate: Date | null
    totalHours: number | null
    reason: string | null
    status: $Enums.LeaveStatus | null
    approvedBy: string | null
    approvedAt: Date | null
    createdAt: Date | null
  }

  export type LeaveRequestMaxAggregateOutputType = {
    id: number | null
    employeeId: number | null
    leaveType: $Enums.LeaveTypeEnum | null
    startDate: Date | null
    endDate: Date | null
    totalHours: number | null
    reason: string | null
    status: $Enums.LeaveStatus | null
    approvedBy: string | null
    approvedAt: Date | null
    createdAt: Date | null
  }

  export type LeaveRequestCountAggregateOutputType = {
    id: number
    employeeId: number
    leaveType: number
    startDate: number
    endDate: number
    totalHours: number
    reason: number
    status: number
    approvedBy: number
    approvedAt: number
    createdAt: number
    _all: number
  }


  export type LeaveRequestAvgAggregateInputType = {
    id?: true
    employeeId?: true
    totalHours?: true
  }

  export type LeaveRequestSumAggregateInputType = {
    id?: true
    employeeId?: true
    totalHours?: true
  }

  export type LeaveRequestMinAggregateInputType = {
    id?: true
    employeeId?: true
    leaveType?: true
    startDate?: true
    endDate?: true
    totalHours?: true
    reason?: true
    status?: true
    approvedBy?: true
    approvedAt?: true
    createdAt?: true
  }

  export type LeaveRequestMaxAggregateInputType = {
    id?: true
    employeeId?: true
    leaveType?: true
    startDate?: true
    endDate?: true
    totalHours?: true
    reason?: true
    status?: true
    approvedBy?: true
    approvedAt?: true
    createdAt?: true
  }

  export type LeaveRequestCountAggregateInputType = {
    id?: true
    employeeId?: true
    leaveType?: true
    startDate?: true
    endDate?: true
    totalHours?: true
    reason?: true
    status?: true
    approvedBy?: true
    approvedAt?: true
    createdAt?: true
    _all?: true
  }

  export type LeaveRequestAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which LeaveRequest to aggregate.
     */
    where?: LeaveRequestWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of LeaveRequests to fetch.
     */
    orderBy?: LeaveRequestOrderByWithRelationInput | LeaveRequestOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: LeaveRequestWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` LeaveRequests from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` LeaveRequests.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned LeaveRequests
    **/
    _count?: true | LeaveRequestCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: LeaveRequestAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: LeaveRequestSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: LeaveRequestMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: LeaveRequestMaxAggregateInputType
  }

  export type GetLeaveRequestAggregateType<T extends LeaveRequestAggregateArgs> = {
        [P in keyof T & keyof AggregateLeaveRequest]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateLeaveRequest[P]>
      : GetScalarType<T[P], AggregateLeaveRequest[P]>
  }




  export type LeaveRequestGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: LeaveRequestWhereInput
    orderBy?: LeaveRequestOrderByWithAggregationInput | LeaveRequestOrderByWithAggregationInput[]
    by: LeaveRequestScalarFieldEnum[] | LeaveRequestScalarFieldEnum
    having?: LeaveRequestScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: LeaveRequestCountAggregateInputType | true
    _avg?: LeaveRequestAvgAggregateInputType
    _sum?: LeaveRequestSumAggregateInputType
    _min?: LeaveRequestMinAggregateInputType
    _max?: LeaveRequestMaxAggregateInputType
  }

  export type LeaveRequestGroupByOutputType = {
    id: number
    employeeId: number
    leaveType: $Enums.LeaveTypeEnum
    startDate: Date
    endDate: Date
    totalHours: number | null
    reason: string | null
    status: $Enums.LeaveStatus
    approvedBy: string | null
    approvedAt: Date | null
    createdAt: Date
    _count: LeaveRequestCountAggregateOutputType | null
    _avg: LeaveRequestAvgAggregateOutputType | null
    _sum: LeaveRequestSumAggregateOutputType | null
    _min: LeaveRequestMinAggregateOutputType | null
    _max: LeaveRequestMaxAggregateOutputType | null
  }

  type GetLeaveRequestGroupByPayload<T extends LeaveRequestGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<LeaveRequestGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof LeaveRequestGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], LeaveRequestGroupByOutputType[P]>
            : GetScalarType<T[P], LeaveRequestGroupByOutputType[P]>
        }
      >
    >


  export type LeaveRequestSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    employeeId?: boolean
    leaveType?: boolean
    startDate?: boolean
    endDate?: boolean
    totalHours?: boolean
    reason?: boolean
    status?: boolean
    approvedBy?: boolean
    approvedAt?: boolean
    createdAt?: boolean
    employee?: boolean | EmployeeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["leaveRequest"]>



  export type LeaveRequestSelectScalar = {
    id?: boolean
    employeeId?: boolean
    leaveType?: boolean
    startDate?: boolean
    endDate?: boolean
    totalHours?: boolean
    reason?: boolean
    status?: boolean
    approvedBy?: boolean
    approvedAt?: boolean
    createdAt?: boolean
  }

  export type LeaveRequestOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "employeeId" | "leaveType" | "startDate" | "endDate" | "totalHours" | "reason" | "status" | "approvedBy" | "approvedAt" | "createdAt", ExtArgs["result"]["leaveRequest"]>
  export type LeaveRequestInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    employee?: boolean | EmployeeDefaultArgs<ExtArgs>
  }

  export type $LeaveRequestPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "LeaveRequest"
    objects: {
      employee: Prisma.$EmployeePayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: number
      employeeId: number
      leaveType: $Enums.LeaveTypeEnum
      startDate: Date
      endDate: Date
      totalHours: number | null
      reason: string | null
      status: $Enums.LeaveStatus
      approvedBy: string | null
      approvedAt: Date | null
      createdAt: Date
    }, ExtArgs["result"]["leaveRequest"]>
    composites: {}
  }

  type LeaveRequestGetPayload<S extends boolean | null | undefined | LeaveRequestDefaultArgs> = $Result.GetResult<Prisma.$LeaveRequestPayload, S>

  type LeaveRequestCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<LeaveRequestFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: LeaveRequestCountAggregateInputType | true
    }

  export interface LeaveRequestDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['LeaveRequest'], meta: { name: 'LeaveRequest' } }
    /**
     * Find zero or one LeaveRequest that matches the filter.
     * @param {LeaveRequestFindUniqueArgs} args - Arguments to find a LeaveRequest
     * @example
     * // Get one LeaveRequest
     * const leaveRequest = await prisma.leaveRequest.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends LeaveRequestFindUniqueArgs>(args: SelectSubset<T, LeaveRequestFindUniqueArgs<ExtArgs>>): Prisma__LeaveRequestClient<$Result.GetResult<Prisma.$LeaveRequestPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one LeaveRequest that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {LeaveRequestFindUniqueOrThrowArgs} args - Arguments to find a LeaveRequest
     * @example
     * // Get one LeaveRequest
     * const leaveRequest = await prisma.leaveRequest.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends LeaveRequestFindUniqueOrThrowArgs>(args: SelectSubset<T, LeaveRequestFindUniqueOrThrowArgs<ExtArgs>>): Prisma__LeaveRequestClient<$Result.GetResult<Prisma.$LeaveRequestPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first LeaveRequest that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LeaveRequestFindFirstArgs} args - Arguments to find a LeaveRequest
     * @example
     * // Get one LeaveRequest
     * const leaveRequest = await prisma.leaveRequest.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends LeaveRequestFindFirstArgs>(args?: SelectSubset<T, LeaveRequestFindFirstArgs<ExtArgs>>): Prisma__LeaveRequestClient<$Result.GetResult<Prisma.$LeaveRequestPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first LeaveRequest that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LeaveRequestFindFirstOrThrowArgs} args - Arguments to find a LeaveRequest
     * @example
     * // Get one LeaveRequest
     * const leaveRequest = await prisma.leaveRequest.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends LeaveRequestFindFirstOrThrowArgs>(args?: SelectSubset<T, LeaveRequestFindFirstOrThrowArgs<ExtArgs>>): Prisma__LeaveRequestClient<$Result.GetResult<Prisma.$LeaveRequestPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more LeaveRequests that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LeaveRequestFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all LeaveRequests
     * const leaveRequests = await prisma.leaveRequest.findMany()
     * 
     * // Get first 10 LeaveRequests
     * const leaveRequests = await prisma.leaveRequest.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const leaveRequestWithIdOnly = await prisma.leaveRequest.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends LeaveRequestFindManyArgs>(args?: SelectSubset<T, LeaveRequestFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$LeaveRequestPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a LeaveRequest.
     * @param {LeaveRequestCreateArgs} args - Arguments to create a LeaveRequest.
     * @example
     * // Create one LeaveRequest
     * const LeaveRequest = await prisma.leaveRequest.create({
     *   data: {
     *     // ... data to create a LeaveRequest
     *   }
     * })
     * 
     */
    create<T extends LeaveRequestCreateArgs>(args: SelectSubset<T, LeaveRequestCreateArgs<ExtArgs>>): Prisma__LeaveRequestClient<$Result.GetResult<Prisma.$LeaveRequestPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many LeaveRequests.
     * @param {LeaveRequestCreateManyArgs} args - Arguments to create many LeaveRequests.
     * @example
     * // Create many LeaveRequests
     * const leaveRequest = await prisma.leaveRequest.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends LeaveRequestCreateManyArgs>(args?: SelectSubset<T, LeaveRequestCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a LeaveRequest.
     * @param {LeaveRequestDeleteArgs} args - Arguments to delete one LeaveRequest.
     * @example
     * // Delete one LeaveRequest
     * const LeaveRequest = await prisma.leaveRequest.delete({
     *   where: {
     *     // ... filter to delete one LeaveRequest
     *   }
     * })
     * 
     */
    delete<T extends LeaveRequestDeleteArgs>(args: SelectSubset<T, LeaveRequestDeleteArgs<ExtArgs>>): Prisma__LeaveRequestClient<$Result.GetResult<Prisma.$LeaveRequestPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one LeaveRequest.
     * @param {LeaveRequestUpdateArgs} args - Arguments to update one LeaveRequest.
     * @example
     * // Update one LeaveRequest
     * const leaveRequest = await prisma.leaveRequest.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends LeaveRequestUpdateArgs>(args: SelectSubset<T, LeaveRequestUpdateArgs<ExtArgs>>): Prisma__LeaveRequestClient<$Result.GetResult<Prisma.$LeaveRequestPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more LeaveRequests.
     * @param {LeaveRequestDeleteManyArgs} args - Arguments to filter LeaveRequests to delete.
     * @example
     * // Delete a few LeaveRequests
     * const { count } = await prisma.leaveRequest.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends LeaveRequestDeleteManyArgs>(args?: SelectSubset<T, LeaveRequestDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more LeaveRequests.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LeaveRequestUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many LeaveRequests
     * const leaveRequest = await prisma.leaveRequest.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends LeaveRequestUpdateManyArgs>(args: SelectSubset<T, LeaveRequestUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one LeaveRequest.
     * @param {LeaveRequestUpsertArgs} args - Arguments to update or create a LeaveRequest.
     * @example
     * // Update or create a LeaveRequest
     * const leaveRequest = await prisma.leaveRequest.upsert({
     *   create: {
     *     // ... data to create a LeaveRequest
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the LeaveRequest we want to update
     *   }
     * })
     */
    upsert<T extends LeaveRequestUpsertArgs>(args: SelectSubset<T, LeaveRequestUpsertArgs<ExtArgs>>): Prisma__LeaveRequestClient<$Result.GetResult<Prisma.$LeaveRequestPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of LeaveRequests.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LeaveRequestCountArgs} args - Arguments to filter LeaveRequests to count.
     * @example
     * // Count the number of LeaveRequests
     * const count = await prisma.leaveRequest.count({
     *   where: {
     *     // ... the filter for the LeaveRequests we want to count
     *   }
     * })
    **/
    count<T extends LeaveRequestCountArgs>(
      args?: Subset<T, LeaveRequestCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], LeaveRequestCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a LeaveRequest.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LeaveRequestAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends LeaveRequestAggregateArgs>(args: Subset<T, LeaveRequestAggregateArgs>): Prisma.PrismaPromise<GetLeaveRequestAggregateType<T>>

    /**
     * Group by LeaveRequest.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LeaveRequestGroupByArgs} args - Group by arguments.
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
      T extends LeaveRequestGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: LeaveRequestGroupByArgs['orderBy'] }
        : { orderBy?: LeaveRequestGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, LeaveRequestGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetLeaveRequestGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the LeaveRequest model
   */
  readonly fields: LeaveRequestFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for LeaveRequest.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__LeaveRequestClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    employee<T extends EmployeeDefaultArgs<ExtArgs> = {}>(args?: Subset<T, EmployeeDefaultArgs<ExtArgs>>): Prisma__EmployeeClient<$Result.GetResult<Prisma.$EmployeePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
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
   * Fields of the LeaveRequest model
   */
  interface LeaveRequestFieldRefs {
    readonly id: FieldRef<"LeaveRequest", 'Int'>
    readonly employeeId: FieldRef<"LeaveRequest", 'Int'>
    readonly leaveType: FieldRef<"LeaveRequest", 'LeaveTypeEnum'>
    readonly startDate: FieldRef<"LeaveRequest", 'DateTime'>
    readonly endDate: FieldRef<"LeaveRequest", 'DateTime'>
    readonly totalHours: FieldRef<"LeaveRequest", 'Float'>
    readonly reason: FieldRef<"LeaveRequest", 'String'>
    readonly status: FieldRef<"LeaveRequest", 'LeaveStatus'>
    readonly approvedBy: FieldRef<"LeaveRequest", 'String'>
    readonly approvedAt: FieldRef<"LeaveRequest", 'DateTime'>
    readonly createdAt: FieldRef<"LeaveRequest", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * LeaveRequest findUnique
   */
  export type LeaveRequestFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LeaveRequest
     */
    select?: LeaveRequestSelect<ExtArgs> | null
    /**
     * Omit specific fields from the LeaveRequest
     */
    omit?: LeaveRequestOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LeaveRequestInclude<ExtArgs> | null
    /**
     * Filter, which LeaveRequest to fetch.
     */
    where: LeaveRequestWhereUniqueInput
  }

  /**
   * LeaveRequest findUniqueOrThrow
   */
  export type LeaveRequestFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LeaveRequest
     */
    select?: LeaveRequestSelect<ExtArgs> | null
    /**
     * Omit specific fields from the LeaveRequest
     */
    omit?: LeaveRequestOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LeaveRequestInclude<ExtArgs> | null
    /**
     * Filter, which LeaveRequest to fetch.
     */
    where: LeaveRequestWhereUniqueInput
  }

  /**
   * LeaveRequest findFirst
   */
  export type LeaveRequestFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LeaveRequest
     */
    select?: LeaveRequestSelect<ExtArgs> | null
    /**
     * Omit specific fields from the LeaveRequest
     */
    omit?: LeaveRequestOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LeaveRequestInclude<ExtArgs> | null
    /**
     * Filter, which LeaveRequest to fetch.
     */
    where?: LeaveRequestWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of LeaveRequests to fetch.
     */
    orderBy?: LeaveRequestOrderByWithRelationInput | LeaveRequestOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for LeaveRequests.
     */
    cursor?: LeaveRequestWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` LeaveRequests from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` LeaveRequests.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of LeaveRequests.
     */
    distinct?: LeaveRequestScalarFieldEnum | LeaveRequestScalarFieldEnum[]
  }

  /**
   * LeaveRequest findFirstOrThrow
   */
  export type LeaveRequestFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LeaveRequest
     */
    select?: LeaveRequestSelect<ExtArgs> | null
    /**
     * Omit specific fields from the LeaveRequest
     */
    omit?: LeaveRequestOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LeaveRequestInclude<ExtArgs> | null
    /**
     * Filter, which LeaveRequest to fetch.
     */
    where?: LeaveRequestWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of LeaveRequests to fetch.
     */
    orderBy?: LeaveRequestOrderByWithRelationInput | LeaveRequestOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for LeaveRequests.
     */
    cursor?: LeaveRequestWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` LeaveRequests from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` LeaveRequests.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of LeaveRequests.
     */
    distinct?: LeaveRequestScalarFieldEnum | LeaveRequestScalarFieldEnum[]
  }

  /**
   * LeaveRequest findMany
   */
  export type LeaveRequestFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LeaveRequest
     */
    select?: LeaveRequestSelect<ExtArgs> | null
    /**
     * Omit specific fields from the LeaveRequest
     */
    omit?: LeaveRequestOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LeaveRequestInclude<ExtArgs> | null
    /**
     * Filter, which LeaveRequests to fetch.
     */
    where?: LeaveRequestWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of LeaveRequests to fetch.
     */
    orderBy?: LeaveRequestOrderByWithRelationInput | LeaveRequestOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing LeaveRequests.
     */
    cursor?: LeaveRequestWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` LeaveRequests from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` LeaveRequests.
     */
    skip?: number
    distinct?: LeaveRequestScalarFieldEnum | LeaveRequestScalarFieldEnum[]
  }

  /**
   * LeaveRequest create
   */
  export type LeaveRequestCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LeaveRequest
     */
    select?: LeaveRequestSelect<ExtArgs> | null
    /**
     * Omit specific fields from the LeaveRequest
     */
    omit?: LeaveRequestOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LeaveRequestInclude<ExtArgs> | null
    /**
     * The data needed to create a LeaveRequest.
     */
    data: XOR<LeaveRequestCreateInput, LeaveRequestUncheckedCreateInput>
  }

  /**
   * LeaveRequest createMany
   */
  export type LeaveRequestCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many LeaveRequests.
     */
    data: LeaveRequestCreateManyInput | LeaveRequestCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * LeaveRequest update
   */
  export type LeaveRequestUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LeaveRequest
     */
    select?: LeaveRequestSelect<ExtArgs> | null
    /**
     * Omit specific fields from the LeaveRequest
     */
    omit?: LeaveRequestOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LeaveRequestInclude<ExtArgs> | null
    /**
     * The data needed to update a LeaveRequest.
     */
    data: XOR<LeaveRequestUpdateInput, LeaveRequestUncheckedUpdateInput>
    /**
     * Choose, which LeaveRequest to update.
     */
    where: LeaveRequestWhereUniqueInput
  }

  /**
   * LeaveRequest updateMany
   */
  export type LeaveRequestUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update LeaveRequests.
     */
    data: XOR<LeaveRequestUpdateManyMutationInput, LeaveRequestUncheckedUpdateManyInput>
    /**
     * Filter which LeaveRequests to update
     */
    where?: LeaveRequestWhereInput
    /**
     * Limit how many LeaveRequests to update.
     */
    limit?: number
  }

  /**
   * LeaveRequest upsert
   */
  export type LeaveRequestUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LeaveRequest
     */
    select?: LeaveRequestSelect<ExtArgs> | null
    /**
     * Omit specific fields from the LeaveRequest
     */
    omit?: LeaveRequestOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LeaveRequestInclude<ExtArgs> | null
    /**
     * The filter to search for the LeaveRequest to update in case it exists.
     */
    where: LeaveRequestWhereUniqueInput
    /**
     * In case the LeaveRequest found by the `where` argument doesn't exist, create a new LeaveRequest with this data.
     */
    create: XOR<LeaveRequestCreateInput, LeaveRequestUncheckedCreateInput>
    /**
     * In case the LeaveRequest was found with the provided `where` argument, update it with this data.
     */
    update: XOR<LeaveRequestUpdateInput, LeaveRequestUncheckedUpdateInput>
  }

  /**
   * LeaveRequest delete
   */
  export type LeaveRequestDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LeaveRequest
     */
    select?: LeaveRequestSelect<ExtArgs> | null
    /**
     * Omit specific fields from the LeaveRequest
     */
    omit?: LeaveRequestOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LeaveRequestInclude<ExtArgs> | null
    /**
     * Filter which LeaveRequest to delete.
     */
    where: LeaveRequestWhereUniqueInput
  }

  /**
   * LeaveRequest deleteMany
   */
  export type LeaveRequestDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which LeaveRequests to delete
     */
    where?: LeaveRequestWhereInput
    /**
     * Limit how many LeaveRequests to delete.
     */
    limit?: number
  }

  /**
   * LeaveRequest without action
   */
  export type LeaveRequestDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LeaveRequest
     */
    select?: LeaveRequestSelect<ExtArgs> | null
    /**
     * Omit specific fields from the LeaveRequest
     */
    omit?: LeaveRequestOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LeaveRequestInclude<ExtArgs> | null
  }


  /**
   * Model Attendance
   */

  export type AggregateAttendance = {
    _count: AttendanceCountAggregateOutputType | null
    _avg: AttendanceAvgAggregateOutputType | null
    _sum: AttendanceSumAggregateOutputType | null
    _min: AttendanceMinAggregateOutputType | null
    _max: AttendanceMaxAggregateOutputType | null
  }

  export type AttendanceAvgAggregateOutputType = {
    id: number | null
    employeeId: number | null
  }

  export type AttendanceSumAggregateOutputType = {
    id: number | null
    employeeId: number | null
  }

  export type AttendanceMinAggregateOutputType = {
    id: number | null
    employeeId: number | null
    date: Date | null
    checkInTime: Date | null
    checkOutTime: Date | null
  }

  export type AttendanceMaxAggregateOutputType = {
    id: number | null
    employeeId: number | null
    date: Date | null
    checkInTime: Date | null
    checkOutTime: Date | null
  }

  export type AttendanceCountAggregateOutputType = {
    id: number
    employeeId: number
    date: number
    checkInTime: number
    checkOutTime: number
    _all: number
  }


  export type AttendanceAvgAggregateInputType = {
    id?: true
    employeeId?: true
  }

  export type AttendanceSumAggregateInputType = {
    id?: true
    employeeId?: true
  }

  export type AttendanceMinAggregateInputType = {
    id?: true
    employeeId?: true
    date?: true
    checkInTime?: true
    checkOutTime?: true
  }

  export type AttendanceMaxAggregateInputType = {
    id?: true
    employeeId?: true
    date?: true
    checkInTime?: true
    checkOutTime?: true
  }

  export type AttendanceCountAggregateInputType = {
    id?: true
    employeeId?: true
    date?: true
    checkInTime?: true
    checkOutTime?: true
    _all?: true
  }

  export type AttendanceAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Attendance to aggregate.
     */
    where?: AttendanceWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Attendances to fetch.
     */
    orderBy?: AttendanceOrderByWithRelationInput | AttendanceOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: AttendanceWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Attendances from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Attendances.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Attendances
    **/
    _count?: true | AttendanceCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: AttendanceAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: AttendanceSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: AttendanceMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: AttendanceMaxAggregateInputType
  }

  export type GetAttendanceAggregateType<T extends AttendanceAggregateArgs> = {
        [P in keyof T & keyof AggregateAttendance]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateAttendance[P]>
      : GetScalarType<T[P], AggregateAttendance[P]>
  }




  export type AttendanceGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: AttendanceWhereInput
    orderBy?: AttendanceOrderByWithAggregationInput | AttendanceOrderByWithAggregationInput[]
    by: AttendanceScalarFieldEnum[] | AttendanceScalarFieldEnum
    having?: AttendanceScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: AttendanceCountAggregateInputType | true
    _avg?: AttendanceAvgAggregateInputType
    _sum?: AttendanceSumAggregateInputType
    _min?: AttendanceMinAggregateInputType
    _max?: AttendanceMaxAggregateInputType
  }

  export type AttendanceGroupByOutputType = {
    id: number
    employeeId: number
    date: Date
    checkInTime: Date | null
    checkOutTime: Date | null
    _count: AttendanceCountAggregateOutputType | null
    _avg: AttendanceAvgAggregateOutputType | null
    _sum: AttendanceSumAggregateOutputType | null
    _min: AttendanceMinAggregateOutputType | null
    _max: AttendanceMaxAggregateOutputType | null
  }

  type GetAttendanceGroupByPayload<T extends AttendanceGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<AttendanceGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof AttendanceGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], AttendanceGroupByOutputType[P]>
            : GetScalarType<T[P], AttendanceGroupByOutputType[P]>
        }
      >
    >


  export type AttendanceSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    employeeId?: boolean
    date?: boolean
    checkInTime?: boolean
    checkOutTime?: boolean
    employee?: boolean | EmployeeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["attendance"]>



  export type AttendanceSelectScalar = {
    id?: boolean
    employeeId?: boolean
    date?: boolean
    checkInTime?: boolean
    checkOutTime?: boolean
  }

  export type AttendanceOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "employeeId" | "date" | "checkInTime" | "checkOutTime", ExtArgs["result"]["attendance"]>
  export type AttendanceInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    employee?: boolean | EmployeeDefaultArgs<ExtArgs>
  }

  export type $AttendancePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Attendance"
    objects: {
      employee: Prisma.$EmployeePayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: number
      employeeId: number
      date: Date
      checkInTime: Date | null
      checkOutTime: Date | null
    }, ExtArgs["result"]["attendance"]>
    composites: {}
  }

  type AttendanceGetPayload<S extends boolean | null | undefined | AttendanceDefaultArgs> = $Result.GetResult<Prisma.$AttendancePayload, S>

  type AttendanceCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<AttendanceFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: AttendanceCountAggregateInputType | true
    }

  export interface AttendanceDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Attendance'], meta: { name: 'Attendance' } }
    /**
     * Find zero or one Attendance that matches the filter.
     * @param {AttendanceFindUniqueArgs} args - Arguments to find a Attendance
     * @example
     * // Get one Attendance
     * const attendance = await prisma.attendance.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends AttendanceFindUniqueArgs>(args: SelectSubset<T, AttendanceFindUniqueArgs<ExtArgs>>): Prisma__AttendanceClient<$Result.GetResult<Prisma.$AttendancePayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Attendance that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {AttendanceFindUniqueOrThrowArgs} args - Arguments to find a Attendance
     * @example
     * // Get one Attendance
     * const attendance = await prisma.attendance.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends AttendanceFindUniqueOrThrowArgs>(args: SelectSubset<T, AttendanceFindUniqueOrThrowArgs<ExtArgs>>): Prisma__AttendanceClient<$Result.GetResult<Prisma.$AttendancePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Attendance that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AttendanceFindFirstArgs} args - Arguments to find a Attendance
     * @example
     * // Get one Attendance
     * const attendance = await prisma.attendance.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends AttendanceFindFirstArgs>(args?: SelectSubset<T, AttendanceFindFirstArgs<ExtArgs>>): Prisma__AttendanceClient<$Result.GetResult<Prisma.$AttendancePayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Attendance that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AttendanceFindFirstOrThrowArgs} args - Arguments to find a Attendance
     * @example
     * // Get one Attendance
     * const attendance = await prisma.attendance.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends AttendanceFindFirstOrThrowArgs>(args?: SelectSubset<T, AttendanceFindFirstOrThrowArgs<ExtArgs>>): Prisma__AttendanceClient<$Result.GetResult<Prisma.$AttendancePayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Attendances that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AttendanceFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Attendances
     * const attendances = await prisma.attendance.findMany()
     * 
     * // Get first 10 Attendances
     * const attendances = await prisma.attendance.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const attendanceWithIdOnly = await prisma.attendance.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends AttendanceFindManyArgs>(args?: SelectSubset<T, AttendanceFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AttendancePayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Attendance.
     * @param {AttendanceCreateArgs} args - Arguments to create a Attendance.
     * @example
     * // Create one Attendance
     * const Attendance = await prisma.attendance.create({
     *   data: {
     *     // ... data to create a Attendance
     *   }
     * })
     * 
     */
    create<T extends AttendanceCreateArgs>(args: SelectSubset<T, AttendanceCreateArgs<ExtArgs>>): Prisma__AttendanceClient<$Result.GetResult<Prisma.$AttendancePayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Attendances.
     * @param {AttendanceCreateManyArgs} args - Arguments to create many Attendances.
     * @example
     * // Create many Attendances
     * const attendance = await prisma.attendance.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends AttendanceCreateManyArgs>(args?: SelectSubset<T, AttendanceCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a Attendance.
     * @param {AttendanceDeleteArgs} args - Arguments to delete one Attendance.
     * @example
     * // Delete one Attendance
     * const Attendance = await prisma.attendance.delete({
     *   where: {
     *     // ... filter to delete one Attendance
     *   }
     * })
     * 
     */
    delete<T extends AttendanceDeleteArgs>(args: SelectSubset<T, AttendanceDeleteArgs<ExtArgs>>): Prisma__AttendanceClient<$Result.GetResult<Prisma.$AttendancePayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Attendance.
     * @param {AttendanceUpdateArgs} args - Arguments to update one Attendance.
     * @example
     * // Update one Attendance
     * const attendance = await prisma.attendance.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends AttendanceUpdateArgs>(args: SelectSubset<T, AttendanceUpdateArgs<ExtArgs>>): Prisma__AttendanceClient<$Result.GetResult<Prisma.$AttendancePayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Attendances.
     * @param {AttendanceDeleteManyArgs} args - Arguments to filter Attendances to delete.
     * @example
     * // Delete a few Attendances
     * const { count } = await prisma.attendance.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends AttendanceDeleteManyArgs>(args?: SelectSubset<T, AttendanceDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Attendances.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AttendanceUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Attendances
     * const attendance = await prisma.attendance.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends AttendanceUpdateManyArgs>(args: SelectSubset<T, AttendanceUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Attendance.
     * @param {AttendanceUpsertArgs} args - Arguments to update or create a Attendance.
     * @example
     * // Update or create a Attendance
     * const attendance = await prisma.attendance.upsert({
     *   create: {
     *     // ... data to create a Attendance
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Attendance we want to update
     *   }
     * })
     */
    upsert<T extends AttendanceUpsertArgs>(args: SelectSubset<T, AttendanceUpsertArgs<ExtArgs>>): Prisma__AttendanceClient<$Result.GetResult<Prisma.$AttendancePayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Attendances.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AttendanceCountArgs} args - Arguments to filter Attendances to count.
     * @example
     * // Count the number of Attendances
     * const count = await prisma.attendance.count({
     *   where: {
     *     // ... the filter for the Attendances we want to count
     *   }
     * })
    **/
    count<T extends AttendanceCountArgs>(
      args?: Subset<T, AttendanceCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], AttendanceCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Attendance.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AttendanceAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends AttendanceAggregateArgs>(args: Subset<T, AttendanceAggregateArgs>): Prisma.PrismaPromise<GetAttendanceAggregateType<T>>

    /**
     * Group by Attendance.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AttendanceGroupByArgs} args - Group by arguments.
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
      T extends AttendanceGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: AttendanceGroupByArgs['orderBy'] }
        : { orderBy?: AttendanceGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, AttendanceGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetAttendanceGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Attendance model
   */
  readonly fields: AttendanceFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Attendance.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__AttendanceClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    employee<T extends EmployeeDefaultArgs<ExtArgs> = {}>(args?: Subset<T, EmployeeDefaultArgs<ExtArgs>>): Prisma__EmployeeClient<$Result.GetResult<Prisma.$EmployeePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
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
   * Fields of the Attendance model
   */
  interface AttendanceFieldRefs {
    readonly id: FieldRef<"Attendance", 'Int'>
    readonly employeeId: FieldRef<"Attendance", 'Int'>
    readonly date: FieldRef<"Attendance", 'DateTime'>
    readonly checkInTime: FieldRef<"Attendance", 'DateTime'>
    readonly checkOutTime: FieldRef<"Attendance", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Attendance findUnique
   */
  export type AttendanceFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Attendance
     */
    select?: AttendanceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Attendance
     */
    omit?: AttendanceOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AttendanceInclude<ExtArgs> | null
    /**
     * Filter, which Attendance to fetch.
     */
    where: AttendanceWhereUniqueInput
  }

  /**
   * Attendance findUniqueOrThrow
   */
  export type AttendanceFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Attendance
     */
    select?: AttendanceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Attendance
     */
    omit?: AttendanceOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AttendanceInclude<ExtArgs> | null
    /**
     * Filter, which Attendance to fetch.
     */
    where: AttendanceWhereUniqueInput
  }

  /**
   * Attendance findFirst
   */
  export type AttendanceFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Attendance
     */
    select?: AttendanceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Attendance
     */
    omit?: AttendanceOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AttendanceInclude<ExtArgs> | null
    /**
     * Filter, which Attendance to fetch.
     */
    where?: AttendanceWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Attendances to fetch.
     */
    orderBy?: AttendanceOrderByWithRelationInput | AttendanceOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Attendances.
     */
    cursor?: AttendanceWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Attendances from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Attendances.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Attendances.
     */
    distinct?: AttendanceScalarFieldEnum | AttendanceScalarFieldEnum[]
  }

  /**
   * Attendance findFirstOrThrow
   */
  export type AttendanceFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Attendance
     */
    select?: AttendanceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Attendance
     */
    omit?: AttendanceOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AttendanceInclude<ExtArgs> | null
    /**
     * Filter, which Attendance to fetch.
     */
    where?: AttendanceWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Attendances to fetch.
     */
    orderBy?: AttendanceOrderByWithRelationInput | AttendanceOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Attendances.
     */
    cursor?: AttendanceWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Attendances from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Attendances.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Attendances.
     */
    distinct?: AttendanceScalarFieldEnum | AttendanceScalarFieldEnum[]
  }

  /**
   * Attendance findMany
   */
  export type AttendanceFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Attendance
     */
    select?: AttendanceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Attendance
     */
    omit?: AttendanceOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AttendanceInclude<ExtArgs> | null
    /**
     * Filter, which Attendances to fetch.
     */
    where?: AttendanceWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Attendances to fetch.
     */
    orderBy?: AttendanceOrderByWithRelationInput | AttendanceOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Attendances.
     */
    cursor?: AttendanceWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Attendances from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Attendances.
     */
    skip?: number
    distinct?: AttendanceScalarFieldEnum | AttendanceScalarFieldEnum[]
  }

  /**
   * Attendance create
   */
  export type AttendanceCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Attendance
     */
    select?: AttendanceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Attendance
     */
    omit?: AttendanceOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AttendanceInclude<ExtArgs> | null
    /**
     * The data needed to create a Attendance.
     */
    data: XOR<AttendanceCreateInput, AttendanceUncheckedCreateInput>
  }

  /**
   * Attendance createMany
   */
  export type AttendanceCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Attendances.
     */
    data: AttendanceCreateManyInput | AttendanceCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Attendance update
   */
  export type AttendanceUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Attendance
     */
    select?: AttendanceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Attendance
     */
    omit?: AttendanceOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AttendanceInclude<ExtArgs> | null
    /**
     * The data needed to update a Attendance.
     */
    data: XOR<AttendanceUpdateInput, AttendanceUncheckedUpdateInput>
    /**
     * Choose, which Attendance to update.
     */
    where: AttendanceWhereUniqueInput
  }

  /**
   * Attendance updateMany
   */
  export type AttendanceUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Attendances.
     */
    data: XOR<AttendanceUpdateManyMutationInput, AttendanceUncheckedUpdateManyInput>
    /**
     * Filter which Attendances to update
     */
    where?: AttendanceWhereInput
    /**
     * Limit how many Attendances to update.
     */
    limit?: number
  }

  /**
   * Attendance upsert
   */
  export type AttendanceUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Attendance
     */
    select?: AttendanceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Attendance
     */
    omit?: AttendanceOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AttendanceInclude<ExtArgs> | null
    /**
     * The filter to search for the Attendance to update in case it exists.
     */
    where: AttendanceWhereUniqueInput
    /**
     * In case the Attendance found by the `where` argument doesn't exist, create a new Attendance with this data.
     */
    create: XOR<AttendanceCreateInput, AttendanceUncheckedCreateInput>
    /**
     * In case the Attendance was found with the provided `where` argument, update it with this data.
     */
    update: XOR<AttendanceUpdateInput, AttendanceUncheckedUpdateInput>
  }

  /**
   * Attendance delete
   */
  export type AttendanceDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Attendance
     */
    select?: AttendanceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Attendance
     */
    omit?: AttendanceOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AttendanceInclude<ExtArgs> | null
    /**
     * Filter which Attendance to delete.
     */
    where: AttendanceWhereUniqueInput
  }

  /**
   * Attendance deleteMany
   */
  export type AttendanceDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Attendances to delete
     */
    where?: AttendanceWhereInput
    /**
     * Limit how many Attendances to delete.
     */
    limit?: number
  }

  /**
   * Attendance without action
   */
  export type AttendanceDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Attendance
     */
    select?: AttendanceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Attendance
     */
    omit?: AttendanceOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AttendanceInclude<ExtArgs> | null
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


  export const EmployeeScalarFieldEnum: {
    id: 'id',
    employeeCode: 'employeeCode',
    name: 'name',
    gender: 'gender',
    birthDate: 'birthDate',
    password: 'password',
    role: 'role',
    avatar: 'avatar'
  };

  export type EmployeeScalarFieldEnum = (typeof EmployeeScalarFieldEnum)[keyof typeof EmployeeScalarFieldEnum]


  export const WorkInfoScalarFieldEnum: {
    id: 'id',
    department: 'department',
    position: 'position',
    specialization: 'specialization',
    joinedTBD: 'joinedTBD',
    joinedTeSCC: 'joinedTeSCC',
    seniorityStart: 'seniorityStart',
    seniority: 'seniority',
    contractNumber: 'contractNumber',
    contractDate: 'contractDate',
    contractType: 'contractType',
    contractEndDate: 'contractEndDate',
    employeeId: 'employeeId'
  };

  export type WorkInfoScalarFieldEnum = (typeof WorkInfoScalarFieldEnum)[keyof typeof WorkInfoScalarFieldEnum]


  export const PersonalInfoScalarFieldEnum: {
    id: 'id',
    identityNumber: 'identityNumber',
    issueDate: 'issueDate',
    issuePlace: 'issuePlace',
    hometown: 'hometown',
    idAddress: 'idAddress',
    education: 'education',
    drivingLicense: 'drivingLicense',
    toyotaCertificate: 'toyotaCertificate',
    taxCode: 'taxCode',
    insuranceNumber: 'insuranceNumber',
    insuranceSalary: 'insuranceSalary',
    employeeId: 'employeeId'
  };

  export type PersonalInfoScalarFieldEnum = (typeof PersonalInfoScalarFieldEnum)[keyof typeof PersonalInfoScalarFieldEnum]


  export const ContactInfoScalarFieldEnum: {
    id: 'id',
    phoneNumber: 'phoneNumber',
    relativePhone: 'relativePhone',
    companyPhone: 'companyPhone',
    email: 'email',
    employeeId: 'employeeId'
  };

  export type ContactInfoScalarFieldEnum = (typeof ContactInfoScalarFieldEnum)[keyof typeof ContactInfoScalarFieldEnum]


  export const OtherInfoScalarFieldEnum: {
    id: 'id',
    workStatus: 'workStatus',
    resignedDate: 'resignedDate',
    documentsChecked: 'documentsChecked',
    updatedAt: 'updatedAt',
    VCB: 'VCB',
    MTCV: 'MTCV',
    PNJ: 'PNJ',
    employeeId: 'employeeId'
  };

  export type OtherInfoScalarFieldEnum = (typeof OtherInfoScalarFieldEnum)[keyof typeof OtherInfoScalarFieldEnum]


  export const LeaveRequestScalarFieldEnum: {
    id: 'id',
    employeeId: 'employeeId',
    leaveType: 'leaveType',
    startDate: 'startDate',
    endDate: 'endDate',
    totalHours: 'totalHours',
    reason: 'reason',
    status: 'status',
    approvedBy: 'approvedBy',
    approvedAt: 'approvedAt',
    createdAt: 'createdAt'
  };

  export type LeaveRequestScalarFieldEnum = (typeof LeaveRequestScalarFieldEnum)[keyof typeof LeaveRequestScalarFieldEnum]


  export const AttendanceScalarFieldEnum: {
    id: 'id',
    employeeId: 'employeeId',
    date: 'date',
    checkInTime: 'checkInTime',
    checkOutTime: 'checkOutTime'
  };

  export type AttendanceScalarFieldEnum = (typeof AttendanceScalarFieldEnum)[keyof typeof AttendanceScalarFieldEnum]


  export const SortOrder: {
    asc: 'asc',
    desc: 'desc'
  };

  export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder]


  export const NullsOrder: {
    first: 'first',
    last: 'last'
  };

  export type NullsOrder = (typeof NullsOrder)[keyof typeof NullsOrder]


  export const EmployeeOrderByRelevanceFieldEnum: {
    employeeCode: 'employeeCode',
    name: 'name',
    password: 'password',
    avatar: 'avatar'
  };

  export type EmployeeOrderByRelevanceFieldEnum = (typeof EmployeeOrderByRelevanceFieldEnum)[keyof typeof EmployeeOrderByRelevanceFieldEnum]


  export const WorkInfoOrderByRelevanceFieldEnum: {
    department: 'department',
    position: 'position',
    specialization: 'specialization',
    seniority: 'seniority',
    contractNumber: 'contractNumber',
    contractType: 'contractType'
  };

  export type WorkInfoOrderByRelevanceFieldEnum = (typeof WorkInfoOrderByRelevanceFieldEnum)[keyof typeof WorkInfoOrderByRelevanceFieldEnum]


  export const PersonalInfoOrderByRelevanceFieldEnum: {
    identityNumber: 'identityNumber',
    issuePlace: 'issuePlace',
    hometown: 'hometown',
    idAddress: 'idAddress',
    education: 'education',
    drivingLicense: 'drivingLicense',
    toyotaCertificate: 'toyotaCertificate',
    taxCode: 'taxCode',
    insuranceNumber: 'insuranceNumber'
  };

  export type PersonalInfoOrderByRelevanceFieldEnum = (typeof PersonalInfoOrderByRelevanceFieldEnum)[keyof typeof PersonalInfoOrderByRelevanceFieldEnum]


  export const ContactInfoOrderByRelevanceFieldEnum: {
    phoneNumber: 'phoneNumber',
    relativePhone: 'relativePhone',
    companyPhone: 'companyPhone',
    email: 'email'
  };

  export type ContactInfoOrderByRelevanceFieldEnum = (typeof ContactInfoOrderByRelevanceFieldEnum)[keyof typeof ContactInfoOrderByRelevanceFieldEnum]


  export const OtherInfoOrderByRelevanceFieldEnum: {
    documentsChecked: 'documentsChecked',
    VCB: 'VCB',
    MTCV: 'MTCV',
    PNJ: 'PNJ'
  };

  export type OtherInfoOrderByRelevanceFieldEnum = (typeof OtherInfoOrderByRelevanceFieldEnum)[keyof typeof OtherInfoOrderByRelevanceFieldEnum]


  export const LeaveRequestOrderByRelevanceFieldEnum: {
    reason: 'reason',
    approvedBy: 'approvedBy'
  };

  export type LeaveRequestOrderByRelevanceFieldEnum = (typeof LeaveRequestOrderByRelevanceFieldEnum)[keyof typeof LeaveRequestOrderByRelevanceFieldEnum]


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
   * Reference to a field of type 'Sex'
   */
  export type EnumSexFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Sex'>
    


  /**
   * Reference to a field of type 'DateTime'
   */
  export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime'>
    


  /**
   * Reference to a field of type 'Role'
   */
  export type EnumRoleFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Role'>
    


  /**
   * Reference to a field of type 'WorkStatus'
   */
  export type EnumWorkStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'WorkStatus'>
    


  /**
   * Reference to a field of type 'LeaveTypeEnum'
   */
  export type EnumLeaveTypeEnumFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'LeaveTypeEnum'>
    


  /**
   * Reference to a field of type 'Float'
   */
  export type FloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float'>
    


  /**
   * Reference to a field of type 'LeaveStatus'
   */
  export type EnumLeaveStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'LeaveStatus'>
    
  /**
   * Deep Input Types
   */


  export type EmployeeWhereInput = {
    AND?: EmployeeWhereInput | EmployeeWhereInput[]
    OR?: EmployeeWhereInput[]
    NOT?: EmployeeWhereInput | EmployeeWhereInput[]
    id?: IntFilter<"Employee"> | number
    employeeCode?: StringFilter<"Employee"> | string
    name?: StringFilter<"Employee"> | string
    gender?: EnumSexFilter<"Employee"> | $Enums.Sex
    birthDate?: DateTimeNullableFilter<"Employee"> | Date | string | null
    password?: StringFilter<"Employee"> | string
    role?: EnumRoleFilter<"Employee"> | $Enums.Role
    avatar?: StringNullableFilter<"Employee"> | string | null
    workInfo?: XOR<WorkInfoNullableScalarRelationFilter, WorkInfoWhereInput> | null
    personalInfo?: XOR<PersonalInfoNullableScalarRelationFilter, PersonalInfoWhereInput> | null
    contactInfo?: XOR<ContactInfoNullableScalarRelationFilter, ContactInfoWhereInput> | null
    otherInfo?: XOR<OtherInfoNullableScalarRelationFilter, OtherInfoWhereInput> | null
    LeaveRequest?: LeaveRequestListRelationFilter
    Attendance?: AttendanceListRelationFilter
  }

  export type EmployeeOrderByWithRelationInput = {
    id?: SortOrder
    employeeCode?: SortOrder
    name?: SortOrder
    gender?: SortOrder
    birthDate?: SortOrderInput | SortOrder
    password?: SortOrder
    role?: SortOrder
    avatar?: SortOrderInput | SortOrder
    workInfo?: WorkInfoOrderByWithRelationInput
    personalInfo?: PersonalInfoOrderByWithRelationInput
    contactInfo?: ContactInfoOrderByWithRelationInput
    otherInfo?: OtherInfoOrderByWithRelationInput
    LeaveRequest?: LeaveRequestOrderByRelationAggregateInput
    Attendance?: AttendanceOrderByRelationAggregateInput
    _relevance?: EmployeeOrderByRelevanceInput
  }

  export type EmployeeWhereUniqueInput = Prisma.AtLeast<{
    id?: number
    employeeCode?: string
    AND?: EmployeeWhereInput | EmployeeWhereInput[]
    OR?: EmployeeWhereInput[]
    NOT?: EmployeeWhereInput | EmployeeWhereInput[]
    name?: StringFilter<"Employee"> | string
    gender?: EnumSexFilter<"Employee"> | $Enums.Sex
    birthDate?: DateTimeNullableFilter<"Employee"> | Date | string | null
    password?: StringFilter<"Employee"> | string
    role?: EnumRoleFilter<"Employee"> | $Enums.Role
    avatar?: StringNullableFilter<"Employee"> | string | null
    workInfo?: XOR<WorkInfoNullableScalarRelationFilter, WorkInfoWhereInput> | null
    personalInfo?: XOR<PersonalInfoNullableScalarRelationFilter, PersonalInfoWhereInput> | null
    contactInfo?: XOR<ContactInfoNullableScalarRelationFilter, ContactInfoWhereInput> | null
    otherInfo?: XOR<OtherInfoNullableScalarRelationFilter, OtherInfoWhereInput> | null
    LeaveRequest?: LeaveRequestListRelationFilter
    Attendance?: AttendanceListRelationFilter
  }, "id" | "employeeCode">

  export type EmployeeOrderByWithAggregationInput = {
    id?: SortOrder
    employeeCode?: SortOrder
    name?: SortOrder
    gender?: SortOrder
    birthDate?: SortOrderInput | SortOrder
    password?: SortOrder
    role?: SortOrder
    avatar?: SortOrderInput | SortOrder
    _count?: EmployeeCountOrderByAggregateInput
    _avg?: EmployeeAvgOrderByAggregateInput
    _max?: EmployeeMaxOrderByAggregateInput
    _min?: EmployeeMinOrderByAggregateInput
    _sum?: EmployeeSumOrderByAggregateInput
  }

  export type EmployeeScalarWhereWithAggregatesInput = {
    AND?: EmployeeScalarWhereWithAggregatesInput | EmployeeScalarWhereWithAggregatesInput[]
    OR?: EmployeeScalarWhereWithAggregatesInput[]
    NOT?: EmployeeScalarWhereWithAggregatesInput | EmployeeScalarWhereWithAggregatesInput[]
    id?: IntWithAggregatesFilter<"Employee"> | number
    employeeCode?: StringWithAggregatesFilter<"Employee"> | string
    name?: StringWithAggregatesFilter<"Employee"> | string
    gender?: EnumSexWithAggregatesFilter<"Employee"> | $Enums.Sex
    birthDate?: DateTimeNullableWithAggregatesFilter<"Employee"> | Date | string | null
    password?: StringWithAggregatesFilter<"Employee"> | string
    role?: EnumRoleWithAggregatesFilter<"Employee"> | $Enums.Role
    avatar?: StringNullableWithAggregatesFilter<"Employee"> | string | null
  }

  export type WorkInfoWhereInput = {
    AND?: WorkInfoWhereInput | WorkInfoWhereInput[]
    OR?: WorkInfoWhereInput[]
    NOT?: WorkInfoWhereInput | WorkInfoWhereInput[]
    id?: IntFilter<"WorkInfo"> | number
    department?: StringFilter<"WorkInfo"> | string
    position?: StringFilter<"WorkInfo"> | string
    specialization?: StringNullableFilter<"WorkInfo"> | string | null
    joinedTBD?: DateTimeNullableFilter<"WorkInfo"> | Date | string | null
    joinedTeSCC?: DateTimeNullableFilter<"WorkInfo"> | Date | string | null
    seniorityStart?: DateTimeNullableFilter<"WorkInfo"> | Date | string | null
    seniority?: StringNullableFilter<"WorkInfo"> | string | null
    contractNumber?: StringNullableFilter<"WorkInfo"> | string | null
    contractDate?: DateTimeNullableFilter<"WorkInfo"> | Date | string | null
    contractType?: StringNullableFilter<"WorkInfo"> | string | null
    contractEndDate?: DateTimeNullableFilter<"WorkInfo"> | Date | string | null
    employeeId?: IntFilter<"WorkInfo"> | number
    employee?: XOR<EmployeeScalarRelationFilter, EmployeeWhereInput>
  }

  export type WorkInfoOrderByWithRelationInput = {
    id?: SortOrder
    department?: SortOrder
    position?: SortOrder
    specialization?: SortOrderInput | SortOrder
    joinedTBD?: SortOrderInput | SortOrder
    joinedTeSCC?: SortOrderInput | SortOrder
    seniorityStart?: SortOrderInput | SortOrder
    seniority?: SortOrderInput | SortOrder
    contractNumber?: SortOrderInput | SortOrder
    contractDate?: SortOrderInput | SortOrder
    contractType?: SortOrderInput | SortOrder
    contractEndDate?: SortOrderInput | SortOrder
    employeeId?: SortOrder
    employee?: EmployeeOrderByWithRelationInput
    _relevance?: WorkInfoOrderByRelevanceInput
  }

  export type WorkInfoWhereUniqueInput = Prisma.AtLeast<{
    id?: number
    employeeId?: number
    AND?: WorkInfoWhereInput | WorkInfoWhereInput[]
    OR?: WorkInfoWhereInput[]
    NOT?: WorkInfoWhereInput | WorkInfoWhereInput[]
    department?: StringFilter<"WorkInfo"> | string
    position?: StringFilter<"WorkInfo"> | string
    specialization?: StringNullableFilter<"WorkInfo"> | string | null
    joinedTBD?: DateTimeNullableFilter<"WorkInfo"> | Date | string | null
    joinedTeSCC?: DateTimeNullableFilter<"WorkInfo"> | Date | string | null
    seniorityStart?: DateTimeNullableFilter<"WorkInfo"> | Date | string | null
    seniority?: StringNullableFilter<"WorkInfo"> | string | null
    contractNumber?: StringNullableFilter<"WorkInfo"> | string | null
    contractDate?: DateTimeNullableFilter<"WorkInfo"> | Date | string | null
    contractType?: StringNullableFilter<"WorkInfo"> | string | null
    contractEndDate?: DateTimeNullableFilter<"WorkInfo"> | Date | string | null
    employee?: XOR<EmployeeScalarRelationFilter, EmployeeWhereInput>
  }, "id" | "employeeId">

  export type WorkInfoOrderByWithAggregationInput = {
    id?: SortOrder
    department?: SortOrder
    position?: SortOrder
    specialization?: SortOrderInput | SortOrder
    joinedTBD?: SortOrderInput | SortOrder
    joinedTeSCC?: SortOrderInput | SortOrder
    seniorityStart?: SortOrderInput | SortOrder
    seniority?: SortOrderInput | SortOrder
    contractNumber?: SortOrderInput | SortOrder
    contractDate?: SortOrderInput | SortOrder
    contractType?: SortOrderInput | SortOrder
    contractEndDate?: SortOrderInput | SortOrder
    employeeId?: SortOrder
    _count?: WorkInfoCountOrderByAggregateInput
    _avg?: WorkInfoAvgOrderByAggregateInput
    _max?: WorkInfoMaxOrderByAggregateInput
    _min?: WorkInfoMinOrderByAggregateInput
    _sum?: WorkInfoSumOrderByAggregateInput
  }

  export type WorkInfoScalarWhereWithAggregatesInput = {
    AND?: WorkInfoScalarWhereWithAggregatesInput | WorkInfoScalarWhereWithAggregatesInput[]
    OR?: WorkInfoScalarWhereWithAggregatesInput[]
    NOT?: WorkInfoScalarWhereWithAggregatesInput | WorkInfoScalarWhereWithAggregatesInput[]
    id?: IntWithAggregatesFilter<"WorkInfo"> | number
    department?: StringWithAggregatesFilter<"WorkInfo"> | string
    position?: StringWithAggregatesFilter<"WorkInfo"> | string
    specialization?: StringNullableWithAggregatesFilter<"WorkInfo"> | string | null
    joinedTBD?: DateTimeNullableWithAggregatesFilter<"WorkInfo"> | Date | string | null
    joinedTeSCC?: DateTimeNullableWithAggregatesFilter<"WorkInfo"> | Date | string | null
    seniorityStart?: DateTimeNullableWithAggregatesFilter<"WorkInfo"> | Date | string | null
    seniority?: StringNullableWithAggregatesFilter<"WorkInfo"> | string | null
    contractNumber?: StringNullableWithAggregatesFilter<"WorkInfo"> | string | null
    contractDate?: DateTimeNullableWithAggregatesFilter<"WorkInfo"> | Date | string | null
    contractType?: StringNullableWithAggregatesFilter<"WorkInfo"> | string | null
    contractEndDate?: DateTimeNullableWithAggregatesFilter<"WorkInfo"> | Date | string | null
    employeeId?: IntWithAggregatesFilter<"WorkInfo"> | number
  }

  export type PersonalInfoWhereInput = {
    AND?: PersonalInfoWhereInput | PersonalInfoWhereInput[]
    OR?: PersonalInfoWhereInput[]
    NOT?: PersonalInfoWhereInput | PersonalInfoWhereInput[]
    id?: IntFilter<"PersonalInfo"> | number
    identityNumber?: StringNullableFilter<"PersonalInfo"> | string | null
    issueDate?: DateTimeNullableFilter<"PersonalInfo"> | Date | string | null
    issuePlace?: StringNullableFilter<"PersonalInfo"> | string | null
    hometown?: StringNullableFilter<"PersonalInfo"> | string | null
    idAddress?: StringNullableFilter<"PersonalInfo"> | string | null
    education?: StringNullableFilter<"PersonalInfo"> | string | null
    drivingLicense?: StringNullableFilter<"PersonalInfo"> | string | null
    toyotaCertificate?: StringNullableFilter<"PersonalInfo"> | string | null
    taxCode?: StringNullableFilter<"PersonalInfo"> | string | null
    insuranceNumber?: StringNullableFilter<"PersonalInfo"> | string | null
    insuranceSalary?: IntNullableFilter<"PersonalInfo"> | number | null
    employeeId?: IntFilter<"PersonalInfo"> | number
    employee?: XOR<EmployeeScalarRelationFilter, EmployeeWhereInput>
  }

  export type PersonalInfoOrderByWithRelationInput = {
    id?: SortOrder
    identityNumber?: SortOrderInput | SortOrder
    issueDate?: SortOrderInput | SortOrder
    issuePlace?: SortOrderInput | SortOrder
    hometown?: SortOrderInput | SortOrder
    idAddress?: SortOrderInput | SortOrder
    education?: SortOrderInput | SortOrder
    drivingLicense?: SortOrderInput | SortOrder
    toyotaCertificate?: SortOrderInput | SortOrder
    taxCode?: SortOrderInput | SortOrder
    insuranceNumber?: SortOrderInput | SortOrder
    insuranceSalary?: SortOrderInput | SortOrder
    employeeId?: SortOrder
    employee?: EmployeeOrderByWithRelationInput
    _relevance?: PersonalInfoOrderByRelevanceInput
  }

  export type PersonalInfoWhereUniqueInput = Prisma.AtLeast<{
    id?: number
    employeeId?: number
    AND?: PersonalInfoWhereInput | PersonalInfoWhereInput[]
    OR?: PersonalInfoWhereInput[]
    NOT?: PersonalInfoWhereInput | PersonalInfoWhereInput[]
    identityNumber?: StringNullableFilter<"PersonalInfo"> | string | null
    issueDate?: DateTimeNullableFilter<"PersonalInfo"> | Date | string | null
    issuePlace?: StringNullableFilter<"PersonalInfo"> | string | null
    hometown?: StringNullableFilter<"PersonalInfo"> | string | null
    idAddress?: StringNullableFilter<"PersonalInfo"> | string | null
    education?: StringNullableFilter<"PersonalInfo"> | string | null
    drivingLicense?: StringNullableFilter<"PersonalInfo"> | string | null
    toyotaCertificate?: StringNullableFilter<"PersonalInfo"> | string | null
    taxCode?: StringNullableFilter<"PersonalInfo"> | string | null
    insuranceNumber?: StringNullableFilter<"PersonalInfo"> | string | null
    insuranceSalary?: IntNullableFilter<"PersonalInfo"> | number | null
    employee?: XOR<EmployeeScalarRelationFilter, EmployeeWhereInput>
  }, "id" | "employeeId">

  export type PersonalInfoOrderByWithAggregationInput = {
    id?: SortOrder
    identityNumber?: SortOrderInput | SortOrder
    issueDate?: SortOrderInput | SortOrder
    issuePlace?: SortOrderInput | SortOrder
    hometown?: SortOrderInput | SortOrder
    idAddress?: SortOrderInput | SortOrder
    education?: SortOrderInput | SortOrder
    drivingLicense?: SortOrderInput | SortOrder
    toyotaCertificate?: SortOrderInput | SortOrder
    taxCode?: SortOrderInput | SortOrder
    insuranceNumber?: SortOrderInput | SortOrder
    insuranceSalary?: SortOrderInput | SortOrder
    employeeId?: SortOrder
    _count?: PersonalInfoCountOrderByAggregateInput
    _avg?: PersonalInfoAvgOrderByAggregateInput
    _max?: PersonalInfoMaxOrderByAggregateInput
    _min?: PersonalInfoMinOrderByAggregateInput
    _sum?: PersonalInfoSumOrderByAggregateInput
  }

  export type PersonalInfoScalarWhereWithAggregatesInput = {
    AND?: PersonalInfoScalarWhereWithAggregatesInput | PersonalInfoScalarWhereWithAggregatesInput[]
    OR?: PersonalInfoScalarWhereWithAggregatesInput[]
    NOT?: PersonalInfoScalarWhereWithAggregatesInput | PersonalInfoScalarWhereWithAggregatesInput[]
    id?: IntWithAggregatesFilter<"PersonalInfo"> | number
    identityNumber?: StringNullableWithAggregatesFilter<"PersonalInfo"> | string | null
    issueDate?: DateTimeNullableWithAggregatesFilter<"PersonalInfo"> | Date | string | null
    issuePlace?: StringNullableWithAggregatesFilter<"PersonalInfo"> | string | null
    hometown?: StringNullableWithAggregatesFilter<"PersonalInfo"> | string | null
    idAddress?: StringNullableWithAggregatesFilter<"PersonalInfo"> | string | null
    education?: StringNullableWithAggregatesFilter<"PersonalInfo"> | string | null
    drivingLicense?: StringNullableWithAggregatesFilter<"PersonalInfo"> | string | null
    toyotaCertificate?: StringNullableWithAggregatesFilter<"PersonalInfo"> | string | null
    taxCode?: StringNullableWithAggregatesFilter<"PersonalInfo"> | string | null
    insuranceNumber?: StringNullableWithAggregatesFilter<"PersonalInfo"> | string | null
    insuranceSalary?: IntNullableWithAggregatesFilter<"PersonalInfo"> | number | null
    employeeId?: IntWithAggregatesFilter<"PersonalInfo"> | number
  }

  export type ContactInfoWhereInput = {
    AND?: ContactInfoWhereInput | ContactInfoWhereInput[]
    OR?: ContactInfoWhereInput[]
    NOT?: ContactInfoWhereInput | ContactInfoWhereInput[]
    id?: IntFilter<"ContactInfo"> | number
    phoneNumber?: StringNullableFilter<"ContactInfo"> | string | null
    relativePhone?: StringNullableFilter<"ContactInfo"> | string | null
    companyPhone?: StringNullableFilter<"ContactInfo"> | string | null
    email?: StringNullableFilter<"ContactInfo"> | string | null
    employeeId?: IntFilter<"ContactInfo"> | number
    employee?: XOR<EmployeeScalarRelationFilter, EmployeeWhereInput>
  }

  export type ContactInfoOrderByWithRelationInput = {
    id?: SortOrder
    phoneNumber?: SortOrderInput | SortOrder
    relativePhone?: SortOrderInput | SortOrder
    companyPhone?: SortOrderInput | SortOrder
    email?: SortOrderInput | SortOrder
    employeeId?: SortOrder
    employee?: EmployeeOrderByWithRelationInput
    _relevance?: ContactInfoOrderByRelevanceInput
  }

  export type ContactInfoWhereUniqueInput = Prisma.AtLeast<{
    id?: number
    employeeId?: number
    AND?: ContactInfoWhereInput | ContactInfoWhereInput[]
    OR?: ContactInfoWhereInput[]
    NOT?: ContactInfoWhereInput | ContactInfoWhereInput[]
    phoneNumber?: StringNullableFilter<"ContactInfo"> | string | null
    relativePhone?: StringNullableFilter<"ContactInfo"> | string | null
    companyPhone?: StringNullableFilter<"ContactInfo"> | string | null
    email?: StringNullableFilter<"ContactInfo"> | string | null
    employee?: XOR<EmployeeScalarRelationFilter, EmployeeWhereInput>
  }, "id" | "employeeId">

  export type ContactInfoOrderByWithAggregationInput = {
    id?: SortOrder
    phoneNumber?: SortOrderInput | SortOrder
    relativePhone?: SortOrderInput | SortOrder
    companyPhone?: SortOrderInput | SortOrder
    email?: SortOrderInput | SortOrder
    employeeId?: SortOrder
    _count?: ContactInfoCountOrderByAggregateInput
    _avg?: ContactInfoAvgOrderByAggregateInput
    _max?: ContactInfoMaxOrderByAggregateInput
    _min?: ContactInfoMinOrderByAggregateInput
    _sum?: ContactInfoSumOrderByAggregateInput
  }

  export type ContactInfoScalarWhereWithAggregatesInput = {
    AND?: ContactInfoScalarWhereWithAggregatesInput | ContactInfoScalarWhereWithAggregatesInput[]
    OR?: ContactInfoScalarWhereWithAggregatesInput[]
    NOT?: ContactInfoScalarWhereWithAggregatesInput | ContactInfoScalarWhereWithAggregatesInput[]
    id?: IntWithAggregatesFilter<"ContactInfo"> | number
    phoneNumber?: StringNullableWithAggregatesFilter<"ContactInfo"> | string | null
    relativePhone?: StringNullableWithAggregatesFilter<"ContactInfo"> | string | null
    companyPhone?: StringNullableWithAggregatesFilter<"ContactInfo"> | string | null
    email?: StringNullableWithAggregatesFilter<"ContactInfo"> | string | null
    employeeId?: IntWithAggregatesFilter<"ContactInfo"> | number
  }

  export type OtherInfoWhereInput = {
    AND?: OtherInfoWhereInput | OtherInfoWhereInput[]
    OR?: OtherInfoWhereInput[]
    NOT?: OtherInfoWhereInput | OtherInfoWhereInput[]
    id?: IntFilter<"OtherInfo"> | number
    workStatus?: EnumWorkStatusFilter<"OtherInfo"> | $Enums.WorkStatus
    resignedDate?: DateTimeNullableFilter<"OtherInfo"> | Date | string | null
    documentsChecked?: StringNullableFilter<"OtherInfo"> | string | null
    updatedAt?: DateTimeNullableFilter<"OtherInfo"> | Date | string | null
    VCB?: StringNullableFilter<"OtherInfo"> | string | null
    MTCV?: StringNullableFilter<"OtherInfo"> | string | null
    PNJ?: StringNullableFilter<"OtherInfo"> | string | null
    employeeId?: IntFilter<"OtherInfo"> | number
    employee?: XOR<EmployeeScalarRelationFilter, EmployeeWhereInput>
  }

  export type OtherInfoOrderByWithRelationInput = {
    id?: SortOrder
    workStatus?: SortOrder
    resignedDate?: SortOrderInput | SortOrder
    documentsChecked?: SortOrderInput | SortOrder
    updatedAt?: SortOrderInput | SortOrder
    VCB?: SortOrderInput | SortOrder
    MTCV?: SortOrderInput | SortOrder
    PNJ?: SortOrderInput | SortOrder
    employeeId?: SortOrder
    employee?: EmployeeOrderByWithRelationInput
    _relevance?: OtherInfoOrderByRelevanceInput
  }

  export type OtherInfoWhereUniqueInput = Prisma.AtLeast<{
    id?: number
    employeeId?: number
    AND?: OtherInfoWhereInput | OtherInfoWhereInput[]
    OR?: OtherInfoWhereInput[]
    NOT?: OtherInfoWhereInput | OtherInfoWhereInput[]
    workStatus?: EnumWorkStatusFilter<"OtherInfo"> | $Enums.WorkStatus
    resignedDate?: DateTimeNullableFilter<"OtherInfo"> | Date | string | null
    documentsChecked?: StringNullableFilter<"OtherInfo"> | string | null
    updatedAt?: DateTimeNullableFilter<"OtherInfo"> | Date | string | null
    VCB?: StringNullableFilter<"OtherInfo"> | string | null
    MTCV?: StringNullableFilter<"OtherInfo"> | string | null
    PNJ?: StringNullableFilter<"OtherInfo"> | string | null
    employee?: XOR<EmployeeScalarRelationFilter, EmployeeWhereInput>
  }, "id" | "employeeId">

  export type OtherInfoOrderByWithAggregationInput = {
    id?: SortOrder
    workStatus?: SortOrder
    resignedDate?: SortOrderInput | SortOrder
    documentsChecked?: SortOrderInput | SortOrder
    updatedAt?: SortOrderInput | SortOrder
    VCB?: SortOrderInput | SortOrder
    MTCV?: SortOrderInput | SortOrder
    PNJ?: SortOrderInput | SortOrder
    employeeId?: SortOrder
    _count?: OtherInfoCountOrderByAggregateInput
    _avg?: OtherInfoAvgOrderByAggregateInput
    _max?: OtherInfoMaxOrderByAggregateInput
    _min?: OtherInfoMinOrderByAggregateInput
    _sum?: OtherInfoSumOrderByAggregateInput
  }

  export type OtherInfoScalarWhereWithAggregatesInput = {
    AND?: OtherInfoScalarWhereWithAggregatesInput | OtherInfoScalarWhereWithAggregatesInput[]
    OR?: OtherInfoScalarWhereWithAggregatesInput[]
    NOT?: OtherInfoScalarWhereWithAggregatesInput | OtherInfoScalarWhereWithAggregatesInput[]
    id?: IntWithAggregatesFilter<"OtherInfo"> | number
    workStatus?: EnumWorkStatusWithAggregatesFilter<"OtherInfo"> | $Enums.WorkStatus
    resignedDate?: DateTimeNullableWithAggregatesFilter<"OtherInfo"> | Date | string | null
    documentsChecked?: StringNullableWithAggregatesFilter<"OtherInfo"> | string | null
    updatedAt?: DateTimeNullableWithAggregatesFilter<"OtherInfo"> | Date | string | null
    VCB?: StringNullableWithAggregatesFilter<"OtherInfo"> | string | null
    MTCV?: StringNullableWithAggregatesFilter<"OtherInfo"> | string | null
    PNJ?: StringNullableWithAggregatesFilter<"OtherInfo"> | string | null
    employeeId?: IntWithAggregatesFilter<"OtherInfo"> | number
  }

  export type LeaveRequestWhereInput = {
    AND?: LeaveRequestWhereInput | LeaveRequestWhereInput[]
    OR?: LeaveRequestWhereInput[]
    NOT?: LeaveRequestWhereInput | LeaveRequestWhereInput[]
    id?: IntFilter<"LeaveRequest"> | number
    employeeId?: IntFilter<"LeaveRequest"> | number
    leaveType?: EnumLeaveTypeEnumFilter<"LeaveRequest"> | $Enums.LeaveTypeEnum
    startDate?: DateTimeFilter<"LeaveRequest"> | Date | string
    endDate?: DateTimeFilter<"LeaveRequest"> | Date | string
    totalHours?: FloatNullableFilter<"LeaveRequest"> | number | null
    reason?: StringNullableFilter<"LeaveRequest"> | string | null
    status?: EnumLeaveStatusFilter<"LeaveRequest"> | $Enums.LeaveStatus
    approvedBy?: StringNullableFilter<"LeaveRequest"> | string | null
    approvedAt?: DateTimeNullableFilter<"LeaveRequest"> | Date | string | null
    createdAt?: DateTimeFilter<"LeaveRequest"> | Date | string
    employee?: XOR<EmployeeScalarRelationFilter, EmployeeWhereInput>
  }

  export type LeaveRequestOrderByWithRelationInput = {
    id?: SortOrder
    employeeId?: SortOrder
    leaveType?: SortOrder
    startDate?: SortOrder
    endDate?: SortOrder
    totalHours?: SortOrderInput | SortOrder
    reason?: SortOrderInput | SortOrder
    status?: SortOrder
    approvedBy?: SortOrderInput | SortOrder
    approvedAt?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    employee?: EmployeeOrderByWithRelationInput
    _relevance?: LeaveRequestOrderByRelevanceInput
  }

  export type LeaveRequestWhereUniqueInput = Prisma.AtLeast<{
    id?: number
    AND?: LeaveRequestWhereInput | LeaveRequestWhereInput[]
    OR?: LeaveRequestWhereInput[]
    NOT?: LeaveRequestWhereInput | LeaveRequestWhereInput[]
    employeeId?: IntFilter<"LeaveRequest"> | number
    leaveType?: EnumLeaveTypeEnumFilter<"LeaveRequest"> | $Enums.LeaveTypeEnum
    startDate?: DateTimeFilter<"LeaveRequest"> | Date | string
    endDate?: DateTimeFilter<"LeaveRequest"> | Date | string
    totalHours?: FloatNullableFilter<"LeaveRequest"> | number | null
    reason?: StringNullableFilter<"LeaveRequest"> | string | null
    status?: EnumLeaveStatusFilter<"LeaveRequest"> | $Enums.LeaveStatus
    approvedBy?: StringNullableFilter<"LeaveRequest"> | string | null
    approvedAt?: DateTimeNullableFilter<"LeaveRequest"> | Date | string | null
    createdAt?: DateTimeFilter<"LeaveRequest"> | Date | string
    employee?: XOR<EmployeeScalarRelationFilter, EmployeeWhereInput>
  }, "id">

  export type LeaveRequestOrderByWithAggregationInput = {
    id?: SortOrder
    employeeId?: SortOrder
    leaveType?: SortOrder
    startDate?: SortOrder
    endDate?: SortOrder
    totalHours?: SortOrderInput | SortOrder
    reason?: SortOrderInput | SortOrder
    status?: SortOrder
    approvedBy?: SortOrderInput | SortOrder
    approvedAt?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    _count?: LeaveRequestCountOrderByAggregateInput
    _avg?: LeaveRequestAvgOrderByAggregateInput
    _max?: LeaveRequestMaxOrderByAggregateInput
    _min?: LeaveRequestMinOrderByAggregateInput
    _sum?: LeaveRequestSumOrderByAggregateInput
  }

  export type LeaveRequestScalarWhereWithAggregatesInput = {
    AND?: LeaveRequestScalarWhereWithAggregatesInput | LeaveRequestScalarWhereWithAggregatesInput[]
    OR?: LeaveRequestScalarWhereWithAggregatesInput[]
    NOT?: LeaveRequestScalarWhereWithAggregatesInput | LeaveRequestScalarWhereWithAggregatesInput[]
    id?: IntWithAggregatesFilter<"LeaveRequest"> | number
    employeeId?: IntWithAggregatesFilter<"LeaveRequest"> | number
    leaveType?: EnumLeaveTypeEnumWithAggregatesFilter<"LeaveRequest"> | $Enums.LeaveTypeEnum
    startDate?: DateTimeWithAggregatesFilter<"LeaveRequest"> | Date | string
    endDate?: DateTimeWithAggregatesFilter<"LeaveRequest"> | Date | string
    totalHours?: FloatNullableWithAggregatesFilter<"LeaveRequest"> | number | null
    reason?: StringNullableWithAggregatesFilter<"LeaveRequest"> | string | null
    status?: EnumLeaveStatusWithAggregatesFilter<"LeaveRequest"> | $Enums.LeaveStatus
    approvedBy?: StringNullableWithAggregatesFilter<"LeaveRequest"> | string | null
    approvedAt?: DateTimeNullableWithAggregatesFilter<"LeaveRequest"> | Date | string | null
    createdAt?: DateTimeWithAggregatesFilter<"LeaveRequest"> | Date | string
  }

  export type AttendanceWhereInput = {
    AND?: AttendanceWhereInput | AttendanceWhereInput[]
    OR?: AttendanceWhereInput[]
    NOT?: AttendanceWhereInput | AttendanceWhereInput[]
    id?: IntFilter<"Attendance"> | number
    employeeId?: IntFilter<"Attendance"> | number
    date?: DateTimeFilter<"Attendance"> | Date | string
    checkInTime?: DateTimeNullableFilter<"Attendance"> | Date | string | null
    checkOutTime?: DateTimeNullableFilter<"Attendance"> | Date | string | null
    employee?: XOR<EmployeeScalarRelationFilter, EmployeeWhereInput>
  }

  export type AttendanceOrderByWithRelationInput = {
    id?: SortOrder
    employeeId?: SortOrder
    date?: SortOrder
    checkInTime?: SortOrderInput | SortOrder
    checkOutTime?: SortOrderInput | SortOrder
    employee?: EmployeeOrderByWithRelationInput
  }

  export type AttendanceWhereUniqueInput = Prisma.AtLeast<{
    id?: number
    AND?: AttendanceWhereInput | AttendanceWhereInput[]
    OR?: AttendanceWhereInput[]
    NOT?: AttendanceWhereInput | AttendanceWhereInput[]
    employeeId?: IntFilter<"Attendance"> | number
    date?: DateTimeFilter<"Attendance"> | Date | string
    checkInTime?: DateTimeNullableFilter<"Attendance"> | Date | string | null
    checkOutTime?: DateTimeNullableFilter<"Attendance"> | Date | string | null
    employee?: XOR<EmployeeScalarRelationFilter, EmployeeWhereInput>
  }, "id">

  export type AttendanceOrderByWithAggregationInput = {
    id?: SortOrder
    employeeId?: SortOrder
    date?: SortOrder
    checkInTime?: SortOrderInput | SortOrder
    checkOutTime?: SortOrderInput | SortOrder
    _count?: AttendanceCountOrderByAggregateInput
    _avg?: AttendanceAvgOrderByAggregateInput
    _max?: AttendanceMaxOrderByAggregateInput
    _min?: AttendanceMinOrderByAggregateInput
    _sum?: AttendanceSumOrderByAggregateInput
  }

  export type AttendanceScalarWhereWithAggregatesInput = {
    AND?: AttendanceScalarWhereWithAggregatesInput | AttendanceScalarWhereWithAggregatesInput[]
    OR?: AttendanceScalarWhereWithAggregatesInput[]
    NOT?: AttendanceScalarWhereWithAggregatesInput | AttendanceScalarWhereWithAggregatesInput[]
    id?: IntWithAggregatesFilter<"Attendance"> | number
    employeeId?: IntWithAggregatesFilter<"Attendance"> | number
    date?: DateTimeWithAggregatesFilter<"Attendance"> | Date | string
    checkInTime?: DateTimeNullableWithAggregatesFilter<"Attendance"> | Date | string | null
    checkOutTime?: DateTimeNullableWithAggregatesFilter<"Attendance"> | Date | string | null
  }

  export type EmployeeCreateInput = {
    employeeCode: string
    name: string
    gender?: $Enums.Sex
    birthDate?: Date | string | null
    password: string
    role?: $Enums.Role
    avatar?: string | null
    workInfo?: WorkInfoCreateNestedOneWithoutEmployeeInput
    personalInfo?: PersonalInfoCreateNestedOneWithoutEmployeeInput
    contactInfo?: ContactInfoCreateNestedOneWithoutEmployeeInput
    otherInfo?: OtherInfoCreateNestedOneWithoutEmployeeInput
    LeaveRequest?: LeaveRequestCreateNestedManyWithoutEmployeeInput
    Attendance?: AttendanceCreateNestedManyWithoutEmployeeInput
  }

  export type EmployeeUncheckedCreateInput = {
    id?: number
    employeeCode: string
    name: string
    gender?: $Enums.Sex
    birthDate?: Date | string | null
    password: string
    role?: $Enums.Role
    avatar?: string | null
    workInfo?: WorkInfoUncheckedCreateNestedOneWithoutEmployeeInput
    personalInfo?: PersonalInfoUncheckedCreateNestedOneWithoutEmployeeInput
    contactInfo?: ContactInfoUncheckedCreateNestedOneWithoutEmployeeInput
    otherInfo?: OtherInfoUncheckedCreateNestedOneWithoutEmployeeInput
    LeaveRequest?: LeaveRequestUncheckedCreateNestedManyWithoutEmployeeInput
    Attendance?: AttendanceUncheckedCreateNestedManyWithoutEmployeeInput
  }

  export type EmployeeUpdateInput = {
    employeeCode?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    gender?: EnumSexFieldUpdateOperationsInput | $Enums.Sex
    birthDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    password?: StringFieldUpdateOperationsInput | string
    role?: EnumRoleFieldUpdateOperationsInput | $Enums.Role
    avatar?: NullableStringFieldUpdateOperationsInput | string | null
    workInfo?: WorkInfoUpdateOneWithoutEmployeeNestedInput
    personalInfo?: PersonalInfoUpdateOneWithoutEmployeeNestedInput
    contactInfo?: ContactInfoUpdateOneWithoutEmployeeNestedInput
    otherInfo?: OtherInfoUpdateOneWithoutEmployeeNestedInput
    LeaveRequest?: LeaveRequestUpdateManyWithoutEmployeeNestedInput
    Attendance?: AttendanceUpdateManyWithoutEmployeeNestedInput
  }

  export type EmployeeUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    employeeCode?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    gender?: EnumSexFieldUpdateOperationsInput | $Enums.Sex
    birthDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    password?: StringFieldUpdateOperationsInput | string
    role?: EnumRoleFieldUpdateOperationsInput | $Enums.Role
    avatar?: NullableStringFieldUpdateOperationsInput | string | null
    workInfo?: WorkInfoUncheckedUpdateOneWithoutEmployeeNestedInput
    personalInfo?: PersonalInfoUncheckedUpdateOneWithoutEmployeeNestedInput
    contactInfo?: ContactInfoUncheckedUpdateOneWithoutEmployeeNestedInput
    otherInfo?: OtherInfoUncheckedUpdateOneWithoutEmployeeNestedInput
    LeaveRequest?: LeaveRequestUncheckedUpdateManyWithoutEmployeeNestedInput
    Attendance?: AttendanceUncheckedUpdateManyWithoutEmployeeNestedInput
  }

  export type EmployeeCreateManyInput = {
    id?: number
    employeeCode: string
    name: string
    gender?: $Enums.Sex
    birthDate?: Date | string | null
    password: string
    role?: $Enums.Role
    avatar?: string | null
  }

  export type EmployeeUpdateManyMutationInput = {
    employeeCode?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    gender?: EnumSexFieldUpdateOperationsInput | $Enums.Sex
    birthDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    password?: StringFieldUpdateOperationsInput | string
    role?: EnumRoleFieldUpdateOperationsInput | $Enums.Role
    avatar?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type EmployeeUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number
    employeeCode?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    gender?: EnumSexFieldUpdateOperationsInput | $Enums.Sex
    birthDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    password?: StringFieldUpdateOperationsInput | string
    role?: EnumRoleFieldUpdateOperationsInput | $Enums.Role
    avatar?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type WorkInfoCreateInput = {
    department: string
    position: string
    specialization?: string | null
    joinedTBD?: Date | string | null
    joinedTeSCC?: Date | string | null
    seniorityStart?: Date | string | null
    seniority?: string | null
    contractNumber?: string | null
    contractDate?: Date | string | null
    contractType?: string | null
    contractEndDate?: Date | string | null
    employee: EmployeeCreateNestedOneWithoutWorkInfoInput
  }

  export type WorkInfoUncheckedCreateInput = {
    id?: number
    department: string
    position: string
    specialization?: string | null
    joinedTBD?: Date | string | null
    joinedTeSCC?: Date | string | null
    seniorityStart?: Date | string | null
    seniority?: string | null
    contractNumber?: string | null
    contractDate?: Date | string | null
    contractType?: string | null
    contractEndDate?: Date | string | null
    employeeId: number
  }

  export type WorkInfoUpdateInput = {
    department?: StringFieldUpdateOperationsInput | string
    position?: StringFieldUpdateOperationsInput | string
    specialization?: NullableStringFieldUpdateOperationsInput | string | null
    joinedTBD?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    joinedTeSCC?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    seniorityStart?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    seniority?: NullableStringFieldUpdateOperationsInput | string | null
    contractNumber?: NullableStringFieldUpdateOperationsInput | string | null
    contractDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    contractType?: NullableStringFieldUpdateOperationsInput | string | null
    contractEndDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    employee?: EmployeeUpdateOneRequiredWithoutWorkInfoNestedInput
  }

  export type WorkInfoUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    department?: StringFieldUpdateOperationsInput | string
    position?: StringFieldUpdateOperationsInput | string
    specialization?: NullableStringFieldUpdateOperationsInput | string | null
    joinedTBD?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    joinedTeSCC?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    seniorityStart?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    seniority?: NullableStringFieldUpdateOperationsInput | string | null
    contractNumber?: NullableStringFieldUpdateOperationsInput | string | null
    contractDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    contractType?: NullableStringFieldUpdateOperationsInput | string | null
    contractEndDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    employeeId?: IntFieldUpdateOperationsInput | number
  }

  export type WorkInfoCreateManyInput = {
    id?: number
    department: string
    position: string
    specialization?: string | null
    joinedTBD?: Date | string | null
    joinedTeSCC?: Date | string | null
    seniorityStart?: Date | string | null
    seniority?: string | null
    contractNumber?: string | null
    contractDate?: Date | string | null
    contractType?: string | null
    contractEndDate?: Date | string | null
    employeeId: number
  }

  export type WorkInfoUpdateManyMutationInput = {
    department?: StringFieldUpdateOperationsInput | string
    position?: StringFieldUpdateOperationsInput | string
    specialization?: NullableStringFieldUpdateOperationsInput | string | null
    joinedTBD?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    joinedTeSCC?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    seniorityStart?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    seniority?: NullableStringFieldUpdateOperationsInput | string | null
    contractNumber?: NullableStringFieldUpdateOperationsInput | string | null
    contractDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    contractType?: NullableStringFieldUpdateOperationsInput | string | null
    contractEndDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type WorkInfoUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number
    department?: StringFieldUpdateOperationsInput | string
    position?: StringFieldUpdateOperationsInput | string
    specialization?: NullableStringFieldUpdateOperationsInput | string | null
    joinedTBD?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    joinedTeSCC?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    seniorityStart?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    seniority?: NullableStringFieldUpdateOperationsInput | string | null
    contractNumber?: NullableStringFieldUpdateOperationsInput | string | null
    contractDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    contractType?: NullableStringFieldUpdateOperationsInput | string | null
    contractEndDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    employeeId?: IntFieldUpdateOperationsInput | number
  }

  export type PersonalInfoCreateInput = {
    identityNumber?: string | null
    issueDate?: Date | string | null
    issuePlace?: string | null
    hometown?: string | null
    idAddress?: string | null
    education?: string | null
    drivingLicense?: string | null
    toyotaCertificate?: string | null
    taxCode?: string | null
    insuranceNumber?: string | null
    insuranceSalary?: number | null
    employee: EmployeeCreateNestedOneWithoutPersonalInfoInput
  }

  export type PersonalInfoUncheckedCreateInput = {
    id?: number
    identityNumber?: string | null
    issueDate?: Date | string | null
    issuePlace?: string | null
    hometown?: string | null
    idAddress?: string | null
    education?: string | null
    drivingLicense?: string | null
    toyotaCertificate?: string | null
    taxCode?: string | null
    insuranceNumber?: string | null
    insuranceSalary?: number | null
    employeeId: number
  }

  export type PersonalInfoUpdateInput = {
    identityNumber?: NullableStringFieldUpdateOperationsInput | string | null
    issueDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    issuePlace?: NullableStringFieldUpdateOperationsInput | string | null
    hometown?: NullableStringFieldUpdateOperationsInput | string | null
    idAddress?: NullableStringFieldUpdateOperationsInput | string | null
    education?: NullableStringFieldUpdateOperationsInput | string | null
    drivingLicense?: NullableStringFieldUpdateOperationsInput | string | null
    toyotaCertificate?: NullableStringFieldUpdateOperationsInput | string | null
    taxCode?: NullableStringFieldUpdateOperationsInput | string | null
    insuranceNumber?: NullableStringFieldUpdateOperationsInput | string | null
    insuranceSalary?: NullableIntFieldUpdateOperationsInput | number | null
    employee?: EmployeeUpdateOneRequiredWithoutPersonalInfoNestedInput
  }

  export type PersonalInfoUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    identityNumber?: NullableStringFieldUpdateOperationsInput | string | null
    issueDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    issuePlace?: NullableStringFieldUpdateOperationsInput | string | null
    hometown?: NullableStringFieldUpdateOperationsInput | string | null
    idAddress?: NullableStringFieldUpdateOperationsInput | string | null
    education?: NullableStringFieldUpdateOperationsInput | string | null
    drivingLicense?: NullableStringFieldUpdateOperationsInput | string | null
    toyotaCertificate?: NullableStringFieldUpdateOperationsInput | string | null
    taxCode?: NullableStringFieldUpdateOperationsInput | string | null
    insuranceNumber?: NullableStringFieldUpdateOperationsInput | string | null
    insuranceSalary?: NullableIntFieldUpdateOperationsInput | number | null
    employeeId?: IntFieldUpdateOperationsInput | number
  }

  export type PersonalInfoCreateManyInput = {
    id?: number
    identityNumber?: string | null
    issueDate?: Date | string | null
    issuePlace?: string | null
    hometown?: string | null
    idAddress?: string | null
    education?: string | null
    drivingLicense?: string | null
    toyotaCertificate?: string | null
    taxCode?: string | null
    insuranceNumber?: string | null
    insuranceSalary?: number | null
    employeeId: number
  }

  export type PersonalInfoUpdateManyMutationInput = {
    identityNumber?: NullableStringFieldUpdateOperationsInput | string | null
    issueDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    issuePlace?: NullableStringFieldUpdateOperationsInput | string | null
    hometown?: NullableStringFieldUpdateOperationsInput | string | null
    idAddress?: NullableStringFieldUpdateOperationsInput | string | null
    education?: NullableStringFieldUpdateOperationsInput | string | null
    drivingLicense?: NullableStringFieldUpdateOperationsInput | string | null
    toyotaCertificate?: NullableStringFieldUpdateOperationsInput | string | null
    taxCode?: NullableStringFieldUpdateOperationsInput | string | null
    insuranceNumber?: NullableStringFieldUpdateOperationsInput | string | null
    insuranceSalary?: NullableIntFieldUpdateOperationsInput | number | null
  }

  export type PersonalInfoUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number
    identityNumber?: NullableStringFieldUpdateOperationsInput | string | null
    issueDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    issuePlace?: NullableStringFieldUpdateOperationsInput | string | null
    hometown?: NullableStringFieldUpdateOperationsInput | string | null
    idAddress?: NullableStringFieldUpdateOperationsInput | string | null
    education?: NullableStringFieldUpdateOperationsInput | string | null
    drivingLicense?: NullableStringFieldUpdateOperationsInput | string | null
    toyotaCertificate?: NullableStringFieldUpdateOperationsInput | string | null
    taxCode?: NullableStringFieldUpdateOperationsInput | string | null
    insuranceNumber?: NullableStringFieldUpdateOperationsInput | string | null
    insuranceSalary?: NullableIntFieldUpdateOperationsInput | number | null
    employeeId?: IntFieldUpdateOperationsInput | number
  }

  export type ContactInfoCreateInput = {
    phoneNumber?: string | null
    relativePhone?: string | null
    companyPhone?: string | null
    email?: string | null
    employee: EmployeeCreateNestedOneWithoutContactInfoInput
  }

  export type ContactInfoUncheckedCreateInput = {
    id?: number
    phoneNumber?: string | null
    relativePhone?: string | null
    companyPhone?: string | null
    email?: string | null
    employeeId: number
  }

  export type ContactInfoUpdateInput = {
    phoneNumber?: NullableStringFieldUpdateOperationsInput | string | null
    relativePhone?: NullableStringFieldUpdateOperationsInput | string | null
    companyPhone?: NullableStringFieldUpdateOperationsInput | string | null
    email?: NullableStringFieldUpdateOperationsInput | string | null
    employee?: EmployeeUpdateOneRequiredWithoutContactInfoNestedInput
  }

  export type ContactInfoUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    phoneNumber?: NullableStringFieldUpdateOperationsInput | string | null
    relativePhone?: NullableStringFieldUpdateOperationsInput | string | null
    companyPhone?: NullableStringFieldUpdateOperationsInput | string | null
    email?: NullableStringFieldUpdateOperationsInput | string | null
    employeeId?: IntFieldUpdateOperationsInput | number
  }

  export type ContactInfoCreateManyInput = {
    id?: number
    phoneNumber?: string | null
    relativePhone?: string | null
    companyPhone?: string | null
    email?: string | null
    employeeId: number
  }

  export type ContactInfoUpdateManyMutationInput = {
    phoneNumber?: NullableStringFieldUpdateOperationsInput | string | null
    relativePhone?: NullableStringFieldUpdateOperationsInput | string | null
    companyPhone?: NullableStringFieldUpdateOperationsInput | string | null
    email?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type ContactInfoUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number
    phoneNumber?: NullableStringFieldUpdateOperationsInput | string | null
    relativePhone?: NullableStringFieldUpdateOperationsInput | string | null
    companyPhone?: NullableStringFieldUpdateOperationsInput | string | null
    email?: NullableStringFieldUpdateOperationsInput | string | null
    employeeId?: IntFieldUpdateOperationsInput | number
  }

  export type OtherInfoCreateInput = {
    workStatus?: $Enums.WorkStatus
    resignedDate?: Date | string | null
    documentsChecked?: string | null
    updatedAt?: Date | string | null
    VCB?: string | null
    MTCV?: string | null
    PNJ?: string | null
    employee: EmployeeCreateNestedOneWithoutOtherInfoInput
  }

  export type OtherInfoUncheckedCreateInput = {
    id?: number
    workStatus?: $Enums.WorkStatus
    resignedDate?: Date | string | null
    documentsChecked?: string | null
    updatedAt?: Date | string | null
    VCB?: string | null
    MTCV?: string | null
    PNJ?: string | null
    employeeId: number
  }

  export type OtherInfoUpdateInput = {
    workStatus?: EnumWorkStatusFieldUpdateOperationsInput | $Enums.WorkStatus
    resignedDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    documentsChecked?: NullableStringFieldUpdateOperationsInput | string | null
    updatedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    VCB?: NullableStringFieldUpdateOperationsInput | string | null
    MTCV?: NullableStringFieldUpdateOperationsInput | string | null
    PNJ?: NullableStringFieldUpdateOperationsInput | string | null
    employee?: EmployeeUpdateOneRequiredWithoutOtherInfoNestedInput
  }

  export type OtherInfoUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    workStatus?: EnumWorkStatusFieldUpdateOperationsInput | $Enums.WorkStatus
    resignedDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    documentsChecked?: NullableStringFieldUpdateOperationsInput | string | null
    updatedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    VCB?: NullableStringFieldUpdateOperationsInput | string | null
    MTCV?: NullableStringFieldUpdateOperationsInput | string | null
    PNJ?: NullableStringFieldUpdateOperationsInput | string | null
    employeeId?: IntFieldUpdateOperationsInput | number
  }

  export type OtherInfoCreateManyInput = {
    id?: number
    workStatus?: $Enums.WorkStatus
    resignedDate?: Date | string | null
    documentsChecked?: string | null
    updatedAt?: Date | string | null
    VCB?: string | null
    MTCV?: string | null
    PNJ?: string | null
    employeeId: number
  }

  export type OtherInfoUpdateManyMutationInput = {
    workStatus?: EnumWorkStatusFieldUpdateOperationsInput | $Enums.WorkStatus
    resignedDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    documentsChecked?: NullableStringFieldUpdateOperationsInput | string | null
    updatedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    VCB?: NullableStringFieldUpdateOperationsInput | string | null
    MTCV?: NullableStringFieldUpdateOperationsInput | string | null
    PNJ?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type OtherInfoUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number
    workStatus?: EnumWorkStatusFieldUpdateOperationsInput | $Enums.WorkStatus
    resignedDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    documentsChecked?: NullableStringFieldUpdateOperationsInput | string | null
    updatedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    VCB?: NullableStringFieldUpdateOperationsInput | string | null
    MTCV?: NullableStringFieldUpdateOperationsInput | string | null
    PNJ?: NullableStringFieldUpdateOperationsInput | string | null
    employeeId?: IntFieldUpdateOperationsInput | number
  }

  export type LeaveRequestCreateInput = {
    leaveType: $Enums.LeaveTypeEnum
    startDate: Date | string
    endDate: Date | string
    totalHours?: number | null
    reason?: string | null
    status?: $Enums.LeaveStatus
    approvedBy?: string | null
    approvedAt?: Date | string | null
    createdAt?: Date | string
    employee: EmployeeCreateNestedOneWithoutLeaveRequestInput
  }

  export type LeaveRequestUncheckedCreateInput = {
    id?: number
    employeeId: number
    leaveType: $Enums.LeaveTypeEnum
    startDate: Date | string
    endDate: Date | string
    totalHours?: number | null
    reason?: string | null
    status?: $Enums.LeaveStatus
    approvedBy?: string | null
    approvedAt?: Date | string | null
    createdAt?: Date | string
  }

  export type LeaveRequestUpdateInput = {
    leaveType?: EnumLeaveTypeEnumFieldUpdateOperationsInput | $Enums.LeaveTypeEnum
    startDate?: DateTimeFieldUpdateOperationsInput | Date | string
    endDate?: DateTimeFieldUpdateOperationsInput | Date | string
    totalHours?: NullableFloatFieldUpdateOperationsInput | number | null
    reason?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumLeaveStatusFieldUpdateOperationsInput | $Enums.LeaveStatus
    approvedBy?: NullableStringFieldUpdateOperationsInput | string | null
    approvedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    employee?: EmployeeUpdateOneRequiredWithoutLeaveRequestNestedInput
  }

  export type LeaveRequestUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    employeeId?: IntFieldUpdateOperationsInput | number
    leaveType?: EnumLeaveTypeEnumFieldUpdateOperationsInput | $Enums.LeaveTypeEnum
    startDate?: DateTimeFieldUpdateOperationsInput | Date | string
    endDate?: DateTimeFieldUpdateOperationsInput | Date | string
    totalHours?: NullableFloatFieldUpdateOperationsInput | number | null
    reason?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumLeaveStatusFieldUpdateOperationsInput | $Enums.LeaveStatus
    approvedBy?: NullableStringFieldUpdateOperationsInput | string | null
    approvedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type LeaveRequestCreateManyInput = {
    id?: number
    employeeId: number
    leaveType: $Enums.LeaveTypeEnum
    startDate: Date | string
    endDate: Date | string
    totalHours?: number | null
    reason?: string | null
    status?: $Enums.LeaveStatus
    approvedBy?: string | null
    approvedAt?: Date | string | null
    createdAt?: Date | string
  }

  export type LeaveRequestUpdateManyMutationInput = {
    leaveType?: EnumLeaveTypeEnumFieldUpdateOperationsInput | $Enums.LeaveTypeEnum
    startDate?: DateTimeFieldUpdateOperationsInput | Date | string
    endDate?: DateTimeFieldUpdateOperationsInput | Date | string
    totalHours?: NullableFloatFieldUpdateOperationsInput | number | null
    reason?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumLeaveStatusFieldUpdateOperationsInput | $Enums.LeaveStatus
    approvedBy?: NullableStringFieldUpdateOperationsInput | string | null
    approvedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type LeaveRequestUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number
    employeeId?: IntFieldUpdateOperationsInput | number
    leaveType?: EnumLeaveTypeEnumFieldUpdateOperationsInput | $Enums.LeaveTypeEnum
    startDate?: DateTimeFieldUpdateOperationsInput | Date | string
    endDate?: DateTimeFieldUpdateOperationsInput | Date | string
    totalHours?: NullableFloatFieldUpdateOperationsInput | number | null
    reason?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumLeaveStatusFieldUpdateOperationsInput | $Enums.LeaveStatus
    approvedBy?: NullableStringFieldUpdateOperationsInput | string | null
    approvedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AttendanceCreateInput = {
    date: Date | string
    checkInTime?: Date | string | null
    checkOutTime?: Date | string | null
    employee: EmployeeCreateNestedOneWithoutAttendanceInput
  }

  export type AttendanceUncheckedCreateInput = {
    id?: number
    employeeId: number
    date: Date | string
    checkInTime?: Date | string | null
    checkOutTime?: Date | string | null
  }

  export type AttendanceUpdateInput = {
    date?: DateTimeFieldUpdateOperationsInput | Date | string
    checkInTime?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    checkOutTime?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    employee?: EmployeeUpdateOneRequiredWithoutAttendanceNestedInput
  }

  export type AttendanceUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    employeeId?: IntFieldUpdateOperationsInput | number
    date?: DateTimeFieldUpdateOperationsInput | Date | string
    checkInTime?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    checkOutTime?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type AttendanceCreateManyInput = {
    id?: number
    employeeId: number
    date: Date | string
    checkInTime?: Date | string | null
    checkOutTime?: Date | string | null
  }

  export type AttendanceUpdateManyMutationInput = {
    date?: DateTimeFieldUpdateOperationsInput | Date | string
    checkInTime?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    checkOutTime?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type AttendanceUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number
    employeeId?: IntFieldUpdateOperationsInput | number
    date?: DateTimeFieldUpdateOperationsInput | Date | string
    checkInTime?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    checkOutTime?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
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
    search?: string
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type EnumSexFilter<$PrismaModel = never> = {
    equals?: $Enums.Sex | EnumSexFieldRefInput<$PrismaModel>
    in?: $Enums.Sex[]
    notIn?: $Enums.Sex[]
    not?: NestedEnumSexFilter<$PrismaModel> | $Enums.Sex
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

  export type EnumRoleFilter<$PrismaModel = never> = {
    equals?: $Enums.Role | EnumRoleFieldRefInput<$PrismaModel>
    in?: $Enums.Role[]
    notIn?: $Enums.Role[]
    not?: NestedEnumRoleFilter<$PrismaModel> | $Enums.Role
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
    search?: string
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type WorkInfoNullableScalarRelationFilter = {
    is?: WorkInfoWhereInput | null
    isNot?: WorkInfoWhereInput | null
  }

  export type PersonalInfoNullableScalarRelationFilter = {
    is?: PersonalInfoWhereInput | null
    isNot?: PersonalInfoWhereInput | null
  }

  export type ContactInfoNullableScalarRelationFilter = {
    is?: ContactInfoWhereInput | null
    isNot?: ContactInfoWhereInput | null
  }

  export type OtherInfoNullableScalarRelationFilter = {
    is?: OtherInfoWhereInput | null
    isNot?: OtherInfoWhereInput | null
  }

  export type LeaveRequestListRelationFilter = {
    every?: LeaveRequestWhereInput
    some?: LeaveRequestWhereInput
    none?: LeaveRequestWhereInput
  }

  export type AttendanceListRelationFilter = {
    every?: AttendanceWhereInput
    some?: AttendanceWhereInput
    none?: AttendanceWhereInput
  }

  export type SortOrderInput = {
    sort: SortOrder
    nulls?: NullsOrder
  }

  export type LeaveRequestOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type AttendanceOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type EmployeeOrderByRelevanceInput = {
    fields: EmployeeOrderByRelevanceFieldEnum | EmployeeOrderByRelevanceFieldEnum[]
    sort: SortOrder
    search: string
  }

  export type EmployeeCountOrderByAggregateInput = {
    id?: SortOrder
    employeeCode?: SortOrder
    name?: SortOrder
    gender?: SortOrder
    birthDate?: SortOrder
    password?: SortOrder
    role?: SortOrder
    avatar?: SortOrder
  }

  export type EmployeeAvgOrderByAggregateInput = {
    id?: SortOrder
  }

  export type EmployeeMaxOrderByAggregateInput = {
    id?: SortOrder
    employeeCode?: SortOrder
    name?: SortOrder
    gender?: SortOrder
    birthDate?: SortOrder
    password?: SortOrder
    role?: SortOrder
    avatar?: SortOrder
  }

  export type EmployeeMinOrderByAggregateInput = {
    id?: SortOrder
    employeeCode?: SortOrder
    name?: SortOrder
    gender?: SortOrder
    birthDate?: SortOrder
    password?: SortOrder
    role?: SortOrder
    avatar?: SortOrder
  }

  export type EmployeeSumOrderByAggregateInput = {
    id?: SortOrder
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
    search?: string
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type EnumSexWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.Sex | EnumSexFieldRefInput<$PrismaModel>
    in?: $Enums.Sex[]
    notIn?: $Enums.Sex[]
    not?: NestedEnumSexWithAggregatesFilter<$PrismaModel> | $Enums.Sex
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumSexFilter<$PrismaModel>
    _max?: NestedEnumSexFilter<$PrismaModel>
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

  export type EnumRoleWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.Role | EnumRoleFieldRefInput<$PrismaModel>
    in?: $Enums.Role[]
    notIn?: $Enums.Role[]
    not?: NestedEnumRoleWithAggregatesFilter<$PrismaModel> | $Enums.Role
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumRoleFilter<$PrismaModel>
    _max?: NestedEnumRoleFilter<$PrismaModel>
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
    search?: string
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type EmployeeScalarRelationFilter = {
    is?: EmployeeWhereInput
    isNot?: EmployeeWhereInput
  }

  export type WorkInfoOrderByRelevanceInput = {
    fields: WorkInfoOrderByRelevanceFieldEnum | WorkInfoOrderByRelevanceFieldEnum[]
    sort: SortOrder
    search: string
  }

  export type WorkInfoCountOrderByAggregateInput = {
    id?: SortOrder
    department?: SortOrder
    position?: SortOrder
    specialization?: SortOrder
    joinedTBD?: SortOrder
    joinedTeSCC?: SortOrder
    seniorityStart?: SortOrder
    seniority?: SortOrder
    contractNumber?: SortOrder
    contractDate?: SortOrder
    contractType?: SortOrder
    contractEndDate?: SortOrder
    employeeId?: SortOrder
  }

  export type WorkInfoAvgOrderByAggregateInput = {
    id?: SortOrder
    employeeId?: SortOrder
  }

  export type WorkInfoMaxOrderByAggregateInput = {
    id?: SortOrder
    department?: SortOrder
    position?: SortOrder
    specialization?: SortOrder
    joinedTBD?: SortOrder
    joinedTeSCC?: SortOrder
    seniorityStart?: SortOrder
    seniority?: SortOrder
    contractNumber?: SortOrder
    contractDate?: SortOrder
    contractType?: SortOrder
    contractEndDate?: SortOrder
    employeeId?: SortOrder
  }

  export type WorkInfoMinOrderByAggregateInput = {
    id?: SortOrder
    department?: SortOrder
    position?: SortOrder
    specialization?: SortOrder
    joinedTBD?: SortOrder
    joinedTeSCC?: SortOrder
    seniorityStart?: SortOrder
    seniority?: SortOrder
    contractNumber?: SortOrder
    contractDate?: SortOrder
    contractType?: SortOrder
    contractEndDate?: SortOrder
    employeeId?: SortOrder
  }

  export type WorkInfoSumOrderByAggregateInput = {
    id?: SortOrder
    employeeId?: SortOrder
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

  export type PersonalInfoOrderByRelevanceInput = {
    fields: PersonalInfoOrderByRelevanceFieldEnum | PersonalInfoOrderByRelevanceFieldEnum[]
    sort: SortOrder
    search: string
  }

  export type PersonalInfoCountOrderByAggregateInput = {
    id?: SortOrder
    identityNumber?: SortOrder
    issueDate?: SortOrder
    issuePlace?: SortOrder
    hometown?: SortOrder
    idAddress?: SortOrder
    education?: SortOrder
    drivingLicense?: SortOrder
    toyotaCertificate?: SortOrder
    taxCode?: SortOrder
    insuranceNumber?: SortOrder
    insuranceSalary?: SortOrder
    employeeId?: SortOrder
  }

  export type PersonalInfoAvgOrderByAggregateInput = {
    id?: SortOrder
    insuranceSalary?: SortOrder
    employeeId?: SortOrder
  }

  export type PersonalInfoMaxOrderByAggregateInput = {
    id?: SortOrder
    identityNumber?: SortOrder
    issueDate?: SortOrder
    issuePlace?: SortOrder
    hometown?: SortOrder
    idAddress?: SortOrder
    education?: SortOrder
    drivingLicense?: SortOrder
    toyotaCertificate?: SortOrder
    taxCode?: SortOrder
    insuranceNumber?: SortOrder
    insuranceSalary?: SortOrder
    employeeId?: SortOrder
  }

  export type PersonalInfoMinOrderByAggregateInput = {
    id?: SortOrder
    identityNumber?: SortOrder
    issueDate?: SortOrder
    issuePlace?: SortOrder
    hometown?: SortOrder
    idAddress?: SortOrder
    education?: SortOrder
    drivingLicense?: SortOrder
    toyotaCertificate?: SortOrder
    taxCode?: SortOrder
    insuranceNumber?: SortOrder
    insuranceSalary?: SortOrder
    employeeId?: SortOrder
  }

  export type PersonalInfoSumOrderByAggregateInput = {
    id?: SortOrder
    insuranceSalary?: SortOrder
    employeeId?: SortOrder
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

  export type ContactInfoOrderByRelevanceInput = {
    fields: ContactInfoOrderByRelevanceFieldEnum | ContactInfoOrderByRelevanceFieldEnum[]
    sort: SortOrder
    search: string
  }

  export type ContactInfoCountOrderByAggregateInput = {
    id?: SortOrder
    phoneNumber?: SortOrder
    relativePhone?: SortOrder
    companyPhone?: SortOrder
    email?: SortOrder
    employeeId?: SortOrder
  }

  export type ContactInfoAvgOrderByAggregateInput = {
    id?: SortOrder
    employeeId?: SortOrder
  }

  export type ContactInfoMaxOrderByAggregateInput = {
    id?: SortOrder
    phoneNumber?: SortOrder
    relativePhone?: SortOrder
    companyPhone?: SortOrder
    email?: SortOrder
    employeeId?: SortOrder
  }

  export type ContactInfoMinOrderByAggregateInput = {
    id?: SortOrder
    phoneNumber?: SortOrder
    relativePhone?: SortOrder
    companyPhone?: SortOrder
    email?: SortOrder
    employeeId?: SortOrder
  }

  export type ContactInfoSumOrderByAggregateInput = {
    id?: SortOrder
    employeeId?: SortOrder
  }

  export type EnumWorkStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.WorkStatus | EnumWorkStatusFieldRefInput<$PrismaModel>
    in?: $Enums.WorkStatus[]
    notIn?: $Enums.WorkStatus[]
    not?: NestedEnumWorkStatusFilter<$PrismaModel> | $Enums.WorkStatus
  }

  export type OtherInfoOrderByRelevanceInput = {
    fields: OtherInfoOrderByRelevanceFieldEnum | OtherInfoOrderByRelevanceFieldEnum[]
    sort: SortOrder
    search: string
  }

  export type OtherInfoCountOrderByAggregateInput = {
    id?: SortOrder
    workStatus?: SortOrder
    resignedDate?: SortOrder
    documentsChecked?: SortOrder
    updatedAt?: SortOrder
    VCB?: SortOrder
    MTCV?: SortOrder
    PNJ?: SortOrder
    employeeId?: SortOrder
  }

  export type OtherInfoAvgOrderByAggregateInput = {
    id?: SortOrder
    employeeId?: SortOrder
  }

  export type OtherInfoMaxOrderByAggregateInput = {
    id?: SortOrder
    workStatus?: SortOrder
    resignedDate?: SortOrder
    documentsChecked?: SortOrder
    updatedAt?: SortOrder
    VCB?: SortOrder
    MTCV?: SortOrder
    PNJ?: SortOrder
    employeeId?: SortOrder
  }

  export type OtherInfoMinOrderByAggregateInput = {
    id?: SortOrder
    workStatus?: SortOrder
    resignedDate?: SortOrder
    documentsChecked?: SortOrder
    updatedAt?: SortOrder
    VCB?: SortOrder
    MTCV?: SortOrder
    PNJ?: SortOrder
    employeeId?: SortOrder
  }

  export type OtherInfoSumOrderByAggregateInput = {
    id?: SortOrder
    employeeId?: SortOrder
  }

  export type EnumWorkStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.WorkStatus | EnumWorkStatusFieldRefInput<$PrismaModel>
    in?: $Enums.WorkStatus[]
    notIn?: $Enums.WorkStatus[]
    not?: NestedEnumWorkStatusWithAggregatesFilter<$PrismaModel> | $Enums.WorkStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumWorkStatusFilter<$PrismaModel>
    _max?: NestedEnumWorkStatusFilter<$PrismaModel>
  }

  export type EnumLeaveTypeEnumFilter<$PrismaModel = never> = {
    equals?: $Enums.LeaveTypeEnum | EnumLeaveTypeEnumFieldRefInput<$PrismaModel>
    in?: $Enums.LeaveTypeEnum[]
    notIn?: $Enums.LeaveTypeEnum[]
    not?: NestedEnumLeaveTypeEnumFilter<$PrismaModel> | $Enums.LeaveTypeEnum
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

  export type FloatNullableFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | null
    notIn?: number[] | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableFilter<$PrismaModel> | number | null
  }

  export type EnumLeaveStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.LeaveStatus | EnumLeaveStatusFieldRefInput<$PrismaModel>
    in?: $Enums.LeaveStatus[]
    notIn?: $Enums.LeaveStatus[]
    not?: NestedEnumLeaveStatusFilter<$PrismaModel> | $Enums.LeaveStatus
  }

  export type LeaveRequestOrderByRelevanceInput = {
    fields: LeaveRequestOrderByRelevanceFieldEnum | LeaveRequestOrderByRelevanceFieldEnum[]
    sort: SortOrder
    search: string
  }

  export type LeaveRequestCountOrderByAggregateInput = {
    id?: SortOrder
    employeeId?: SortOrder
    leaveType?: SortOrder
    startDate?: SortOrder
    endDate?: SortOrder
    totalHours?: SortOrder
    reason?: SortOrder
    status?: SortOrder
    approvedBy?: SortOrder
    approvedAt?: SortOrder
    createdAt?: SortOrder
  }

  export type LeaveRequestAvgOrderByAggregateInput = {
    id?: SortOrder
    employeeId?: SortOrder
    totalHours?: SortOrder
  }

  export type LeaveRequestMaxOrderByAggregateInput = {
    id?: SortOrder
    employeeId?: SortOrder
    leaveType?: SortOrder
    startDate?: SortOrder
    endDate?: SortOrder
    totalHours?: SortOrder
    reason?: SortOrder
    status?: SortOrder
    approvedBy?: SortOrder
    approvedAt?: SortOrder
    createdAt?: SortOrder
  }

  export type LeaveRequestMinOrderByAggregateInput = {
    id?: SortOrder
    employeeId?: SortOrder
    leaveType?: SortOrder
    startDate?: SortOrder
    endDate?: SortOrder
    totalHours?: SortOrder
    reason?: SortOrder
    status?: SortOrder
    approvedBy?: SortOrder
    approvedAt?: SortOrder
    createdAt?: SortOrder
  }

  export type LeaveRequestSumOrderByAggregateInput = {
    id?: SortOrder
    employeeId?: SortOrder
    totalHours?: SortOrder
  }

  export type EnumLeaveTypeEnumWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.LeaveTypeEnum | EnumLeaveTypeEnumFieldRefInput<$PrismaModel>
    in?: $Enums.LeaveTypeEnum[]
    notIn?: $Enums.LeaveTypeEnum[]
    not?: NestedEnumLeaveTypeEnumWithAggregatesFilter<$PrismaModel> | $Enums.LeaveTypeEnum
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumLeaveTypeEnumFilter<$PrismaModel>
    _max?: NestedEnumLeaveTypeEnumFilter<$PrismaModel>
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

  export type FloatNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | null
    notIn?: number[] | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedFloatNullableFilter<$PrismaModel>
    _min?: NestedFloatNullableFilter<$PrismaModel>
    _max?: NestedFloatNullableFilter<$PrismaModel>
  }

  export type EnumLeaveStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.LeaveStatus | EnumLeaveStatusFieldRefInput<$PrismaModel>
    in?: $Enums.LeaveStatus[]
    notIn?: $Enums.LeaveStatus[]
    not?: NestedEnumLeaveStatusWithAggregatesFilter<$PrismaModel> | $Enums.LeaveStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumLeaveStatusFilter<$PrismaModel>
    _max?: NestedEnumLeaveStatusFilter<$PrismaModel>
  }

  export type AttendanceCountOrderByAggregateInput = {
    id?: SortOrder
    employeeId?: SortOrder
    date?: SortOrder
    checkInTime?: SortOrder
    checkOutTime?: SortOrder
  }

  export type AttendanceAvgOrderByAggregateInput = {
    id?: SortOrder
    employeeId?: SortOrder
  }

  export type AttendanceMaxOrderByAggregateInput = {
    id?: SortOrder
    employeeId?: SortOrder
    date?: SortOrder
    checkInTime?: SortOrder
    checkOutTime?: SortOrder
  }

  export type AttendanceMinOrderByAggregateInput = {
    id?: SortOrder
    employeeId?: SortOrder
    date?: SortOrder
    checkInTime?: SortOrder
    checkOutTime?: SortOrder
  }

  export type AttendanceSumOrderByAggregateInput = {
    id?: SortOrder
    employeeId?: SortOrder
  }

  export type WorkInfoCreateNestedOneWithoutEmployeeInput = {
    create?: XOR<WorkInfoCreateWithoutEmployeeInput, WorkInfoUncheckedCreateWithoutEmployeeInput>
    connectOrCreate?: WorkInfoCreateOrConnectWithoutEmployeeInput
    connect?: WorkInfoWhereUniqueInput
  }

  export type PersonalInfoCreateNestedOneWithoutEmployeeInput = {
    create?: XOR<PersonalInfoCreateWithoutEmployeeInput, PersonalInfoUncheckedCreateWithoutEmployeeInput>
    connectOrCreate?: PersonalInfoCreateOrConnectWithoutEmployeeInput
    connect?: PersonalInfoWhereUniqueInput
  }

  export type ContactInfoCreateNestedOneWithoutEmployeeInput = {
    create?: XOR<ContactInfoCreateWithoutEmployeeInput, ContactInfoUncheckedCreateWithoutEmployeeInput>
    connectOrCreate?: ContactInfoCreateOrConnectWithoutEmployeeInput
    connect?: ContactInfoWhereUniqueInput
  }

  export type OtherInfoCreateNestedOneWithoutEmployeeInput = {
    create?: XOR<OtherInfoCreateWithoutEmployeeInput, OtherInfoUncheckedCreateWithoutEmployeeInput>
    connectOrCreate?: OtherInfoCreateOrConnectWithoutEmployeeInput
    connect?: OtherInfoWhereUniqueInput
  }

  export type LeaveRequestCreateNestedManyWithoutEmployeeInput = {
    create?: XOR<LeaveRequestCreateWithoutEmployeeInput, LeaveRequestUncheckedCreateWithoutEmployeeInput> | LeaveRequestCreateWithoutEmployeeInput[] | LeaveRequestUncheckedCreateWithoutEmployeeInput[]
    connectOrCreate?: LeaveRequestCreateOrConnectWithoutEmployeeInput | LeaveRequestCreateOrConnectWithoutEmployeeInput[]
    createMany?: LeaveRequestCreateManyEmployeeInputEnvelope
    connect?: LeaveRequestWhereUniqueInput | LeaveRequestWhereUniqueInput[]
  }

  export type AttendanceCreateNestedManyWithoutEmployeeInput = {
    create?: XOR<AttendanceCreateWithoutEmployeeInput, AttendanceUncheckedCreateWithoutEmployeeInput> | AttendanceCreateWithoutEmployeeInput[] | AttendanceUncheckedCreateWithoutEmployeeInput[]
    connectOrCreate?: AttendanceCreateOrConnectWithoutEmployeeInput | AttendanceCreateOrConnectWithoutEmployeeInput[]
    createMany?: AttendanceCreateManyEmployeeInputEnvelope
    connect?: AttendanceWhereUniqueInput | AttendanceWhereUniqueInput[]
  }

  export type WorkInfoUncheckedCreateNestedOneWithoutEmployeeInput = {
    create?: XOR<WorkInfoCreateWithoutEmployeeInput, WorkInfoUncheckedCreateWithoutEmployeeInput>
    connectOrCreate?: WorkInfoCreateOrConnectWithoutEmployeeInput
    connect?: WorkInfoWhereUniqueInput
  }

  export type PersonalInfoUncheckedCreateNestedOneWithoutEmployeeInput = {
    create?: XOR<PersonalInfoCreateWithoutEmployeeInput, PersonalInfoUncheckedCreateWithoutEmployeeInput>
    connectOrCreate?: PersonalInfoCreateOrConnectWithoutEmployeeInput
    connect?: PersonalInfoWhereUniqueInput
  }

  export type ContactInfoUncheckedCreateNestedOneWithoutEmployeeInput = {
    create?: XOR<ContactInfoCreateWithoutEmployeeInput, ContactInfoUncheckedCreateWithoutEmployeeInput>
    connectOrCreate?: ContactInfoCreateOrConnectWithoutEmployeeInput
    connect?: ContactInfoWhereUniqueInput
  }

  export type OtherInfoUncheckedCreateNestedOneWithoutEmployeeInput = {
    create?: XOR<OtherInfoCreateWithoutEmployeeInput, OtherInfoUncheckedCreateWithoutEmployeeInput>
    connectOrCreate?: OtherInfoCreateOrConnectWithoutEmployeeInput
    connect?: OtherInfoWhereUniqueInput
  }

  export type LeaveRequestUncheckedCreateNestedManyWithoutEmployeeInput = {
    create?: XOR<LeaveRequestCreateWithoutEmployeeInput, LeaveRequestUncheckedCreateWithoutEmployeeInput> | LeaveRequestCreateWithoutEmployeeInput[] | LeaveRequestUncheckedCreateWithoutEmployeeInput[]
    connectOrCreate?: LeaveRequestCreateOrConnectWithoutEmployeeInput | LeaveRequestCreateOrConnectWithoutEmployeeInput[]
    createMany?: LeaveRequestCreateManyEmployeeInputEnvelope
    connect?: LeaveRequestWhereUniqueInput | LeaveRequestWhereUniqueInput[]
  }

  export type AttendanceUncheckedCreateNestedManyWithoutEmployeeInput = {
    create?: XOR<AttendanceCreateWithoutEmployeeInput, AttendanceUncheckedCreateWithoutEmployeeInput> | AttendanceCreateWithoutEmployeeInput[] | AttendanceUncheckedCreateWithoutEmployeeInput[]
    connectOrCreate?: AttendanceCreateOrConnectWithoutEmployeeInput | AttendanceCreateOrConnectWithoutEmployeeInput[]
    createMany?: AttendanceCreateManyEmployeeInputEnvelope
    connect?: AttendanceWhereUniqueInput | AttendanceWhereUniqueInput[]
  }

  export type StringFieldUpdateOperationsInput = {
    set?: string
  }

  export type EnumSexFieldUpdateOperationsInput = {
    set?: $Enums.Sex
  }

  export type NullableDateTimeFieldUpdateOperationsInput = {
    set?: Date | string | null
  }

  export type EnumRoleFieldUpdateOperationsInput = {
    set?: $Enums.Role
  }

  export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null
  }

  export type WorkInfoUpdateOneWithoutEmployeeNestedInput = {
    create?: XOR<WorkInfoCreateWithoutEmployeeInput, WorkInfoUncheckedCreateWithoutEmployeeInput>
    connectOrCreate?: WorkInfoCreateOrConnectWithoutEmployeeInput
    upsert?: WorkInfoUpsertWithoutEmployeeInput
    disconnect?: WorkInfoWhereInput | boolean
    delete?: WorkInfoWhereInput | boolean
    connect?: WorkInfoWhereUniqueInput
    update?: XOR<XOR<WorkInfoUpdateToOneWithWhereWithoutEmployeeInput, WorkInfoUpdateWithoutEmployeeInput>, WorkInfoUncheckedUpdateWithoutEmployeeInput>
  }

  export type PersonalInfoUpdateOneWithoutEmployeeNestedInput = {
    create?: XOR<PersonalInfoCreateWithoutEmployeeInput, PersonalInfoUncheckedCreateWithoutEmployeeInput>
    connectOrCreate?: PersonalInfoCreateOrConnectWithoutEmployeeInput
    upsert?: PersonalInfoUpsertWithoutEmployeeInput
    disconnect?: PersonalInfoWhereInput | boolean
    delete?: PersonalInfoWhereInput | boolean
    connect?: PersonalInfoWhereUniqueInput
    update?: XOR<XOR<PersonalInfoUpdateToOneWithWhereWithoutEmployeeInput, PersonalInfoUpdateWithoutEmployeeInput>, PersonalInfoUncheckedUpdateWithoutEmployeeInput>
  }

  export type ContactInfoUpdateOneWithoutEmployeeNestedInput = {
    create?: XOR<ContactInfoCreateWithoutEmployeeInput, ContactInfoUncheckedCreateWithoutEmployeeInput>
    connectOrCreate?: ContactInfoCreateOrConnectWithoutEmployeeInput
    upsert?: ContactInfoUpsertWithoutEmployeeInput
    disconnect?: ContactInfoWhereInput | boolean
    delete?: ContactInfoWhereInput | boolean
    connect?: ContactInfoWhereUniqueInput
    update?: XOR<XOR<ContactInfoUpdateToOneWithWhereWithoutEmployeeInput, ContactInfoUpdateWithoutEmployeeInput>, ContactInfoUncheckedUpdateWithoutEmployeeInput>
  }

  export type OtherInfoUpdateOneWithoutEmployeeNestedInput = {
    create?: XOR<OtherInfoCreateWithoutEmployeeInput, OtherInfoUncheckedCreateWithoutEmployeeInput>
    connectOrCreate?: OtherInfoCreateOrConnectWithoutEmployeeInput
    upsert?: OtherInfoUpsertWithoutEmployeeInput
    disconnect?: OtherInfoWhereInput | boolean
    delete?: OtherInfoWhereInput | boolean
    connect?: OtherInfoWhereUniqueInput
    update?: XOR<XOR<OtherInfoUpdateToOneWithWhereWithoutEmployeeInput, OtherInfoUpdateWithoutEmployeeInput>, OtherInfoUncheckedUpdateWithoutEmployeeInput>
  }

  export type LeaveRequestUpdateManyWithoutEmployeeNestedInput = {
    create?: XOR<LeaveRequestCreateWithoutEmployeeInput, LeaveRequestUncheckedCreateWithoutEmployeeInput> | LeaveRequestCreateWithoutEmployeeInput[] | LeaveRequestUncheckedCreateWithoutEmployeeInput[]
    connectOrCreate?: LeaveRequestCreateOrConnectWithoutEmployeeInput | LeaveRequestCreateOrConnectWithoutEmployeeInput[]
    upsert?: LeaveRequestUpsertWithWhereUniqueWithoutEmployeeInput | LeaveRequestUpsertWithWhereUniqueWithoutEmployeeInput[]
    createMany?: LeaveRequestCreateManyEmployeeInputEnvelope
    set?: LeaveRequestWhereUniqueInput | LeaveRequestWhereUniqueInput[]
    disconnect?: LeaveRequestWhereUniqueInput | LeaveRequestWhereUniqueInput[]
    delete?: LeaveRequestWhereUniqueInput | LeaveRequestWhereUniqueInput[]
    connect?: LeaveRequestWhereUniqueInput | LeaveRequestWhereUniqueInput[]
    update?: LeaveRequestUpdateWithWhereUniqueWithoutEmployeeInput | LeaveRequestUpdateWithWhereUniqueWithoutEmployeeInput[]
    updateMany?: LeaveRequestUpdateManyWithWhereWithoutEmployeeInput | LeaveRequestUpdateManyWithWhereWithoutEmployeeInput[]
    deleteMany?: LeaveRequestScalarWhereInput | LeaveRequestScalarWhereInput[]
  }

  export type AttendanceUpdateManyWithoutEmployeeNestedInput = {
    create?: XOR<AttendanceCreateWithoutEmployeeInput, AttendanceUncheckedCreateWithoutEmployeeInput> | AttendanceCreateWithoutEmployeeInput[] | AttendanceUncheckedCreateWithoutEmployeeInput[]
    connectOrCreate?: AttendanceCreateOrConnectWithoutEmployeeInput | AttendanceCreateOrConnectWithoutEmployeeInput[]
    upsert?: AttendanceUpsertWithWhereUniqueWithoutEmployeeInput | AttendanceUpsertWithWhereUniqueWithoutEmployeeInput[]
    createMany?: AttendanceCreateManyEmployeeInputEnvelope
    set?: AttendanceWhereUniqueInput | AttendanceWhereUniqueInput[]
    disconnect?: AttendanceWhereUniqueInput | AttendanceWhereUniqueInput[]
    delete?: AttendanceWhereUniqueInput | AttendanceWhereUniqueInput[]
    connect?: AttendanceWhereUniqueInput | AttendanceWhereUniqueInput[]
    update?: AttendanceUpdateWithWhereUniqueWithoutEmployeeInput | AttendanceUpdateWithWhereUniqueWithoutEmployeeInput[]
    updateMany?: AttendanceUpdateManyWithWhereWithoutEmployeeInput | AttendanceUpdateManyWithWhereWithoutEmployeeInput[]
    deleteMany?: AttendanceScalarWhereInput | AttendanceScalarWhereInput[]
  }

  export type IntFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type WorkInfoUncheckedUpdateOneWithoutEmployeeNestedInput = {
    create?: XOR<WorkInfoCreateWithoutEmployeeInput, WorkInfoUncheckedCreateWithoutEmployeeInput>
    connectOrCreate?: WorkInfoCreateOrConnectWithoutEmployeeInput
    upsert?: WorkInfoUpsertWithoutEmployeeInput
    disconnect?: WorkInfoWhereInput | boolean
    delete?: WorkInfoWhereInput | boolean
    connect?: WorkInfoWhereUniqueInput
    update?: XOR<XOR<WorkInfoUpdateToOneWithWhereWithoutEmployeeInput, WorkInfoUpdateWithoutEmployeeInput>, WorkInfoUncheckedUpdateWithoutEmployeeInput>
  }

  export type PersonalInfoUncheckedUpdateOneWithoutEmployeeNestedInput = {
    create?: XOR<PersonalInfoCreateWithoutEmployeeInput, PersonalInfoUncheckedCreateWithoutEmployeeInput>
    connectOrCreate?: PersonalInfoCreateOrConnectWithoutEmployeeInput
    upsert?: PersonalInfoUpsertWithoutEmployeeInput
    disconnect?: PersonalInfoWhereInput | boolean
    delete?: PersonalInfoWhereInput | boolean
    connect?: PersonalInfoWhereUniqueInput
    update?: XOR<XOR<PersonalInfoUpdateToOneWithWhereWithoutEmployeeInput, PersonalInfoUpdateWithoutEmployeeInput>, PersonalInfoUncheckedUpdateWithoutEmployeeInput>
  }

  export type ContactInfoUncheckedUpdateOneWithoutEmployeeNestedInput = {
    create?: XOR<ContactInfoCreateWithoutEmployeeInput, ContactInfoUncheckedCreateWithoutEmployeeInput>
    connectOrCreate?: ContactInfoCreateOrConnectWithoutEmployeeInput
    upsert?: ContactInfoUpsertWithoutEmployeeInput
    disconnect?: ContactInfoWhereInput | boolean
    delete?: ContactInfoWhereInput | boolean
    connect?: ContactInfoWhereUniqueInput
    update?: XOR<XOR<ContactInfoUpdateToOneWithWhereWithoutEmployeeInput, ContactInfoUpdateWithoutEmployeeInput>, ContactInfoUncheckedUpdateWithoutEmployeeInput>
  }

  export type OtherInfoUncheckedUpdateOneWithoutEmployeeNestedInput = {
    create?: XOR<OtherInfoCreateWithoutEmployeeInput, OtherInfoUncheckedCreateWithoutEmployeeInput>
    connectOrCreate?: OtherInfoCreateOrConnectWithoutEmployeeInput
    upsert?: OtherInfoUpsertWithoutEmployeeInput
    disconnect?: OtherInfoWhereInput | boolean
    delete?: OtherInfoWhereInput | boolean
    connect?: OtherInfoWhereUniqueInput
    update?: XOR<XOR<OtherInfoUpdateToOneWithWhereWithoutEmployeeInput, OtherInfoUpdateWithoutEmployeeInput>, OtherInfoUncheckedUpdateWithoutEmployeeInput>
  }

  export type LeaveRequestUncheckedUpdateManyWithoutEmployeeNestedInput = {
    create?: XOR<LeaveRequestCreateWithoutEmployeeInput, LeaveRequestUncheckedCreateWithoutEmployeeInput> | LeaveRequestCreateWithoutEmployeeInput[] | LeaveRequestUncheckedCreateWithoutEmployeeInput[]
    connectOrCreate?: LeaveRequestCreateOrConnectWithoutEmployeeInput | LeaveRequestCreateOrConnectWithoutEmployeeInput[]
    upsert?: LeaveRequestUpsertWithWhereUniqueWithoutEmployeeInput | LeaveRequestUpsertWithWhereUniqueWithoutEmployeeInput[]
    createMany?: LeaveRequestCreateManyEmployeeInputEnvelope
    set?: LeaveRequestWhereUniqueInput | LeaveRequestWhereUniqueInput[]
    disconnect?: LeaveRequestWhereUniqueInput | LeaveRequestWhereUniqueInput[]
    delete?: LeaveRequestWhereUniqueInput | LeaveRequestWhereUniqueInput[]
    connect?: LeaveRequestWhereUniqueInput | LeaveRequestWhereUniqueInput[]
    update?: LeaveRequestUpdateWithWhereUniqueWithoutEmployeeInput | LeaveRequestUpdateWithWhereUniqueWithoutEmployeeInput[]
    updateMany?: LeaveRequestUpdateManyWithWhereWithoutEmployeeInput | LeaveRequestUpdateManyWithWhereWithoutEmployeeInput[]
    deleteMany?: LeaveRequestScalarWhereInput | LeaveRequestScalarWhereInput[]
  }

  export type AttendanceUncheckedUpdateManyWithoutEmployeeNestedInput = {
    create?: XOR<AttendanceCreateWithoutEmployeeInput, AttendanceUncheckedCreateWithoutEmployeeInput> | AttendanceCreateWithoutEmployeeInput[] | AttendanceUncheckedCreateWithoutEmployeeInput[]
    connectOrCreate?: AttendanceCreateOrConnectWithoutEmployeeInput | AttendanceCreateOrConnectWithoutEmployeeInput[]
    upsert?: AttendanceUpsertWithWhereUniqueWithoutEmployeeInput | AttendanceUpsertWithWhereUniqueWithoutEmployeeInput[]
    createMany?: AttendanceCreateManyEmployeeInputEnvelope
    set?: AttendanceWhereUniqueInput | AttendanceWhereUniqueInput[]
    disconnect?: AttendanceWhereUniqueInput | AttendanceWhereUniqueInput[]
    delete?: AttendanceWhereUniqueInput | AttendanceWhereUniqueInput[]
    connect?: AttendanceWhereUniqueInput | AttendanceWhereUniqueInput[]
    update?: AttendanceUpdateWithWhereUniqueWithoutEmployeeInput | AttendanceUpdateWithWhereUniqueWithoutEmployeeInput[]
    updateMany?: AttendanceUpdateManyWithWhereWithoutEmployeeInput | AttendanceUpdateManyWithWhereWithoutEmployeeInput[]
    deleteMany?: AttendanceScalarWhereInput | AttendanceScalarWhereInput[]
  }

  export type EmployeeCreateNestedOneWithoutWorkInfoInput = {
    create?: XOR<EmployeeCreateWithoutWorkInfoInput, EmployeeUncheckedCreateWithoutWorkInfoInput>
    connectOrCreate?: EmployeeCreateOrConnectWithoutWorkInfoInput
    connect?: EmployeeWhereUniqueInput
  }

  export type EmployeeUpdateOneRequiredWithoutWorkInfoNestedInput = {
    create?: XOR<EmployeeCreateWithoutWorkInfoInput, EmployeeUncheckedCreateWithoutWorkInfoInput>
    connectOrCreate?: EmployeeCreateOrConnectWithoutWorkInfoInput
    upsert?: EmployeeUpsertWithoutWorkInfoInput
    connect?: EmployeeWhereUniqueInput
    update?: XOR<XOR<EmployeeUpdateToOneWithWhereWithoutWorkInfoInput, EmployeeUpdateWithoutWorkInfoInput>, EmployeeUncheckedUpdateWithoutWorkInfoInput>
  }

  export type EmployeeCreateNestedOneWithoutPersonalInfoInput = {
    create?: XOR<EmployeeCreateWithoutPersonalInfoInput, EmployeeUncheckedCreateWithoutPersonalInfoInput>
    connectOrCreate?: EmployeeCreateOrConnectWithoutPersonalInfoInput
    connect?: EmployeeWhereUniqueInput
  }

  export type NullableIntFieldUpdateOperationsInput = {
    set?: number | null
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type EmployeeUpdateOneRequiredWithoutPersonalInfoNestedInput = {
    create?: XOR<EmployeeCreateWithoutPersonalInfoInput, EmployeeUncheckedCreateWithoutPersonalInfoInput>
    connectOrCreate?: EmployeeCreateOrConnectWithoutPersonalInfoInput
    upsert?: EmployeeUpsertWithoutPersonalInfoInput
    connect?: EmployeeWhereUniqueInput
    update?: XOR<XOR<EmployeeUpdateToOneWithWhereWithoutPersonalInfoInput, EmployeeUpdateWithoutPersonalInfoInput>, EmployeeUncheckedUpdateWithoutPersonalInfoInput>
  }

  export type EmployeeCreateNestedOneWithoutContactInfoInput = {
    create?: XOR<EmployeeCreateWithoutContactInfoInput, EmployeeUncheckedCreateWithoutContactInfoInput>
    connectOrCreate?: EmployeeCreateOrConnectWithoutContactInfoInput
    connect?: EmployeeWhereUniqueInput
  }

  export type EmployeeUpdateOneRequiredWithoutContactInfoNestedInput = {
    create?: XOR<EmployeeCreateWithoutContactInfoInput, EmployeeUncheckedCreateWithoutContactInfoInput>
    connectOrCreate?: EmployeeCreateOrConnectWithoutContactInfoInput
    upsert?: EmployeeUpsertWithoutContactInfoInput
    connect?: EmployeeWhereUniqueInput
    update?: XOR<XOR<EmployeeUpdateToOneWithWhereWithoutContactInfoInput, EmployeeUpdateWithoutContactInfoInput>, EmployeeUncheckedUpdateWithoutContactInfoInput>
  }

  export type EmployeeCreateNestedOneWithoutOtherInfoInput = {
    create?: XOR<EmployeeCreateWithoutOtherInfoInput, EmployeeUncheckedCreateWithoutOtherInfoInput>
    connectOrCreate?: EmployeeCreateOrConnectWithoutOtherInfoInput
    connect?: EmployeeWhereUniqueInput
  }

  export type EnumWorkStatusFieldUpdateOperationsInput = {
    set?: $Enums.WorkStatus
  }

  export type EmployeeUpdateOneRequiredWithoutOtherInfoNestedInput = {
    create?: XOR<EmployeeCreateWithoutOtherInfoInput, EmployeeUncheckedCreateWithoutOtherInfoInput>
    connectOrCreate?: EmployeeCreateOrConnectWithoutOtherInfoInput
    upsert?: EmployeeUpsertWithoutOtherInfoInput
    connect?: EmployeeWhereUniqueInput
    update?: XOR<XOR<EmployeeUpdateToOneWithWhereWithoutOtherInfoInput, EmployeeUpdateWithoutOtherInfoInput>, EmployeeUncheckedUpdateWithoutOtherInfoInput>
  }

  export type EmployeeCreateNestedOneWithoutLeaveRequestInput = {
    create?: XOR<EmployeeCreateWithoutLeaveRequestInput, EmployeeUncheckedCreateWithoutLeaveRequestInput>
    connectOrCreate?: EmployeeCreateOrConnectWithoutLeaveRequestInput
    connect?: EmployeeWhereUniqueInput
  }

  export type EnumLeaveTypeEnumFieldUpdateOperationsInput = {
    set?: $Enums.LeaveTypeEnum
  }

  export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string
  }

  export type NullableFloatFieldUpdateOperationsInput = {
    set?: number | null
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type EnumLeaveStatusFieldUpdateOperationsInput = {
    set?: $Enums.LeaveStatus
  }

  export type EmployeeUpdateOneRequiredWithoutLeaveRequestNestedInput = {
    create?: XOR<EmployeeCreateWithoutLeaveRequestInput, EmployeeUncheckedCreateWithoutLeaveRequestInput>
    connectOrCreate?: EmployeeCreateOrConnectWithoutLeaveRequestInput
    upsert?: EmployeeUpsertWithoutLeaveRequestInput
    connect?: EmployeeWhereUniqueInput
    update?: XOR<XOR<EmployeeUpdateToOneWithWhereWithoutLeaveRequestInput, EmployeeUpdateWithoutLeaveRequestInput>, EmployeeUncheckedUpdateWithoutLeaveRequestInput>
  }

  export type EmployeeCreateNestedOneWithoutAttendanceInput = {
    create?: XOR<EmployeeCreateWithoutAttendanceInput, EmployeeUncheckedCreateWithoutAttendanceInput>
    connectOrCreate?: EmployeeCreateOrConnectWithoutAttendanceInput
    connect?: EmployeeWhereUniqueInput
  }

  export type EmployeeUpdateOneRequiredWithoutAttendanceNestedInput = {
    create?: XOR<EmployeeCreateWithoutAttendanceInput, EmployeeUncheckedCreateWithoutAttendanceInput>
    connectOrCreate?: EmployeeCreateOrConnectWithoutAttendanceInput
    upsert?: EmployeeUpsertWithoutAttendanceInput
    connect?: EmployeeWhereUniqueInput
    update?: XOR<XOR<EmployeeUpdateToOneWithWhereWithoutAttendanceInput, EmployeeUpdateWithoutAttendanceInput>, EmployeeUncheckedUpdateWithoutAttendanceInput>
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
    search?: string
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type NestedEnumSexFilter<$PrismaModel = never> = {
    equals?: $Enums.Sex | EnumSexFieldRefInput<$PrismaModel>
    in?: $Enums.Sex[]
    notIn?: $Enums.Sex[]
    not?: NestedEnumSexFilter<$PrismaModel> | $Enums.Sex
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

  export type NestedEnumRoleFilter<$PrismaModel = never> = {
    equals?: $Enums.Role | EnumRoleFieldRefInput<$PrismaModel>
    in?: $Enums.Role[]
    notIn?: $Enums.Role[]
    not?: NestedEnumRoleFilter<$PrismaModel> | $Enums.Role
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
    search?: string
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
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
    search?: string
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type NestedEnumSexWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.Sex | EnumSexFieldRefInput<$PrismaModel>
    in?: $Enums.Sex[]
    notIn?: $Enums.Sex[]
    not?: NestedEnumSexWithAggregatesFilter<$PrismaModel> | $Enums.Sex
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumSexFilter<$PrismaModel>
    _max?: NestedEnumSexFilter<$PrismaModel>
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

  export type NestedEnumRoleWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.Role | EnumRoleFieldRefInput<$PrismaModel>
    in?: $Enums.Role[]
    notIn?: $Enums.Role[]
    not?: NestedEnumRoleWithAggregatesFilter<$PrismaModel> | $Enums.Role
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumRoleFilter<$PrismaModel>
    _max?: NestedEnumRoleFilter<$PrismaModel>
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
    search?: string
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
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

  export type NestedEnumWorkStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.WorkStatus | EnumWorkStatusFieldRefInput<$PrismaModel>
    in?: $Enums.WorkStatus[]
    notIn?: $Enums.WorkStatus[]
    not?: NestedEnumWorkStatusFilter<$PrismaModel> | $Enums.WorkStatus
  }

  export type NestedEnumWorkStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.WorkStatus | EnumWorkStatusFieldRefInput<$PrismaModel>
    in?: $Enums.WorkStatus[]
    notIn?: $Enums.WorkStatus[]
    not?: NestedEnumWorkStatusWithAggregatesFilter<$PrismaModel> | $Enums.WorkStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumWorkStatusFilter<$PrismaModel>
    _max?: NestedEnumWorkStatusFilter<$PrismaModel>
  }

  export type NestedEnumLeaveTypeEnumFilter<$PrismaModel = never> = {
    equals?: $Enums.LeaveTypeEnum | EnumLeaveTypeEnumFieldRefInput<$PrismaModel>
    in?: $Enums.LeaveTypeEnum[]
    notIn?: $Enums.LeaveTypeEnum[]
    not?: NestedEnumLeaveTypeEnumFilter<$PrismaModel> | $Enums.LeaveTypeEnum
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

  export type NestedEnumLeaveStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.LeaveStatus | EnumLeaveStatusFieldRefInput<$PrismaModel>
    in?: $Enums.LeaveStatus[]
    notIn?: $Enums.LeaveStatus[]
    not?: NestedEnumLeaveStatusFilter<$PrismaModel> | $Enums.LeaveStatus
  }

  export type NestedEnumLeaveTypeEnumWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.LeaveTypeEnum | EnumLeaveTypeEnumFieldRefInput<$PrismaModel>
    in?: $Enums.LeaveTypeEnum[]
    notIn?: $Enums.LeaveTypeEnum[]
    not?: NestedEnumLeaveTypeEnumWithAggregatesFilter<$PrismaModel> | $Enums.LeaveTypeEnum
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumLeaveTypeEnumFilter<$PrismaModel>
    _max?: NestedEnumLeaveTypeEnumFilter<$PrismaModel>
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

  export type NestedFloatNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | null
    notIn?: number[] | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedFloatNullableFilter<$PrismaModel>
    _min?: NestedFloatNullableFilter<$PrismaModel>
    _max?: NestedFloatNullableFilter<$PrismaModel>
  }

  export type NestedEnumLeaveStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.LeaveStatus | EnumLeaveStatusFieldRefInput<$PrismaModel>
    in?: $Enums.LeaveStatus[]
    notIn?: $Enums.LeaveStatus[]
    not?: NestedEnumLeaveStatusWithAggregatesFilter<$PrismaModel> | $Enums.LeaveStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumLeaveStatusFilter<$PrismaModel>
    _max?: NestedEnumLeaveStatusFilter<$PrismaModel>
  }

  export type WorkInfoCreateWithoutEmployeeInput = {
    department: string
    position: string
    specialization?: string | null
    joinedTBD?: Date | string | null
    joinedTeSCC?: Date | string | null
    seniorityStart?: Date | string | null
    seniority?: string | null
    contractNumber?: string | null
    contractDate?: Date | string | null
    contractType?: string | null
    contractEndDate?: Date | string | null
  }

  export type WorkInfoUncheckedCreateWithoutEmployeeInput = {
    id?: number
    department: string
    position: string
    specialization?: string | null
    joinedTBD?: Date | string | null
    joinedTeSCC?: Date | string | null
    seniorityStart?: Date | string | null
    seniority?: string | null
    contractNumber?: string | null
    contractDate?: Date | string | null
    contractType?: string | null
    contractEndDate?: Date | string | null
  }

  export type WorkInfoCreateOrConnectWithoutEmployeeInput = {
    where: WorkInfoWhereUniqueInput
    create: XOR<WorkInfoCreateWithoutEmployeeInput, WorkInfoUncheckedCreateWithoutEmployeeInput>
  }

  export type PersonalInfoCreateWithoutEmployeeInput = {
    identityNumber?: string | null
    issueDate?: Date | string | null
    issuePlace?: string | null
    hometown?: string | null
    idAddress?: string | null
    education?: string | null
    drivingLicense?: string | null
    toyotaCertificate?: string | null
    taxCode?: string | null
    insuranceNumber?: string | null
    insuranceSalary?: number | null
  }

  export type PersonalInfoUncheckedCreateWithoutEmployeeInput = {
    id?: number
    identityNumber?: string | null
    issueDate?: Date | string | null
    issuePlace?: string | null
    hometown?: string | null
    idAddress?: string | null
    education?: string | null
    drivingLicense?: string | null
    toyotaCertificate?: string | null
    taxCode?: string | null
    insuranceNumber?: string | null
    insuranceSalary?: number | null
  }

  export type PersonalInfoCreateOrConnectWithoutEmployeeInput = {
    where: PersonalInfoWhereUniqueInput
    create: XOR<PersonalInfoCreateWithoutEmployeeInput, PersonalInfoUncheckedCreateWithoutEmployeeInput>
  }

  export type ContactInfoCreateWithoutEmployeeInput = {
    phoneNumber?: string | null
    relativePhone?: string | null
    companyPhone?: string | null
    email?: string | null
  }

  export type ContactInfoUncheckedCreateWithoutEmployeeInput = {
    id?: number
    phoneNumber?: string | null
    relativePhone?: string | null
    companyPhone?: string | null
    email?: string | null
  }

  export type ContactInfoCreateOrConnectWithoutEmployeeInput = {
    where: ContactInfoWhereUniqueInput
    create: XOR<ContactInfoCreateWithoutEmployeeInput, ContactInfoUncheckedCreateWithoutEmployeeInput>
  }

  export type OtherInfoCreateWithoutEmployeeInput = {
    workStatus?: $Enums.WorkStatus
    resignedDate?: Date | string | null
    documentsChecked?: string | null
    updatedAt?: Date | string | null
    VCB?: string | null
    MTCV?: string | null
    PNJ?: string | null
  }

  export type OtherInfoUncheckedCreateWithoutEmployeeInput = {
    id?: number
    workStatus?: $Enums.WorkStatus
    resignedDate?: Date | string | null
    documentsChecked?: string | null
    updatedAt?: Date | string | null
    VCB?: string | null
    MTCV?: string | null
    PNJ?: string | null
  }

  export type OtherInfoCreateOrConnectWithoutEmployeeInput = {
    where: OtherInfoWhereUniqueInput
    create: XOR<OtherInfoCreateWithoutEmployeeInput, OtherInfoUncheckedCreateWithoutEmployeeInput>
  }

  export type LeaveRequestCreateWithoutEmployeeInput = {
    leaveType: $Enums.LeaveTypeEnum
    startDate: Date | string
    endDate: Date | string
    totalHours?: number | null
    reason?: string | null
    status?: $Enums.LeaveStatus
    approvedBy?: string | null
    approvedAt?: Date | string | null
    createdAt?: Date | string
  }

  export type LeaveRequestUncheckedCreateWithoutEmployeeInput = {
    id?: number
    leaveType: $Enums.LeaveTypeEnum
    startDate: Date | string
    endDate: Date | string
    totalHours?: number | null
    reason?: string | null
    status?: $Enums.LeaveStatus
    approvedBy?: string | null
    approvedAt?: Date | string | null
    createdAt?: Date | string
  }

  export type LeaveRequestCreateOrConnectWithoutEmployeeInput = {
    where: LeaveRequestWhereUniqueInput
    create: XOR<LeaveRequestCreateWithoutEmployeeInput, LeaveRequestUncheckedCreateWithoutEmployeeInput>
  }

  export type LeaveRequestCreateManyEmployeeInputEnvelope = {
    data: LeaveRequestCreateManyEmployeeInput | LeaveRequestCreateManyEmployeeInput[]
    skipDuplicates?: boolean
  }

  export type AttendanceCreateWithoutEmployeeInput = {
    date: Date | string
    checkInTime?: Date | string | null
    checkOutTime?: Date | string | null
  }

  export type AttendanceUncheckedCreateWithoutEmployeeInput = {
    id?: number
    date: Date | string
    checkInTime?: Date | string | null
    checkOutTime?: Date | string | null
  }

  export type AttendanceCreateOrConnectWithoutEmployeeInput = {
    where: AttendanceWhereUniqueInput
    create: XOR<AttendanceCreateWithoutEmployeeInput, AttendanceUncheckedCreateWithoutEmployeeInput>
  }

  export type AttendanceCreateManyEmployeeInputEnvelope = {
    data: AttendanceCreateManyEmployeeInput | AttendanceCreateManyEmployeeInput[]
    skipDuplicates?: boolean
  }

  export type WorkInfoUpsertWithoutEmployeeInput = {
    update: XOR<WorkInfoUpdateWithoutEmployeeInput, WorkInfoUncheckedUpdateWithoutEmployeeInput>
    create: XOR<WorkInfoCreateWithoutEmployeeInput, WorkInfoUncheckedCreateWithoutEmployeeInput>
    where?: WorkInfoWhereInput
  }

  export type WorkInfoUpdateToOneWithWhereWithoutEmployeeInput = {
    where?: WorkInfoWhereInput
    data: XOR<WorkInfoUpdateWithoutEmployeeInput, WorkInfoUncheckedUpdateWithoutEmployeeInput>
  }

  export type WorkInfoUpdateWithoutEmployeeInput = {
    department?: StringFieldUpdateOperationsInput | string
    position?: StringFieldUpdateOperationsInput | string
    specialization?: NullableStringFieldUpdateOperationsInput | string | null
    joinedTBD?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    joinedTeSCC?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    seniorityStart?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    seniority?: NullableStringFieldUpdateOperationsInput | string | null
    contractNumber?: NullableStringFieldUpdateOperationsInput | string | null
    contractDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    contractType?: NullableStringFieldUpdateOperationsInput | string | null
    contractEndDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type WorkInfoUncheckedUpdateWithoutEmployeeInput = {
    id?: IntFieldUpdateOperationsInput | number
    department?: StringFieldUpdateOperationsInput | string
    position?: StringFieldUpdateOperationsInput | string
    specialization?: NullableStringFieldUpdateOperationsInput | string | null
    joinedTBD?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    joinedTeSCC?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    seniorityStart?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    seniority?: NullableStringFieldUpdateOperationsInput | string | null
    contractNumber?: NullableStringFieldUpdateOperationsInput | string | null
    contractDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    contractType?: NullableStringFieldUpdateOperationsInput | string | null
    contractEndDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type PersonalInfoUpsertWithoutEmployeeInput = {
    update: XOR<PersonalInfoUpdateWithoutEmployeeInput, PersonalInfoUncheckedUpdateWithoutEmployeeInput>
    create: XOR<PersonalInfoCreateWithoutEmployeeInput, PersonalInfoUncheckedCreateWithoutEmployeeInput>
    where?: PersonalInfoWhereInput
  }

  export type PersonalInfoUpdateToOneWithWhereWithoutEmployeeInput = {
    where?: PersonalInfoWhereInput
    data: XOR<PersonalInfoUpdateWithoutEmployeeInput, PersonalInfoUncheckedUpdateWithoutEmployeeInput>
  }

  export type PersonalInfoUpdateWithoutEmployeeInput = {
    identityNumber?: NullableStringFieldUpdateOperationsInput | string | null
    issueDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    issuePlace?: NullableStringFieldUpdateOperationsInput | string | null
    hometown?: NullableStringFieldUpdateOperationsInput | string | null
    idAddress?: NullableStringFieldUpdateOperationsInput | string | null
    education?: NullableStringFieldUpdateOperationsInput | string | null
    drivingLicense?: NullableStringFieldUpdateOperationsInput | string | null
    toyotaCertificate?: NullableStringFieldUpdateOperationsInput | string | null
    taxCode?: NullableStringFieldUpdateOperationsInput | string | null
    insuranceNumber?: NullableStringFieldUpdateOperationsInput | string | null
    insuranceSalary?: NullableIntFieldUpdateOperationsInput | number | null
  }

  export type PersonalInfoUncheckedUpdateWithoutEmployeeInput = {
    id?: IntFieldUpdateOperationsInput | number
    identityNumber?: NullableStringFieldUpdateOperationsInput | string | null
    issueDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    issuePlace?: NullableStringFieldUpdateOperationsInput | string | null
    hometown?: NullableStringFieldUpdateOperationsInput | string | null
    idAddress?: NullableStringFieldUpdateOperationsInput | string | null
    education?: NullableStringFieldUpdateOperationsInput | string | null
    drivingLicense?: NullableStringFieldUpdateOperationsInput | string | null
    toyotaCertificate?: NullableStringFieldUpdateOperationsInput | string | null
    taxCode?: NullableStringFieldUpdateOperationsInput | string | null
    insuranceNumber?: NullableStringFieldUpdateOperationsInput | string | null
    insuranceSalary?: NullableIntFieldUpdateOperationsInput | number | null
  }

  export type ContactInfoUpsertWithoutEmployeeInput = {
    update: XOR<ContactInfoUpdateWithoutEmployeeInput, ContactInfoUncheckedUpdateWithoutEmployeeInput>
    create: XOR<ContactInfoCreateWithoutEmployeeInput, ContactInfoUncheckedCreateWithoutEmployeeInput>
    where?: ContactInfoWhereInput
  }

  export type ContactInfoUpdateToOneWithWhereWithoutEmployeeInput = {
    where?: ContactInfoWhereInput
    data: XOR<ContactInfoUpdateWithoutEmployeeInput, ContactInfoUncheckedUpdateWithoutEmployeeInput>
  }

  export type ContactInfoUpdateWithoutEmployeeInput = {
    phoneNumber?: NullableStringFieldUpdateOperationsInput | string | null
    relativePhone?: NullableStringFieldUpdateOperationsInput | string | null
    companyPhone?: NullableStringFieldUpdateOperationsInput | string | null
    email?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type ContactInfoUncheckedUpdateWithoutEmployeeInput = {
    id?: IntFieldUpdateOperationsInput | number
    phoneNumber?: NullableStringFieldUpdateOperationsInput | string | null
    relativePhone?: NullableStringFieldUpdateOperationsInput | string | null
    companyPhone?: NullableStringFieldUpdateOperationsInput | string | null
    email?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type OtherInfoUpsertWithoutEmployeeInput = {
    update: XOR<OtherInfoUpdateWithoutEmployeeInput, OtherInfoUncheckedUpdateWithoutEmployeeInput>
    create: XOR<OtherInfoCreateWithoutEmployeeInput, OtherInfoUncheckedCreateWithoutEmployeeInput>
    where?: OtherInfoWhereInput
  }

  export type OtherInfoUpdateToOneWithWhereWithoutEmployeeInput = {
    where?: OtherInfoWhereInput
    data: XOR<OtherInfoUpdateWithoutEmployeeInput, OtherInfoUncheckedUpdateWithoutEmployeeInput>
  }

  export type OtherInfoUpdateWithoutEmployeeInput = {
    workStatus?: EnumWorkStatusFieldUpdateOperationsInput | $Enums.WorkStatus
    resignedDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    documentsChecked?: NullableStringFieldUpdateOperationsInput | string | null
    updatedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    VCB?: NullableStringFieldUpdateOperationsInput | string | null
    MTCV?: NullableStringFieldUpdateOperationsInput | string | null
    PNJ?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type OtherInfoUncheckedUpdateWithoutEmployeeInput = {
    id?: IntFieldUpdateOperationsInput | number
    workStatus?: EnumWorkStatusFieldUpdateOperationsInput | $Enums.WorkStatus
    resignedDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    documentsChecked?: NullableStringFieldUpdateOperationsInput | string | null
    updatedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    VCB?: NullableStringFieldUpdateOperationsInput | string | null
    MTCV?: NullableStringFieldUpdateOperationsInput | string | null
    PNJ?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type LeaveRequestUpsertWithWhereUniqueWithoutEmployeeInput = {
    where: LeaveRequestWhereUniqueInput
    update: XOR<LeaveRequestUpdateWithoutEmployeeInput, LeaveRequestUncheckedUpdateWithoutEmployeeInput>
    create: XOR<LeaveRequestCreateWithoutEmployeeInput, LeaveRequestUncheckedCreateWithoutEmployeeInput>
  }

  export type LeaveRequestUpdateWithWhereUniqueWithoutEmployeeInput = {
    where: LeaveRequestWhereUniqueInput
    data: XOR<LeaveRequestUpdateWithoutEmployeeInput, LeaveRequestUncheckedUpdateWithoutEmployeeInput>
  }

  export type LeaveRequestUpdateManyWithWhereWithoutEmployeeInput = {
    where: LeaveRequestScalarWhereInput
    data: XOR<LeaveRequestUpdateManyMutationInput, LeaveRequestUncheckedUpdateManyWithoutEmployeeInput>
  }

  export type LeaveRequestScalarWhereInput = {
    AND?: LeaveRequestScalarWhereInput | LeaveRequestScalarWhereInput[]
    OR?: LeaveRequestScalarWhereInput[]
    NOT?: LeaveRequestScalarWhereInput | LeaveRequestScalarWhereInput[]
    id?: IntFilter<"LeaveRequest"> | number
    employeeId?: IntFilter<"LeaveRequest"> | number
    leaveType?: EnumLeaveTypeEnumFilter<"LeaveRequest"> | $Enums.LeaveTypeEnum
    startDate?: DateTimeFilter<"LeaveRequest"> | Date | string
    endDate?: DateTimeFilter<"LeaveRequest"> | Date | string
    totalHours?: FloatNullableFilter<"LeaveRequest"> | number | null
    reason?: StringNullableFilter<"LeaveRequest"> | string | null
    status?: EnumLeaveStatusFilter<"LeaveRequest"> | $Enums.LeaveStatus
    approvedBy?: StringNullableFilter<"LeaveRequest"> | string | null
    approvedAt?: DateTimeNullableFilter<"LeaveRequest"> | Date | string | null
    createdAt?: DateTimeFilter<"LeaveRequest"> | Date | string
  }

  export type AttendanceUpsertWithWhereUniqueWithoutEmployeeInput = {
    where: AttendanceWhereUniqueInput
    update: XOR<AttendanceUpdateWithoutEmployeeInput, AttendanceUncheckedUpdateWithoutEmployeeInput>
    create: XOR<AttendanceCreateWithoutEmployeeInput, AttendanceUncheckedCreateWithoutEmployeeInput>
  }

  export type AttendanceUpdateWithWhereUniqueWithoutEmployeeInput = {
    where: AttendanceWhereUniqueInput
    data: XOR<AttendanceUpdateWithoutEmployeeInput, AttendanceUncheckedUpdateWithoutEmployeeInput>
  }

  export type AttendanceUpdateManyWithWhereWithoutEmployeeInput = {
    where: AttendanceScalarWhereInput
    data: XOR<AttendanceUpdateManyMutationInput, AttendanceUncheckedUpdateManyWithoutEmployeeInput>
  }

  export type AttendanceScalarWhereInput = {
    AND?: AttendanceScalarWhereInput | AttendanceScalarWhereInput[]
    OR?: AttendanceScalarWhereInput[]
    NOT?: AttendanceScalarWhereInput | AttendanceScalarWhereInput[]
    id?: IntFilter<"Attendance"> | number
    employeeId?: IntFilter<"Attendance"> | number
    date?: DateTimeFilter<"Attendance"> | Date | string
    checkInTime?: DateTimeNullableFilter<"Attendance"> | Date | string | null
    checkOutTime?: DateTimeNullableFilter<"Attendance"> | Date | string | null
  }

  export type EmployeeCreateWithoutWorkInfoInput = {
    employeeCode: string
    name: string
    gender?: $Enums.Sex
    birthDate?: Date | string | null
    password: string
    role?: $Enums.Role
    avatar?: string | null
    personalInfo?: PersonalInfoCreateNestedOneWithoutEmployeeInput
    contactInfo?: ContactInfoCreateNestedOneWithoutEmployeeInput
    otherInfo?: OtherInfoCreateNestedOneWithoutEmployeeInput
    LeaveRequest?: LeaveRequestCreateNestedManyWithoutEmployeeInput
    Attendance?: AttendanceCreateNestedManyWithoutEmployeeInput
  }

  export type EmployeeUncheckedCreateWithoutWorkInfoInput = {
    id?: number
    employeeCode: string
    name: string
    gender?: $Enums.Sex
    birthDate?: Date | string | null
    password: string
    role?: $Enums.Role
    avatar?: string | null
    personalInfo?: PersonalInfoUncheckedCreateNestedOneWithoutEmployeeInput
    contactInfo?: ContactInfoUncheckedCreateNestedOneWithoutEmployeeInput
    otherInfo?: OtherInfoUncheckedCreateNestedOneWithoutEmployeeInput
    LeaveRequest?: LeaveRequestUncheckedCreateNestedManyWithoutEmployeeInput
    Attendance?: AttendanceUncheckedCreateNestedManyWithoutEmployeeInput
  }

  export type EmployeeCreateOrConnectWithoutWorkInfoInput = {
    where: EmployeeWhereUniqueInput
    create: XOR<EmployeeCreateWithoutWorkInfoInput, EmployeeUncheckedCreateWithoutWorkInfoInput>
  }

  export type EmployeeUpsertWithoutWorkInfoInput = {
    update: XOR<EmployeeUpdateWithoutWorkInfoInput, EmployeeUncheckedUpdateWithoutWorkInfoInput>
    create: XOR<EmployeeCreateWithoutWorkInfoInput, EmployeeUncheckedCreateWithoutWorkInfoInput>
    where?: EmployeeWhereInput
  }

  export type EmployeeUpdateToOneWithWhereWithoutWorkInfoInput = {
    where?: EmployeeWhereInput
    data: XOR<EmployeeUpdateWithoutWorkInfoInput, EmployeeUncheckedUpdateWithoutWorkInfoInput>
  }

  export type EmployeeUpdateWithoutWorkInfoInput = {
    employeeCode?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    gender?: EnumSexFieldUpdateOperationsInput | $Enums.Sex
    birthDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    password?: StringFieldUpdateOperationsInput | string
    role?: EnumRoleFieldUpdateOperationsInput | $Enums.Role
    avatar?: NullableStringFieldUpdateOperationsInput | string | null
    personalInfo?: PersonalInfoUpdateOneWithoutEmployeeNestedInput
    contactInfo?: ContactInfoUpdateOneWithoutEmployeeNestedInput
    otherInfo?: OtherInfoUpdateOneWithoutEmployeeNestedInput
    LeaveRequest?: LeaveRequestUpdateManyWithoutEmployeeNestedInput
    Attendance?: AttendanceUpdateManyWithoutEmployeeNestedInput
  }

  export type EmployeeUncheckedUpdateWithoutWorkInfoInput = {
    id?: IntFieldUpdateOperationsInput | number
    employeeCode?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    gender?: EnumSexFieldUpdateOperationsInput | $Enums.Sex
    birthDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    password?: StringFieldUpdateOperationsInput | string
    role?: EnumRoleFieldUpdateOperationsInput | $Enums.Role
    avatar?: NullableStringFieldUpdateOperationsInput | string | null
    personalInfo?: PersonalInfoUncheckedUpdateOneWithoutEmployeeNestedInput
    contactInfo?: ContactInfoUncheckedUpdateOneWithoutEmployeeNestedInput
    otherInfo?: OtherInfoUncheckedUpdateOneWithoutEmployeeNestedInput
    LeaveRequest?: LeaveRequestUncheckedUpdateManyWithoutEmployeeNestedInput
    Attendance?: AttendanceUncheckedUpdateManyWithoutEmployeeNestedInput
  }

  export type EmployeeCreateWithoutPersonalInfoInput = {
    employeeCode: string
    name: string
    gender?: $Enums.Sex
    birthDate?: Date | string | null
    password: string
    role?: $Enums.Role
    avatar?: string | null
    workInfo?: WorkInfoCreateNestedOneWithoutEmployeeInput
    contactInfo?: ContactInfoCreateNestedOneWithoutEmployeeInput
    otherInfo?: OtherInfoCreateNestedOneWithoutEmployeeInput
    LeaveRequest?: LeaveRequestCreateNestedManyWithoutEmployeeInput
    Attendance?: AttendanceCreateNestedManyWithoutEmployeeInput
  }

  export type EmployeeUncheckedCreateWithoutPersonalInfoInput = {
    id?: number
    employeeCode: string
    name: string
    gender?: $Enums.Sex
    birthDate?: Date | string | null
    password: string
    role?: $Enums.Role
    avatar?: string | null
    workInfo?: WorkInfoUncheckedCreateNestedOneWithoutEmployeeInput
    contactInfo?: ContactInfoUncheckedCreateNestedOneWithoutEmployeeInput
    otherInfo?: OtherInfoUncheckedCreateNestedOneWithoutEmployeeInput
    LeaveRequest?: LeaveRequestUncheckedCreateNestedManyWithoutEmployeeInput
    Attendance?: AttendanceUncheckedCreateNestedManyWithoutEmployeeInput
  }

  export type EmployeeCreateOrConnectWithoutPersonalInfoInput = {
    where: EmployeeWhereUniqueInput
    create: XOR<EmployeeCreateWithoutPersonalInfoInput, EmployeeUncheckedCreateWithoutPersonalInfoInput>
  }

  export type EmployeeUpsertWithoutPersonalInfoInput = {
    update: XOR<EmployeeUpdateWithoutPersonalInfoInput, EmployeeUncheckedUpdateWithoutPersonalInfoInput>
    create: XOR<EmployeeCreateWithoutPersonalInfoInput, EmployeeUncheckedCreateWithoutPersonalInfoInput>
    where?: EmployeeWhereInput
  }

  export type EmployeeUpdateToOneWithWhereWithoutPersonalInfoInput = {
    where?: EmployeeWhereInput
    data: XOR<EmployeeUpdateWithoutPersonalInfoInput, EmployeeUncheckedUpdateWithoutPersonalInfoInput>
  }

  export type EmployeeUpdateWithoutPersonalInfoInput = {
    employeeCode?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    gender?: EnumSexFieldUpdateOperationsInput | $Enums.Sex
    birthDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    password?: StringFieldUpdateOperationsInput | string
    role?: EnumRoleFieldUpdateOperationsInput | $Enums.Role
    avatar?: NullableStringFieldUpdateOperationsInput | string | null
    workInfo?: WorkInfoUpdateOneWithoutEmployeeNestedInput
    contactInfo?: ContactInfoUpdateOneWithoutEmployeeNestedInput
    otherInfo?: OtherInfoUpdateOneWithoutEmployeeNestedInput
    LeaveRequest?: LeaveRequestUpdateManyWithoutEmployeeNestedInput
    Attendance?: AttendanceUpdateManyWithoutEmployeeNestedInput
  }

  export type EmployeeUncheckedUpdateWithoutPersonalInfoInput = {
    id?: IntFieldUpdateOperationsInput | number
    employeeCode?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    gender?: EnumSexFieldUpdateOperationsInput | $Enums.Sex
    birthDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    password?: StringFieldUpdateOperationsInput | string
    role?: EnumRoleFieldUpdateOperationsInput | $Enums.Role
    avatar?: NullableStringFieldUpdateOperationsInput | string | null
    workInfo?: WorkInfoUncheckedUpdateOneWithoutEmployeeNestedInput
    contactInfo?: ContactInfoUncheckedUpdateOneWithoutEmployeeNestedInput
    otherInfo?: OtherInfoUncheckedUpdateOneWithoutEmployeeNestedInput
    LeaveRequest?: LeaveRequestUncheckedUpdateManyWithoutEmployeeNestedInput
    Attendance?: AttendanceUncheckedUpdateManyWithoutEmployeeNestedInput
  }

  export type EmployeeCreateWithoutContactInfoInput = {
    employeeCode: string
    name: string
    gender?: $Enums.Sex
    birthDate?: Date | string | null
    password: string
    role?: $Enums.Role
    avatar?: string | null
    workInfo?: WorkInfoCreateNestedOneWithoutEmployeeInput
    personalInfo?: PersonalInfoCreateNestedOneWithoutEmployeeInput
    otherInfo?: OtherInfoCreateNestedOneWithoutEmployeeInput
    LeaveRequest?: LeaveRequestCreateNestedManyWithoutEmployeeInput
    Attendance?: AttendanceCreateNestedManyWithoutEmployeeInput
  }

  export type EmployeeUncheckedCreateWithoutContactInfoInput = {
    id?: number
    employeeCode: string
    name: string
    gender?: $Enums.Sex
    birthDate?: Date | string | null
    password: string
    role?: $Enums.Role
    avatar?: string | null
    workInfo?: WorkInfoUncheckedCreateNestedOneWithoutEmployeeInput
    personalInfo?: PersonalInfoUncheckedCreateNestedOneWithoutEmployeeInput
    otherInfo?: OtherInfoUncheckedCreateNestedOneWithoutEmployeeInput
    LeaveRequest?: LeaveRequestUncheckedCreateNestedManyWithoutEmployeeInput
    Attendance?: AttendanceUncheckedCreateNestedManyWithoutEmployeeInput
  }

  export type EmployeeCreateOrConnectWithoutContactInfoInput = {
    where: EmployeeWhereUniqueInput
    create: XOR<EmployeeCreateWithoutContactInfoInput, EmployeeUncheckedCreateWithoutContactInfoInput>
  }

  export type EmployeeUpsertWithoutContactInfoInput = {
    update: XOR<EmployeeUpdateWithoutContactInfoInput, EmployeeUncheckedUpdateWithoutContactInfoInput>
    create: XOR<EmployeeCreateWithoutContactInfoInput, EmployeeUncheckedCreateWithoutContactInfoInput>
    where?: EmployeeWhereInput
  }

  export type EmployeeUpdateToOneWithWhereWithoutContactInfoInput = {
    where?: EmployeeWhereInput
    data: XOR<EmployeeUpdateWithoutContactInfoInput, EmployeeUncheckedUpdateWithoutContactInfoInput>
  }

  export type EmployeeUpdateWithoutContactInfoInput = {
    employeeCode?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    gender?: EnumSexFieldUpdateOperationsInput | $Enums.Sex
    birthDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    password?: StringFieldUpdateOperationsInput | string
    role?: EnumRoleFieldUpdateOperationsInput | $Enums.Role
    avatar?: NullableStringFieldUpdateOperationsInput | string | null
    workInfo?: WorkInfoUpdateOneWithoutEmployeeNestedInput
    personalInfo?: PersonalInfoUpdateOneWithoutEmployeeNestedInput
    otherInfo?: OtherInfoUpdateOneWithoutEmployeeNestedInput
    LeaveRequest?: LeaveRequestUpdateManyWithoutEmployeeNestedInput
    Attendance?: AttendanceUpdateManyWithoutEmployeeNestedInput
  }

  export type EmployeeUncheckedUpdateWithoutContactInfoInput = {
    id?: IntFieldUpdateOperationsInput | number
    employeeCode?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    gender?: EnumSexFieldUpdateOperationsInput | $Enums.Sex
    birthDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    password?: StringFieldUpdateOperationsInput | string
    role?: EnumRoleFieldUpdateOperationsInput | $Enums.Role
    avatar?: NullableStringFieldUpdateOperationsInput | string | null
    workInfo?: WorkInfoUncheckedUpdateOneWithoutEmployeeNestedInput
    personalInfo?: PersonalInfoUncheckedUpdateOneWithoutEmployeeNestedInput
    otherInfo?: OtherInfoUncheckedUpdateOneWithoutEmployeeNestedInput
    LeaveRequest?: LeaveRequestUncheckedUpdateManyWithoutEmployeeNestedInput
    Attendance?: AttendanceUncheckedUpdateManyWithoutEmployeeNestedInput
  }

  export type EmployeeCreateWithoutOtherInfoInput = {
    employeeCode: string
    name: string
    gender?: $Enums.Sex
    birthDate?: Date | string | null
    password: string
    role?: $Enums.Role
    avatar?: string | null
    workInfo?: WorkInfoCreateNestedOneWithoutEmployeeInput
    personalInfo?: PersonalInfoCreateNestedOneWithoutEmployeeInput
    contactInfo?: ContactInfoCreateNestedOneWithoutEmployeeInput
    LeaveRequest?: LeaveRequestCreateNestedManyWithoutEmployeeInput
    Attendance?: AttendanceCreateNestedManyWithoutEmployeeInput
  }

  export type EmployeeUncheckedCreateWithoutOtherInfoInput = {
    id?: number
    employeeCode: string
    name: string
    gender?: $Enums.Sex
    birthDate?: Date | string | null
    password: string
    role?: $Enums.Role
    avatar?: string | null
    workInfo?: WorkInfoUncheckedCreateNestedOneWithoutEmployeeInput
    personalInfo?: PersonalInfoUncheckedCreateNestedOneWithoutEmployeeInput
    contactInfo?: ContactInfoUncheckedCreateNestedOneWithoutEmployeeInput
    LeaveRequest?: LeaveRequestUncheckedCreateNestedManyWithoutEmployeeInput
    Attendance?: AttendanceUncheckedCreateNestedManyWithoutEmployeeInput
  }

  export type EmployeeCreateOrConnectWithoutOtherInfoInput = {
    where: EmployeeWhereUniqueInput
    create: XOR<EmployeeCreateWithoutOtherInfoInput, EmployeeUncheckedCreateWithoutOtherInfoInput>
  }

  export type EmployeeUpsertWithoutOtherInfoInput = {
    update: XOR<EmployeeUpdateWithoutOtherInfoInput, EmployeeUncheckedUpdateWithoutOtherInfoInput>
    create: XOR<EmployeeCreateWithoutOtherInfoInput, EmployeeUncheckedCreateWithoutOtherInfoInput>
    where?: EmployeeWhereInput
  }

  export type EmployeeUpdateToOneWithWhereWithoutOtherInfoInput = {
    where?: EmployeeWhereInput
    data: XOR<EmployeeUpdateWithoutOtherInfoInput, EmployeeUncheckedUpdateWithoutOtherInfoInput>
  }

  export type EmployeeUpdateWithoutOtherInfoInput = {
    employeeCode?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    gender?: EnumSexFieldUpdateOperationsInput | $Enums.Sex
    birthDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    password?: StringFieldUpdateOperationsInput | string
    role?: EnumRoleFieldUpdateOperationsInput | $Enums.Role
    avatar?: NullableStringFieldUpdateOperationsInput | string | null
    workInfo?: WorkInfoUpdateOneWithoutEmployeeNestedInput
    personalInfo?: PersonalInfoUpdateOneWithoutEmployeeNestedInput
    contactInfo?: ContactInfoUpdateOneWithoutEmployeeNestedInput
    LeaveRequest?: LeaveRequestUpdateManyWithoutEmployeeNestedInput
    Attendance?: AttendanceUpdateManyWithoutEmployeeNestedInput
  }

  export type EmployeeUncheckedUpdateWithoutOtherInfoInput = {
    id?: IntFieldUpdateOperationsInput | number
    employeeCode?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    gender?: EnumSexFieldUpdateOperationsInput | $Enums.Sex
    birthDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    password?: StringFieldUpdateOperationsInput | string
    role?: EnumRoleFieldUpdateOperationsInput | $Enums.Role
    avatar?: NullableStringFieldUpdateOperationsInput | string | null
    workInfo?: WorkInfoUncheckedUpdateOneWithoutEmployeeNestedInput
    personalInfo?: PersonalInfoUncheckedUpdateOneWithoutEmployeeNestedInput
    contactInfo?: ContactInfoUncheckedUpdateOneWithoutEmployeeNestedInput
    LeaveRequest?: LeaveRequestUncheckedUpdateManyWithoutEmployeeNestedInput
    Attendance?: AttendanceUncheckedUpdateManyWithoutEmployeeNestedInput
  }

  export type EmployeeCreateWithoutLeaveRequestInput = {
    employeeCode: string
    name: string
    gender?: $Enums.Sex
    birthDate?: Date | string | null
    password: string
    role?: $Enums.Role
    avatar?: string | null
    workInfo?: WorkInfoCreateNestedOneWithoutEmployeeInput
    personalInfo?: PersonalInfoCreateNestedOneWithoutEmployeeInput
    contactInfo?: ContactInfoCreateNestedOneWithoutEmployeeInput
    otherInfo?: OtherInfoCreateNestedOneWithoutEmployeeInput
    Attendance?: AttendanceCreateNestedManyWithoutEmployeeInput
  }

  export type EmployeeUncheckedCreateWithoutLeaveRequestInput = {
    id?: number
    employeeCode: string
    name: string
    gender?: $Enums.Sex
    birthDate?: Date | string | null
    password: string
    role?: $Enums.Role
    avatar?: string | null
    workInfo?: WorkInfoUncheckedCreateNestedOneWithoutEmployeeInput
    personalInfo?: PersonalInfoUncheckedCreateNestedOneWithoutEmployeeInput
    contactInfo?: ContactInfoUncheckedCreateNestedOneWithoutEmployeeInput
    otherInfo?: OtherInfoUncheckedCreateNestedOneWithoutEmployeeInput
    Attendance?: AttendanceUncheckedCreateNestedManyWithoutEmployeeInput
  }

  export type EmployeeCreateOrConnectWithoutLeaveRequestInput = {
    where: EmployeeWhereUniqueInput
    create: XOR<EmployeeCreateWithoutLeaveRequestInput, EmployeeUncheckedCreateWithoutLeaveRequestInput>
  }

  export type EmployeeUpsertWithoutLeaveRequestInput = {
    update: XOR<EmployeeUpdateWithoutLeaveRequestInput, EmployeeUncheckedUpdateWithoutLeaveRequestInput>
    create: XOR<EmployeeCreateWithoutLeaveRequestInput, EmployeeUncheckedCreateWithoutLeaveRequestInput>
    where?: EmployeeWhereInput
  }

  export type EmployeeUpdateToOneWithWhereWithoutLeaveRequestInput = {
    where?: EmployeeWhereInput
    data: XOR<EmployeeUpdateWithoutLeaveRequestInput, EmployeeUncheckedUpdateWithoutLeaveRequestInput>
  }

  export type EmployeeUpdateWithoutLeaveRequestInput = {
    employeeCode?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    gender?: EnumSexFieldUpdateOperationsInput | $Enums.Sex
    birthDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    password?: StringFieldUpdateOperationsInput | string
    role?: EnumRoleFieldUpdateOperationsInput | $Enums.Role
    avatar?: NullableStringFieldUpdateOperationsInput | string | null
    workInfo?: WorkInfoUpdateOneWithoutEmployeeNestedInput
    personalInfo?: PersonalInfoUpdateOneWithoutEmployeeNestedInput
    contactInfo?: ContactInfoUpdateOneWithoutEmployeeNestedInput
    otherInfo?: OtherInfoUpdateOneWithoutEmployeeNestedInput
    Attendance?: AttendanceUpdateManyWithoutEmployeeNestedInput
  }

  export type EmployeeUncheckedUpdateWithoutLeaveRequestInput = {
    id?: IntFieldUpdateOperationsInput | number
    employeeCode?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    gender?: EnumSexFieldUpdateOperationsInput | $Enums.Sex
    birthDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    password?: StringFieldUpdateOperationsInput | string
    role?: EnumRoleFieldUpdateOperationsInput | $Enums.Role
    avatar?: NullableStringFieldUpdateOperationsInput | string | null
    workInfo?: WorkInfoUncheckedUpdateOneWithoutEmployeeNestedInput
    personalInfo?: PersonalInfoUncheckedUpdateOneWithoutEmployeeNestedInput
    contactInfo?: ContactInfoUncheckedUpdateOneWithoutEmployeeNestedInput
    otherInfo?: OtherInfoUncheckedUpdateOneWithoutEmployeeNestedInput
    Attendance?: AttendanceUncheckedUpdateManyWithoutEmployeeNestedInput
  }

  export type EmployeeCreateWithoutAttendanceInput = {
    employeeCode: string
    name: string
    gender?: $Enums.Sex
    birthDate?: Date | string | null
    password: string
    role?: $Enums.Role
    avatar?: string | null
    workInfo?: WorkInfoCreateNestedOneWithoutEmployeeInput
    personalInfo?: PersonalInfoCreateNestedOneWithoutEmployeeInput
    contactInfo?: ContactInfoCreateNestedOneWithoutEmployeeInput
    otherInfo?: OtherInfoCreateNestedOneWithoutEmployeeInput
    LeaveRequest?: LeaveRequestCreateNestedManyWithoutEmployeeInput
  }

  export type EmployeeUncheckedCreateWithoutAttendanceInput = {
    id?: number
    employeeCode: string
    name: string
    gender?: $Enums.Sex
    birthDate?: Date | string | null
    password: string
    role?: $Enums.Role
    avatar?: string | null
    workInfo?: WorkInfoUncheckedCreateNestedOneWithoutEmployeeInput
    personalInfo?: PersonalInfoUncheckedCreateNestedOneWithoutEmployeeInput
    contactInfo?: ContactInfoUncheckedCreateNestedOneWithoutEmployeeInput
    otherInfo?: OtherInfoUncheckedCreateNestedOneWithoutEmployeeInput
    LeaveRequest?: LeaveRequestUncheckedCreateNestedManyWithoutEmployeeInput
  }

  export type EmployeeCreateOrConnectWithoutAttendanceInput = {
    where: EmployeeWhereUniqueInput
    create: XOR<EmployeeCreateWithoutAttendanceInput, EmployeeUncheckedCreateWithoutAttendanceInput>
  }

  export type EmployeeUpsertWithoutAttendanceInput = {
    update: XOR<EmployeeUpdateWithoutAttendanceInput, EmployeeUncheckedUpdateWithoutAttendanceInput>
    create: XOR<EmployeeCreateWithoutAttendanceInput, EmployeeUncheckedCreateWithoutAttendanceInput>
    where?: EmployeeWhereInput
  }

  export type EmployeeUpdateToOneWithWhereWithoutAttendanceInput = {
    where?: EmployeeWhereInput
    data: XOR<EmployeeUpdateWithoutAttendanceInput, EmployeeUncheckedUpdateWithoutAttendanceInput>
  }

  export type EmployeeUpdateWithoutAttendanceInput = {
    employeeCode?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    gender?: EnumSexFieldUpdateOperationsInput | $Enums.Sex
    birthDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    password?: StringFieldUpdateOperationsInput | string
    role?: EnumRoleFieldUpdateOperationsInput | $Enums.Role
    avatar?: NullableStringFieldUpdateOperationsInput | string | null
    workInfo?: WorkInfoUpdateOneWithoutEmployeeNestedInput
    personalInfo?: PersonalInfoUpdateOneWithoutEmployeeNestedInput
    contactInfo?: ContactInfoUpdateOneWithoutEmployeeNestedInput
    otherInfo?: OtherInfoUpdateOneWithoutEmployeeNestedInput
    LeaveRequest?: LeaveRequestUpdateManyWithoutEmployeeNestedInput
  }

  export type EmployeeUncheckedUpdateWithoutAttendanceInput = {
    id?: IntFieldUpdateOperationsInput | number
    employeeCode?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    gender?: EnumSexFieldUpdateOperationsInput | $Enums.Sex
    birthDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    password?: StringFieldUpdateOperationsInput | string
    role?: EnumRoleFieldUpdateOperationsInput | $Enums.Role
    avatar?: NullableStringFieldUpdateOperationsInput | string | null
    workInfo?: WorkInfoUncheckedUpdateOneWithoutEmployeeNestedInput
    personalInfo?: PersonalInfoUncheckedUpdateOneWithoutEmployeeNestedInput
    contactInfo?: ContactInfoUncheckedUpdateOneWithoutEmployeeNestedInput
    otherInfo?: OtherInfoUncheckedUpdateOneWithoutEmployeeNestedInput
    LeaveRequest?: LeaveRequestUncheckedUpdateManyWithoutEmployeeNestedInput
  }

  export type LeaveRequestCreateManyEmployeeInput = {
    id?: number
    leaveType: $Enums.LeaveTypeEnum
    startDate: Date | string
    endDate: Date | string
    totalHours?: number | null
    reason?: string | null
    status?: $Enums.LeaveStatus
    approvedBy?: string | null
    approvedAt?: Date | string | null
    createdAt?: Date | string
  }

  export type AttendanceCreateManyEmployeeInput = {
    id?: number
    date: Date | string
    checkInTime?: Date | string | null
    checkOutTime?: Date | string | null
  }

  export type LeaveRequestUpdateWithoutEmployeeInput = {
    leaveType?: EnumLeaveTypeEnumFieldUpdateOperationsInput | $Enums.LeaveTypeEnum
    startDate?: DateTimeFieldUpdateOperationsInput | Date | string
    endDate?: DateTimeFieldUpdateOperationsInput | Date | string
    totalHours?: NullableFloatFieldUpdateOperationsInput | number | null
    reason?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumLeaveStatusFieldUpdateOperationsInput | $Enums.LeaveStatus
    approvedBy?: NullableStringFieldUpdateOperationsInput | string | null
    approvedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type LeaveRequestUncheckedUpdateWithoutEmployeeInput = {
    id?: IntFieldUpdateOperationsInput | number
    leaveType?: EnumLeaveTypeEnumFieldUpdateOperationsInput | $Enums.LeaveTypeEnum
    startDate?: DateTimeFieldUpdateOperationsInput | Date | string
    endDate?: DateTimeFieldUpdateOperationsInput | Date | string
    totalHours?: NullableFloatFieldUpdateOperationsInput | number | null
    reason?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumLeaveStatusFieldUpdateOperationsInput | $Enums.LeaveStatus
    approvedBy?: NullableStringFieldUpdateOperationsInput | string | null
    approvedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type LeaveRequestUncheckedUpdateManyWithoutEmployeeInput = {
    id?: IntFieldUpdateOperationsInput | number
    leaveType?: EnumLeaveTypeEnumFieldUpdateOperationsInput | $Enums.LeaveTypeEnum
    startDate?: DateTimeFieldUpdateOperationsInput | Date | string
    endDate?: DateTimeFieldUpdateOperationsInput | Date | string
    totalHours?: NullableFloatFieldUpdateOperationsInput | number | null
    reason?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumLeaveStatusFieldUpdateOperationsInput | $Enums.LeaveStatus
    approvedBy?: NullableStringFieldUpdateOperationsInput | string | null
    approvedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AttendanceUpdateWithoutEmployeeInput = {
    date?: DateTimeFieldUpdateOperationsInput | Date | string
    checkInTime?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    checkOutTime?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type AttendanceUncheckedUpdateWithoutEmployeeInput = {
    id?: IntFieldUpdateOperationsInput | number
    date?: DateTimeFieldUpdateOperationsInput | Date | string
    checkInTime?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    checkOutTime?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type AttendanceUncheckedUpdateManyWithoutEmployeeInput = {
    id?: IntFieldUpdateOperationsInput | number
    date?: DateTimeFieldUpdateOperationsInput | Date | string
    checkInTime?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    checkOutTime?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }



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