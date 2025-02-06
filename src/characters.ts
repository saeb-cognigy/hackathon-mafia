import { Character } from './abstract';
import { StartGameAction, AssignRolesAction, EnterNightAction, UpdateCharacterNameAction } from './actions';

// Common actions that all characters should have
const commonActions = [
    new UpdateCharacterNameAction()
];

export class ModeratorCharacter extends Character {
    constructor(label: string, name?: string) {
        super(label, name);
        this._is_valid = true;
        
        // Add moderator-specific actions
        this.addAction(new StartGameAction());
        this.addAction(new AssignRolesAction());
        this.addAction(new EnterNightAction());
        
        // Add common actions
        commonActions.forEach(action => this.addAction(action));
    }

    take_action(): void {
        console.log(`Moderator ${this.label} (ID: ${this.id}) is monitoring the game`);
    }
}

export class DetectiveCharacter extends Character {
    constructor(label: string, name?: string) {
        super(label, name);
        this._is_valid = true;
        commonActions.forEach(action => this.addAction(action));
    }

    take_action(): void {
        console.log(`Detective ${this.label} is investigating`);
    }
}

export class MafiaCharacter extends Character {
    constructor(label: string, name?: string) {
        super(label, name);
        this._is_valid = true;
        commonActions.forEach(action => this.addAction(action));
    }

    take_action(): void {
        console.log(`Mafia ${this.label} is plotting`);
    }
}

export class DoctorCharacter extends Character {
    constructor(label: string, name?: string) {
        super(label, name);
        this._is_valid = true;
        commonActions.forEach(action => this.addAction(action));
    }

    take_action(): void {
        console.log(`Doctor ${this.label} is healing`);
    }
}

export class VillagerCharacter extends Character {
    constructor(label: string, name?: string) {
        super(label, name);
        this._is_valid = true;
        commonActions.forEach(action => this.addAction(action));
    }

    take_action(): void {
        console.log(`Villager ${this.label} is participating`);
    }
}

export class PlaceHolderCharacter extends Character {
    constructor(label: string, name?: string) {
        super(label, name);
        commonActions.forEach(action => this.addAction(action));
    }

    take_action(): void {
        throw new Error("You can not run take_action()");
    }
} 