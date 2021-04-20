export type TwitchUser = {
  id: string;
  login: string;
  display_name: string;
  type: string;
  broadcaster_type: string;
  description: string;
  profile_image_url: string;
  offline_image_url: string;
  view_count: number;
  email: string;
  created_at: string;
};

export type TwitchChannel = {
  broadcaster_id: string;
  broadcaster_name: string;
  broadcaster_language: string;
  game_id: string;
  game_name: string;
  title: string;
};
