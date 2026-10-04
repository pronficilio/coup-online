import { t } from './index'

const ERROR_KEYS = {
  invalid_name: 'lobby.error.invalidName',
  name_already_set: 'lobby.error.nameAlreadySet',
  name_taken: 'lobby.error.nameTaken',
  party_full: 'lobby.error.partyFull',
  game_already_started: 'lobby.error.gameStarted',
  leader_only: 'lobby.error.leaderOnly',
  codex_access_required: 'lobby.error.aiAuthorizationRequired',
  codex_disabled: 'lobby.error.aiDisabled',
  invalid_ai_settings: 'lobby.error.aiSettingsInvalid',
  players_not_ready: 'lobby.error.playersNotReady',
  need_two_players: 'lobby.error.needTwoPlayers',
  game_start_failed: 'lobby.error.gameStartFailed'
}

export function lobbyError(reason) {
  return t(ERROR_KEYS[reason] || 'lobby.error.unknown')
}
