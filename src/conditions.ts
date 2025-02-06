import { Game } from './game';
import { ModeratorCharacter } from './characters';
import { DayTime } from './variables';
import { Character } from './abstract';
export const conditions = {
    // Only moderator can perform action
    isModerator: (context: any) => {
        const { character } = context;
        if (!character) {
            return false;
        }
        return character instanceof ModeratorCharacter;
    },

    // Game hasn't started yet
    gameNotStarted: (context: any) => {
        const { game } = context;
        if (!game) return false;
        return !game.isGameStarted();
    },

    // Minimum players required
    hasMinimumPlayers: (context: any) => {
        const { game } = context;
        if (!game) return false;
        return game.getCharactersCount() >= game.getMinimumCharacters();
    },

    // All characters must be valid
    allCharactersValid: (context: any) => {
        const { game } = context;
        if (!game) return false;
        const characters = game.getCharacters();
        return characters.every((char: Character) => char.is_valid);
    },

    // Is day time
    isDayTime: (context: any) => {
        const { game } = context;
        if (!game) return false;
        return game.getDayTime() === DayTime.DAY;
    },

    // Game is started
    gameIsStarted: (context: any) => {
        const { game } = context;
        if (!game) return false;
        return game.isGameStarted();
    },

    // At least one character is not valid
    notAllCharactersValid: (context: any) => {
        const { game } = context;
        if (!game) return false;
        const characters = game.getCharacters();
        return characters.some((char: Character) => !char.is_valid);
    },

    // Check if character hasn't taken their turn
    turnNotTaken: (context: any) => {
        const { character } = context;
        if (!character) return false;
        return !character.hasTakenTurn;
    },

    // Check if it's night time
    isNightTime: (context: any) => {
        const { game } = context;
        if (!game) return false;
        return game.getDayTime() === DayTime.NIGHT;
    }
}; 