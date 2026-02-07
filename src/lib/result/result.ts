/**
 * Result<TSuccess, TError> - Generic Result type for railway-oriented programming
 *
 * This type represents the result of an operation that can either succeed or fail.
 * It forces explicit error handling and makes error types visible in the function signature.
 *
 * Generic Parameters:
 * - TSuccess: The type of the success value
 * - TError: The type of the error (can be a union of multiple error types)
 *
 * Usage:
 * ```typescript
 * // Function signature with explicit error types
 * function findUser(id: string): Promise<Result<User, NotFoundError | DatabaseError>> {
 *   // ...
 * }
 *
 * // Using the result
 * const result = await findUser('123')
 *
 * if (result.isSuccess()) {
 *   console.log(result.value.name)
 * } else {
 *   console.error(result.error.message)
 * }
 * ```
 */
export class Result<TSuccess, TError> {
  private constructor(
    private readonly _isSuccess: boolean,
    private readonly successValue?: TSuccess,
    private readonly errorValue?: TError
  ) {}

  /**
   * Creates a successful Result containing a value
   */
  public static ok<TSuccess, TError>(value: TSuccess): Result<TSuccess, TError> {
    return new Result<TSuccess, TError>(true, value)
  }

  /**
   * Creates a failed Result containing an error
   */
  public static fail<TSuccess, TError>(error: TError): Result<TSuccess, TError> {
    return new Result<TSuccess, TError>(false, undefined, error)
  }

  /**
   * Check if the result is successful
   */
  public isSuccess(): boolean {
    return this._isSuccess
  }

  /**
   * Check if the result is a failure
   */
  public isFailure(): boolean {
    return !this._isSuccess
  }

  /**
   * Get the success value. Throws if the result is a failure.
   * Use isSuccess() to check before accessing.
   */
  public get value(): TSuccess {
    if (!this._isSuccess) {
      throw new Error(
        "Can't get the value of an error result. Use isSuccess() before accessing value."
      )
    }
    return this.successValue as TSuccess
  }

  /**
   * Get the error. Throws if the result is successful.
   * Use isFailure() to check before accessing.
   */
  public get error(): TError {
    if (this._isSuccess) {
      throw new Error(
        "Can't get the error of a success result. Use isFailure() before accessing error."
      )
    }
    return this.errorValue as TError
  }
}
