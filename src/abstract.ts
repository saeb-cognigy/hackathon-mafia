import crypto from 'crypto';
import { Game } from './game';  // Add import for Game type

class ActionNotPossibleError extends Error {
    constructor(actionName: string, reason: string) {
        super(`Cannot execute ${actionName}: ${reason}`);
        this.name = 'ActionNotPossibleError';
    }
}

abstract class Character {
    protected label: string;
    protected name: string;
    protected id: string;
    protected allowed_actions: Action[];
    protected _is_valid: boolean;  // Rename to _is_valid
    protected turn_taken: boolean;

    constructor(label: string, name?: string) {
        this.label = label;
        this.name = name || `Player${Math.floor(Math.random() * 1000)}`;  // Default name if not provided
        this.id = crypto.randomUUID();  // Auto-generate unique ID on construction
        this.allowed_actions = [];
        this._is_valid = false;  // Initialize as false
        this.turn_taken = false;  // Initialize as false
    }

    getId(): string {
        return this.id;
    }

    getLabel(): string {
        return this.label;
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
                label: this.label,
                name: this.name,
                type: this.constructor.name.replace('Character', ''),
                is_valid: this.is_valid,
                turn_taken: this.turn_taken,
                actions: this.allowed_actions.map(action => ({
                    name: action.name,
                    description: action.description,
                    is_callable: action.checkConditions(),
                    required: action.required
                }))
            }
        }
        return JSON.stringify(data);
    }

    get is_valid(): boolean {
        return this._is_valid;
    }

    abstract take_action(): void;

    get playerName(): string {
        return this.name;
    }

    set playerName(newName: string) {
        if (!newName || newName.trim().length === 0) {
            throw new Error("Name cannot be empty");
        }
        this.name = newName.trim();
    }

    get hasTakenTurn(): boolean {
        return this.turn_taken;
    }

    set hasTakenTurn(value: boolean) {
        this.turn_taken = value;
    }
}

abstract class Action {
    protected _name: string;
    protected _description: string;
    protected conditions: ((context: Record<string, any>) => boolean)[];
    protected readonly isRequired: boolean;
    public context: Record<string, any>;

    constructor(
        name: string, 
        description: string, 
        conditions: ((context: Record<string, any>) => boolean)[],
        isRequired: boolean = true
    ) {
        this._name = name;
        this._description = description;
        this.conditions = conditions;
        this.isRequired = isRequired;
        this.context = {};
    }

    get name(): string {
        return this._name;
    }

    get description(): string {
        return this._description;
    }

    get required(): boolean {
        return this.isRequired;
    }

    checkConditions(): boolean {
        return this.conditions.every(condition => condition(this.context));
    }

    execute(input?: Record<string, any>): void {
        if (input) {
            this.context.input = input;
        }
        
        if (this.checkConditions()) {
            this.performAction();
        } else {
            throw new ActionNotPossibleError(this.name, "conditions not met");
        }
    }

    protected abstract performAction(): void;
}

export { Character, Action, ActionNotPossibleError }; 