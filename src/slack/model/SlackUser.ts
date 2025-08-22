import { ISlackUser } from "../SlackTypes.js";

export class SlackUser {
  private _data: ISlackUser;

  constructor(data: ISlackUser) {
    this._data = data;
  }

  get data(): ISlackUser {
    return this._data;
  }

  get id(): string {
    return this._data.id;
  }

  get name(): string {
    return this._data.name || "Unknown";
  }

  get realName(): string {
    return this._data.real_name || "Unknown";
  }

  get displayName(): string {
    return this._data.display_name || "Unknown";
  }

  get profileDisplayName(): string {
    return this._data.profile?.display_name || "Unknown";
  }

  get profileRealName(): string {
    return this._data.profile?.real_name || "Unknown";
  }

  get profileFirstName(): string {
    return this._data.profile?.first_name || "Unknown";
  }

  get profileLastName(): string {
    return this._data.profile?.last_name || "Unknown";
  }

  /**
   * Get the best available display name for the user
   * Priority: profile.display_name > display_name > profile.real_name > real_name > name > "Unknown User"
   */
  get bestDisplayName(): string {
    return (
      this._data.profile?.display_name ||
      this._data.display_name ||
      this._data.profile?.real_name ||
      this._data.real_name ||
      this._data.name ||
      "Unknown User"
    );
  }

  /**
   * Get full name if available (first + last name)
   */
  get fullName(): string {
    const firstName = this._data.profile?.first_name;
    const lastName = this._data.profile?.last_name;

    if (firstName && lastName) {
      return `${firstName} ${lastName}`;
    } else if (firstName) {
      return firstName;
    } else if (lastName) {
      return lastName;
    }

    return this.bestDisplayName;
  }

  /**
   * Check if user has profile information
   */
  get hasProfile(): boolean {
    return Boolean(this._data.profile);
  }

  /**
   * Get user information summary
   */
  getSummary(): {
    id: string;
    bestDisplayName: string;
    realName: string;
    hasProfile: boolean;
  } {
    return {
      id: this.id,
      bestDisplayName: this.bestDisplayName,
      realName: this.realName,
      hasProfile: this.hasProfile,
    };
  }
}
