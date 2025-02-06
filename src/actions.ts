import { Action, Character } from './abstract';
import { Game } from './game';
import { ModeratorCharacter, DetectiveCharacter, MafiaCharacter, DoctorCharacter, VillagerCharacter } from './characters';
import { dayTime, DayTime } from './variables';
import { conditions } from './conditions';

export class StartGameAction extends Action {
    constructor() {
        super(
            "Start Game",
            "Begins the game with current players",
            [
                conditions.isModerator,
                conditions.gameNotStarted,
                conditions.hasMinimumPlayers,
                conditions.allCharactersValid
            ]
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
        super(
            "Assign Roles",
            "Randomly assign roles to all players",
            [
                conditions.isModerator,
                conditions.gameNotStarted,
                conditions.hasMinimumPlayers,
                conditions.notAllCharactersValid
            ]
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
        super(
            "Enter Night",
            "Transition the game to night phase",
            [
                conditions.isModerator,
                conditions.isDayTime,
                conditions.gameIsStarted
            ]
        );
    }

    protected performAction(): void {
        const { game } = this.context;
        game.setDayTime(DayTime.NIGHT);
        console.log("The night has begun...");
    }
}

export class UpdateCharacterNameAction extends Action {
    constructor() {
        super(
            "Update Name",
            "Change your character's name",
            [
                conditions.gameNotStarted
            ],
            false
        );
    }

    protected performAction(): void {
        const { character, input } = this.context;
        if (!input?.name) {
            throw new Error("No name provided");
        }

        character.playerName = input.name;
        console.log(`Character name updated to: ${input.name}`);
    }
} 