import { Character } from './abstract';
import { StartGameAction, AssignRolesAction } from './actions';

export class ModeratorCharacter extends Character {
    constructor(name: string) {
        super(name);
        this.is_valid = true;
        this.addAction(new StartGameAction());
        this.addAction(new AssignRolesAction());
    }

    take_action(): void {
        console.log(`Moderator ${this.name} (ID: ${this.id}) is monitoring the game`);
    }
}

export class DetectiveCharacter extends Character {
    constructor(name: string) {
        super(name);
        this.is_valid = true;
        // TODO: Add detective-specific actions
    }

    take_action(): void {
        console.log(`Detective ${this.name} is investigating`);
    }
}

export class MafiaCharacter extends Character {
    constructor(name: string) {
        super(name);
        this.is_valid = true;
        // TODO: Add mafia-specific actions
    }

    take_action(): void {
        console.log(`Mafia ${this.name} is plotting`);
    }
}

export class DoctorCharacter extends Character {
    constructor(name: string) {
        super(name);
        this.is_valid = true;
        // TODO: Add doctor-specific actions
    }

    take_action(): void {
        console.log(`Doctor ${this.name} is healing`);
    }
}

export class VillagerCharacter extends Character {
    constructor(name: string) {
        super(name);
        this.is_valid = true;
        // TODO: Add villager-specific actions
    }

    take_action(): void {
        console.log(`Villager ${this.name} is participating`);
    }
}

export class PlaceHolderCharacter extends Character {
    constructor(name: string) {
        super(name);
    }

    take_action(): void {
        throw new Error("You can not run take_action()");
    }
} 