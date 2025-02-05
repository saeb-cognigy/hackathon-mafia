import crypto from 'crypto';
import { Game } from './game';  // Add import for Game type

class ActionNotPossibleError extends Error {
    constructor(actionName: string, reason: string) {
        super(`Cannot execute ${actionName}: ${reason}`);
        this.name = 'ActionNotPossibleError';
    }
}

abstract class Character {
    protected name: string;
    protected id: string;
    protected allowed_actions: Action[];
    protected is_valid: boolean;

    constructor(name: string) {
        this.name = name;
        this.id = crypto.randomUUID();  // Auto-generate unique ID on construction
        this.allowed_actions = [];
        this.is_valid = false;  // False by default
    }

    getId(): string {
        return this.id;
    }

    addAction(action: Action): void {
        this.allowed_actions.push(action);
    }

    getActions(): Action[] {
        return this.allowed_actions;
    }

    toJSON(): string {
        const data = {
            type: 'character_info',
            character: {
                id: this.id,
                name: this.name,
                type: this.constructor.name.replace('Character', ''),
                is_valid: this.is_valid,
                actions: this.allowed_actions.map(action => ({
                    name: action['name'],
                    description: action['description']
                }))
            }
        }
        return JSON.stringify(data);
    }

    abstract take_action(): void;
}

abstract class Action {
    protected name: string;
    protected description: string;
    protected conditions: ((character?: Character) => boolean)[];

    constructor(name: string, description: string, conditions: ((character?: Character) => boolean)[]) {
        this.name = name;
        this.description = description;
        this.conditions = conditions;
    }

    private checkConditions(character?: Character): boolean {
        return this.conditions.every(condition => condition(character));
    }

    execute(game: Game, character?: Character): void {
        if (this.checkConditions(character)) {
            this.performAction(game);
        } else {
            throw new ActionNotPossibleError(this.name, "conditions not met");
        }
    }

    protected abstract performAction(game: Game): void;
}

export { Character, Action, ActionNotPossibleError }; 