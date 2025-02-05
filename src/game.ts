import { Character } from './abstract';
import { ModeratorCharacter, PlaceHolderCharacter } from './characters';
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
}

export { Game }; 