export type PostType =
  | "reflection"
  | "meditation"
  | "journal"
  | "goal"
  | "streak";

export type Visibility =
  | "community"
  | "private";

export interface CommunityPost {

  title: string;

  body: string;

  mood: string;

  type: PostType;

  visibility: Visibility;

  createdAt?: Date;

}