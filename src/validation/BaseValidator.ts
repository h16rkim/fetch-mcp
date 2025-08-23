/**
 * Base validation utilities and common validators
 */
export abstract class BaseValidator {
  /**
   * Validate that a value is an object
   */
  protected static validateObject(args: any, fieldName: string = "arguments"): void {
    if (!args || typeof args !== "object") {
      throw new Error(`Invalid ${fieldName}: must be an object`);
    }
  }

  /**
   * Validate that a value is a required string
   */
  protected static validateRequiredString(value: any, fieldName: string): string {
    if (!value || typeof value !== "string") {
      throw new Error(`Invalid ${fieldName}: must be a string`);
    }
    return value;
  }

  /**
   * Validate that a string is a valid URL
   */
  protected static validateUrl(url: string, fieldName: string = "url"): void {
    try {
      new URL(url);
    } catch {
      throw new Error(`Invalid ${fieldName}: must be a valid URL`);
    }
  }

  /**
   * Validate that a value is an object (for optional fields)
   */
  protected static validateOptionalObject(
    value: any,
    fieldName: string
  ): Record<string, string> | undefined {
    if (value === undefined) {
      return undefined;
    }
    if (typeof value !== "object" || value === null) {
      throw new Error(`Invalid ${fieldName}: must be an object`);
    }
    return value;
  }

  /**
   * Validate that a value is a positive number
   */
  protected static validatePositiveNumber(value: any, fieldName: string): number {
    if (typeof value !== "number" || value < 1) {
      throw new Error(`Invalid ${fieldName}: must be a positive number`);
    }
    return value;
  }

  /**
   * Validate that a value is a non-negative number
   */
  protected static validateNonNegativeNumber(value: any, fieldName: string): number {
    if (typeof value !== "number" || value < 0) {
      throw new Error(`Invalid ${fieldName}: must be a non-negative number`);
    }
    return value;
  }

  /**
   * Validate optional positive number
   */
  protected static validateOptionalPositiveNumber(
    value: any,
    fieldName: string
  ): number | undefined {
    if (value === undefined) {
      return undefined;
    }
    return this.validatePositiveNumber(value, fieldName);
  }

  /**
   * Validate optional non-negative number
   */
  protected static validateOptionalNonNegativeNumber(
    value: any,
    fieldName: string
  ): number | undefined {
    if (value === undefined) {
      return undefined;
    }
    return this.validateNonNegativeNumber(value, fieldName);
  }

  /**
   * Provide default value for optional fields
   */
  protected static withDefault<T>(value: T | undefined, defaultValue: T): T {
    return value !== undefined ? value : defaultValue;
  }

  /**
   * Validate URL pattern with regex
   */
  protected static validateUrlPattern(
    url: string,
    pattern: RegExp,
    fieldName: string,
    exampleUrl: string
  ): void {
    this.validateUrl(url, fieldName);
    
    if (!pattern.test(url)) {
      throw new Error(
        `Invalid ${fieldName}: must match the expected pattern (e.g., ${exampleUrl})`
      );
    }
  }
}
