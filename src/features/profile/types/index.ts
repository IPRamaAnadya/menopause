export interface UserProfile {
  id: number;
  public_id: string;
  email: string;
  name: string | null;
  profession: string | null;
  is_hidden: boolean;
  image: string | null;
  email_verified: Date | null;
  created_at: Date;
  updated_at: Date;
}

export interface UpdateProfileDTO {
  name?: string;
  profession?: string;
  is_hidden?: boolean;
  image?: string;
}

export interface UpdateProfileImageDTO {
  image: string;
}
