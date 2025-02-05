import { Character } from './abstract';
import { ModeratorCharacter, PlaceHolderCharacter, DetectiveCharacter, MafiaCharacter, DoctorCharacter, VillagerCharacter } from './characters';
import { DayTime, dayTime } from './variables';

class Game {
    private moderator: Character | null;
    private characters: Character[];
    private dayTime: DayTime;

    constructor() {
        this.moderator = null;
        this.characters = [];
        this.dayTime = dayTime;
    }

    setModerator(moderator: ModeratorCharacter): void {
        if (this.moderator !== null) {
            throw new Error("Moderator already set");
        }
        this.moderator = moderator;
        this.addCharacter(moderator);
    }

    getModerator(): Character | null {
        return this.moderator;
    }

    // Helper methods to manage game state
    addCharacter(character: Character): void {
        this.characters.push(character);
    }

    setDayTime(newTime: DayTime): void {
        this.dayTime = newTime;
    }

    getCharacters(): Character[] {
        return this.characters;
    }

    getDayTime(): DayTime {
        return this.dayTime;
    }

    createModerator(): ModeratorCharacter {
        if (this.moderator !== null) {
            throw new Error("Moderator already set");
        }
        
        const moderator = new ModeratorCharacter("GameMaster");
        this.setModerator(moderator);
        return moderator;
    }

    createPlaceholderCharacter(name?: string): PlaceHolderCharacter {
        const placeholder = new PlaceHolderCharacter(name || "NewPlayer");
        this.addCharacter(placeholder);
        return placeholder;
    }

    hasModerator(): boolean {
        return this.moderator !== null;
    }

    removeCharacter(characterId: string): void {
        // Remove from characters array
        this.characters = this.characters.filter(char => char.getId() !== characterId);
        
        // Check if moderator was removed
        if (this.moderator && this.moderator.getId() === characterId) {
            this.moderator = null;
        }
    }

    replaceCharacter(oldCharacterId: string, newRole: string): void {
        const index = this.characters.findIndex(char => char.getId() === oldCharacterId);
        if (index === -1) {
            throw new Error("Character not found");
        }

        const oldCharacter = this.characters[index];
        const newCharacter = this.createCharacterByRole(newRole, oldCharacter.getName(), oldCharacterId);
        this.characters[index] = newCharacter;
    }

    private createCharacterByRole(role: string, name: string, id: string): Character {
        let character: Character;
        
        switch (role) {
            case 'Detective':
                character = new DetectiveCharacter(name);
                break;
            case 'Doctor':
                character = new DoctorCharacter(name);
                break;
            case 'Mafia':
                character = new MafiaCharacter(name);
                break;
            case 'Villager':
                character = new VillagerCharacter(name);
                break;
            default:
                throw new Error(`Unknown role: ${role}`);
        }

        // Override the auto-generated ID with the old ID
        Object.defineProperty(character, 'id', {
            value: id,
            writable: false,
            configurable: true
        });

        return character;
    }
}

export { Game }; 