import { IGitHubUser } from "../GitHubTypes.js";

export class GitHubUser {
  private _id: number;
  private _login: string;
  private _name?: string;
  private _avatarUrl: string;
  private _htmlUrl: string;
  private _type: string;
  private _email?: string;
  private _bio?: string;
  private _company?: string;
  private _location?: string;
  private _blog?: string;
  private _twitterUsername?: string;
  private _publicRepos?: number;
  private _followers?: number;
  private _following?: number;
  private _createdAt: string;
  private _updatedAt: string;

  constructor(data: IGitHubUser) {
    this._id = data.id;
    this._login = data.login;
    this._name = data.name;
    this._avatarUrl = data.avatar_url;
    this._htmlUrl = data.html_url;
    this._type = data.type;
    this._email = data.email;
    this._bio = data.bio;
    this._company = data.company;
    this._location = data.location;
    this._blog = data.blog;
    this._twitterUsername = data.twitter_username;
    this._publicRepos = data.public_repos;
    this._followers = data.followers;
    this._following = data.following;
    this._createdAt = data.created_at;
    this._updatedAt = data.updated_at;
  }

  get data(): IGitHubUser {
    return {
      id: this._id,
      login: this._login,
      name: this._name,
      avatar_url: this._avatarUrl,
      html_url: this._htmlUrl,
      type: this._type,
      email: this._email,
      bio: this._bio,
      company: this._company,
      location: this._location,
      blog: this._blog,
      twitter_username: this._twitterUsername,
      public_repos: this._publicRepos,
      followers: this._followers,
      following: this._following,
      created_at: this._createdAt,
      updated_at: this._updatedAt
    };
  }

  get id(): number {
    return this._id;
  }

  get login(): string {
    return this._login;
  }

  get name(): string {
    return this._name || this._login;
  }

  get avatarUrl(): string {
    return this._avatarUrl;
  }

  get htmlUrl(): string {
    return this._htmlUrl;
  }

  get type(): string {
    return this._type;
  }

  get email(): string | undefined {
    return this._email;
  }

  get bio(): string | undefined {
    return this._bio;
  }

  get company(): string | undefined {
    return this._company;
  }

  get location(): string | undefined {
    return this._location;
  }

  get blog(): string | undefined {
    return this._blog;
  }

  get twitterUsername(): string | undefined {
    return this._twitterUsername;
  }

  get publicRepos(): number | undefined {
    return this._publicRepos;
  }

  get followers(): number | undefined {
    return this._followers;
  }

  get following(): number | undefined {
    return this._following;
  }

  get createdAt(): string {
    return this._createdAt;
  }

  get updatedAt(): string {
    return this._updatedAt;
  }

  get formattedCreatedAt(): string {
    return new Date(this._createdAt).toISOString();
  }

  get formattedUpdatedAt(): string {
    return new Date(this._updatedAt).toISOString();
  }

  get displayInfo(): string {
    const parts = [];
    if (this.name !== this.login) {
      parts.push(`${this.name} (@${this.login})`);
    } else {
      parts.push(`@${this.login}`);
    }
    
    if (this._company) {
      parts.push(`Company: ${this._company}`);
    }
    
    if (this._location) {
      parts.push(`Location: ${this._location}`);
    }
    
    return parts.join(" | ");
  }
}
