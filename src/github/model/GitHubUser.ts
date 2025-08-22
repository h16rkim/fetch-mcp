import { IGitHubUser } from "../GitHubTypes.js";

export class GitHubUser {
  private _data: IGitHubUser;

  constructor(data: IGitHubUser) {
    this._data = data;
  }

  get data(): IGitHubUser {
    return this._data;
  }

  get id(): number {
    return this._data.id;
  }

  get login(): string {
    return this._data.login;
  }

  get name(): string {
    return this._data.name || this._data.login;
  }

  get avatarUrl(): string {
    return this._data.avatar_url;
  }

  get htmlUrl(): string {
    return this._data.html_url;
  }

  get type(): string {
    return this._data.type;
  }

  get email(): string | undefined {
    return this._data.email;
  }

  get bio(): string | undefined {
    return this._data.bio;
  }

  get company(): string | undefined {
    return this._data.company;
  }

  get location(): string | undefined {
    return this._data.location;
  }

  get blog(): string | undefined {
    return this._data.blog;
  }

  get twitterUsername(): string | undefined {
    return this._data.twitter_username;
  }

  get publicRepos(): number | undefined {
    return this._data.public_repos;
  }

  get followers(): number | undefined {
    return this._data.followers;
  }

  get following(): number | undefined {
    return this._data.following;
  }

  get createdAt(): string {
    return this._data.created_at;
  }

  get updatedAt(): string {
    return this._data.updated_at;
  }

  get formattedCreatedAt(): string {
    return new Date(this._data.created_at).toISOString();
  }

  get formattedUpdatedAt(): string {
    return new Date(this._data.updated_at).toISOString();
  }

  get displayInfo(): string {
    const parts = [];
    if (this.name !== this.login) {
      parts.push(`${this.name} (@${this.login})`);
    } else {
      parts.push(`@${this.login}`);
    }
    
    if (this.company) {
      parts.push(`Company: ${this.company}`);
    }
    
    if (this.location) {
      parts.push(`Location: ${this.location}`);
    }
    
    return parts.join(" | ");
  }
}
