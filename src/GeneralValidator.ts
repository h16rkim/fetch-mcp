import { RequestPayload } from "./types.js";
import { Constants } from "./constants.js";
import { BaseValidator } from "./validation/BaseValidator.js";

/**
 * Validator for general fetch requests
 */
export class GeneralValidator extends BaseValidator {
  /**
   * Validate general request payload for fetch tool
   */
  static validateRequestPayload(args: any): RequestPayload {
    this.validateObject(args);

    const url = this.validateRequiredString(args.url, "url");
    this.validateUrl(url);

    return {
      url,
      headers: this.validateOptionalObject(args.headers, "headers"),
      max_length: this.withDefault(
        this.validateOptionalPositiveNumber(args.max_length, "max_length"),
        Constants.DEFAULT_MAX_LENGTH
      ),
      start_index: this.withDefault(
        this.validateOptionalNonNegativeNumber(args.start_index, "start_index"),
        Constants.DEFAULT_START_INDEX
      ),
    };
  }
}
