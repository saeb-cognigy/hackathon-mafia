import { Character } from './abstract';
import { StartGameAction, AssignRolesAction, EnterNightAction } from './actions';

export class ModeratorCharacter extends Character {
    constructor(label: string, name?: string) {
        super(label, name);
        this._is_valid = true;
        this.addAction(new StartGameAction());
        this.addAction(new AssignRolesAction());
        this.addAction(new EnterNightAction());
    }

    take_action(): void {
        console.log(`Moderator ${this.label} (ID: ${this.id}) is monitoring the game`);
    }
}

export class DetectiveCharacter extends Character {
    constructor(label: string, name?: string) {
        super(label, name);
        this._is_valid = true;
        // TODO: Add detective-specific actions
    }

    take_action(): void {
        console.log(`Detective ${this.label} is investigating`);
    }
}

export class MafiaCharacter extends Character {
    constructor(label: string, name?: string) {
        super(label, name);
        this._is_valid = true;
        // TODO: Add mafia-specific actions
    }

    take_action(): void {
        console.log(`Mafia ${this.label} is plotting`);
    }
}

export class DoctorCharacter extends Character {
    constructor(label: string, name?: string) {
        super(label, name);
        this._is_valid = true;
        // TODO: Add doctor-specific actions
    }

    take_action(): void {
        console.log(`Doctor ${this.label} is healing`);
    }
}

export class VillagerCharacter extends Character {
    constructor(label: string, name?: string) {
        super(label, name);
        this._is_valid = true;
        // TODO: Add villager-specific actions
    }

    take_action(): void {
        console.log(`Villager ${this.label} is participating`);
    }
}

export class PlaceHolderCharacter extends Character {
    constructor(label: string, name?: string) {
        super(label, name);
    }

    take_action(): void {
        throw new Error("You can not run take_action()");
    }
} 