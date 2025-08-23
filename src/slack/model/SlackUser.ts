import { ISlackUser } from "../SlackTypes.js";

export class SlackUser {
  private _id: string;
  private _name?: string;
  private _realName?: string;
  private _displayName?: string;
  private _profile?: {
    display_name?: string;
    real_name?: string;
    first_name?: string;
    last_name?: string;
  };

  constructor(data: ISlackUser) {
    this._id = data.id;
    this._name = data.name;
    this._realName = data.real_name;
    this._displayName = data.display_name;
    this._profile = data.profile;
  }

  get data(): ISlackUser {
    return {
      id: this._id,
      name: this._name,
      real_name: this._realName,
      display_name: this._displayName,
      profile: this._profile
    };
  }

  get id(): string {
    return this._id;
  }

  get name(): string {
    return this._name || "Unknown";
  }

  get realName(): string {
    return this._realName || "Unknown";
  }

  get displayName(): string {
    return this._displayName || "Unknown";
  }

  get profileDisplayName(): string {
    return this._profile?.display_name || "Unknown";
  }

  get profileRealName(): string {
    return this._profile?.real_name || "Unknown";
  }

  get profileFirstName(): string {
    return this._profile?.first_name || "Unknown";
  }

  get profileLastName(): string {
    return this._profile?.last_name || "Unknown";
  }

  /**
   * Get the best available display name for the user
   * Priority: profile.display_name > display_name > profile.real_name > real_name > name > "Unknown User"
   */
  get bestDisplayName(): string {
    return (
      this._profile?.display_name ||
      this._displayName ||
      this._profile?.real_name ||
      this._realName ||
      this._name ||
      "Unknown User"
    );
  }

  /**
   * Get full name if available (first + last name)
   */
  get fullName(): string {
    const firstName = this._profile?.first_name;
    const lastName = this._profile?.last_name;

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
    return Boolean(this._profile);
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
