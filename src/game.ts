import { Character } from './abstract';
import { DayTime, dayTime } from './variables';

class Game {
    private admin: any;
    private characters: Character[];
    private dayTime: DayTime;

    constructor(admin: any) {
        this.admin = admin;
        this.characters = [];
        this.dayTime = dayTime; // Initialize with the default dayTime
    }

    // Helper methods to manage game statde
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
}

export { Game }; 