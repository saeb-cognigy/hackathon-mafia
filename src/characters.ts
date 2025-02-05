import { Character } from './abstract';

class Doctor extends Character {
    take_action(): void {
        console.log(`Doctor ${this.name} is treating patients`);
    }
}

class ModeratorCharacter extends Character {
    constructor(name: string) {
        super(name);
    }

    take_action(): void {
        console.log(`Moderator ${this.name} (ID: ${this.id}) is monitoring the game`);
    }
}

class PlaceHolderCharacter extends Character {
    constructor(name: string) {
        super(name);
    }

    take_action(): void {
        throw new Error("You can not run take_action()");
    }
}

export { Doctor, ModeratorCharacter, PlaceHolderCharacter }; 