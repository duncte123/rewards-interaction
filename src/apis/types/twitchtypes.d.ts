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

export type TwitchPollCreateRequest = {
  // required
  broadcaster_id?: string; // will be inserted before we do the request
  title: string;
  choices: TwitchPollRequestChoice[];
  duration: number;

  // optional
  bits_voting_enabled?: boolean;
  bits_per_vote?: number;
  channel_points_voting_enabled?: boolean;
  channel_points_per_vote?: number;
};

export type TwitchPollRequestChoice = {
  title: string;
};

export type TwitchPollEndRequest = {
  broadcaster_id: string;
  id: string;
  status: 'TERMINATED' | 'ARCHIVED';
};

// Only 'TERMINATED' and 'ARCHIVED' are valid for ending a poll
export type TwitchPollStatus = 'ACTIVE' | 'COMPLETED' | 'TERMINATED' | 'ARCHIVED' | 'MODERATED' | 'INVALID';

export type TwitchPollResponse = {
  id: string;
  broadcaster_id: string;
  broadcaster_name: string;
  broadcaster_login: string;
  title: string;
  choices: TwitchPollResponseChoice[];
  bits_voting_enabled: boolean;
  bits_per_vote: number;
  channel_points_voting_enabled: boolean;
  channel_points_per_vote: number
  status: TwitchPollStatus;
  duration: number;
  started_at: string;
  ended_at?: string;
};

export type TwitchPollResponseChoice = {
  id: string;
  title: string;
  votes: number;
  channel_points_votes: number;
  bits_votes: number;
};
