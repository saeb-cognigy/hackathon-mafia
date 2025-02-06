import { Action, Character } from './abstract';
import { Game } from './game';
import { ModeratorCharacter, DetectiveCharacter, MafiaCharacter, DoctorCharacter, VillagerCharacter } from './characters';
import { dayTime, DayTime } from './variables';

export class StartGameAction extends Action {
    constructor() {
        const conditions = [
            // Only moderator can start the game
            () => {
                const { character } = this.context;
                if (!character) {
                    return false;
                }
                return character instanceof ModeratorCharacter;
            },
            // Game hasn't started yet
            () => {
                const { game } = this.context;
                return !game.isGameStarted();
            },
            // Minimum players required
            () => {
                const { game } = this.context as { game: Game };
                return game.getCharactersCount() >= game.getMinimumCharacters();
            },
            // All characters must be valid (have roles assigned)
            () => {
                const { game } = this.context as { game: Game };
                const characters = game.getCharacters();
                return characters.every(char => char.is_valid);
            }
        ];

        super(
            "Start Game",
            "Begins the game with current players",
            conditions
        );
    }

    protected performAction(): void {
        const { game } = this.context;
        game.setGameStarted(true);
        console.log("Game is starting...");
    }
}

export class AssignRolesAction extends Action {
    constructor() {
        const conditions = [
            // Only moderator can assign roles
            () => {
                const { character } = this.context;
                if (!character) {
                    return false;
                }
                return character instanceof ModeratorCharacter;
            },
            // Game hasn't started yet
            () => {
                const { game } = this.context;
                return !game.isGameStarted();
            },
            // Minimum 4 players required
            () => {
                const { game } = this.context as { game: Game };
                return game.getCharactersCount() >= game.getMinimumCharacters();
            },
            () => {
                const { game } = this.context as { game: Game };
                const characters = game.getCharacters();
                return characters.some((char: Character) => !char.is_valid);
            }
        ];

        super(
            "Assign Roles",
            "Randomly assign roles to all players",
            conditions
        );
    }

    protected performAction(): void {
        const { game } = this.context as { game: Game };
        const characters = game.getCharacters();
        const availableCharacters = characters.filter(char => !(char instanceof ModeratorCharacter));
        
        if (availableCharacters.length < 4) {
            throw new Error("Not enough players to assign roles (minimum 4 required)");
        }

        const roleDistribution = this.getRoleDistribution(availableCharacters.length);
        const roles = this.shuffleRoles(roleDistribution);

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

export class EnterNightAction extends Action {
    constructor() {
        const conditions = [
            // Only moderator can transition to night
            () => {
                const { character } = this.context;
                if (!character) {
                    return false;
                }
                return character instanceof ModeratorCharacter;
            },
            // Can only enter night if it's currently day
            () => {
                const { game } = this.context;
                return (game.getDayTime() === DayTime.DAY) && game.isGameStarted();
            }
        ];

        super(
            "Enter Night",
            "Transition the game to night phase",
            conditions
        );
    }

    protected performAction(): void {
        const { game } = this.context;
        game.setDayTime(DayTime.NIGHT);
        console.log("The night has begun...");
    }
} 