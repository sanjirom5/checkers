alter table public.games
  add column result text not null default 'win',
  add column game_mode text not null default 'ai',
  add column difficulty text;
