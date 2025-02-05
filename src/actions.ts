import { Action, Character } from './abstract';
import { Game } from './game';
import { ModeratorCharacter, DetectiveCharacter, MafiaCharacter, DoctorCharacter, VillagerCharacter } from './characters';

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

export class AssignRolesAction extends Action {
    constructor() {
        const conditions = [
            // Only moderator can assign roles
            (character?: Character): boolean => {
                if (!character) {
                    return false;
                }
                return character instanceof ModeratorCharacter;
            }
        ];

        super(
            "Assign Roles",          // Action name
            "Randomly assign roles to all players",  // Action description
            conditions             // Action conditions
        );
    }

    protected performAction(game: Game): void {
        const characters = game.getCharacters();
        const availableCharacters = characters.filter(char => !(char instanceof ModeratorCharacter));
        
        if (availableCharacters.length < 4) {
            throw new Error("Not enough players to assign roles (minimum 4 required)");
        }

        // Define role distribution
        const roleDistribution = this.getRoleDistribution(availableCharacters.length);
        const roles = this.shuffleRoles(roleDistribution);

        // Assign roles to players
        availableCharacters.forEach((character, index) => {
            game.replaceCharacter(character.getId(), roles[index]);
        });

        console.log("Roles have been assigned to all players");
    }

    private getRoleDistribution(playerCount: number): string[] {
        // Basic role distribution
        const roles: string[] = [
            'Detective',
            'Doctor',
            'Mafia'
        ];

        // Add villagers for remaining players
        const villagersNeeded = playerCount - roles.length;
        for (let i = 0; i < villagersNeeded; i++) {
            roles.push('Villager');
        }

        return roles;
    }

    private shuffleRoles(roles: string[]): string[] {
        // Fisher-Yates shuffle
        for (let i = roles.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [roles[i], roles[j]] = [roles[j], roles[i]];
        }
        return roles;
    }

} 