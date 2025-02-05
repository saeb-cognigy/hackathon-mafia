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
    protected _is_valid: boolean;  // Rename to _is_valid

    constructor(name: string) {
        this.name = name;
        this.id = crypto.randomUUID();  // Auto-generate unique ID on construction
        this.allowed_actions = [];
        this._is_valid = false;  // Initialize as false
    }

    getId(): string {
        return this.id;
    }

    getName(): string {
        return this.name;
    }

    addAction(action: Action): void {
        action.context.character =  this;
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
                    name: action.name,
                    description: action.description,
                    is_callable: action.checkConditions()
                }))
            }
        }
        return JSON.stringify(data);
    }

    get is_valid(): boolean {
        return this._is_valid;
    }

    abstract take_action(): void;
}

abstract class Action {
    protected _name: string;
    protected _description: string;
    protected conditions: ((character?: Character, game?: Game) => boolean)[];
    public context: Record<string, any>;  // Public context object for action-specific data

    constructor(name: string, description: string, conditions: ((character?: Character, game?: Game) => boolean)[]) {
        this._name = name;
        this._description = description;
        this.conditions = conditions;
        this.context = {};  // Initialize empty context
    }

    get name(): string {
        return this._name;
    }

    get description(): string {
        return this._description;
    }

    checkConditions(): boolean {
        return this.conditions.every(condition => condition());
    }

    execute(): void {
        if (this.checkConditions()) {
            this.performAction();
        } else {
            throw new ActionNotPossibleError(this.name, "conditions not met");
        }
    }

    protected abstract performAction(): void;
}

export { Character, Action, ActionNotPossibleError }; 