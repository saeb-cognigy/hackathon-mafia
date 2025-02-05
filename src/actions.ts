import { Action, Character } from './abstract';
import { Game } from './game';
import { ModeratorCharacter } from './characters';

export class StartGameAction extends Action {
    constructor() {
        // Define action conditions
        const conditions = [
            // Only moderator can start the game
            (character?: Character): boolean => {
                if (!character) {
                    return false;
                }
                return character instanceof ModeratorCharacter;
            }
        ];

        // Initialize the action
        super(
            "Start Game",          // Action name
            "Begins the game with current players",  // Action description
            conditions             // Action conditions
        );
    }

    protected performAction(game: Game): void {
        // TODO: Implement actual game start logic
        console.log("Game is starting...");
    }
} 