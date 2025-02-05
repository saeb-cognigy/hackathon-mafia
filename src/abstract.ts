import crypto from 'crypto';

class ActionNotPossibleError extends Error {
    constructor(actionName: string, reason: string) {
        super(`Cannot execute ${actionName}: ${reason}`);
        this.name = 'ActionNotPossibleError';
    }
}

abstract class Character {
    protected name: string;
    protected id: string;

    constructor(name: string) {
        this.name = name;
        this.id = crypto.randomUUID();  // Auto-generate unique ID on construction
    }

    getId(): string {
        return this.id;
    }

    abstract take_action(): void;
}

abstract class Action {
    protected name: string;
    protected description: string;
    protected conditions: (() => boolean)[];

    constructor(name: string, description: string, conditions: (() => boolean)[]) {
        this.name = name;
        this.description = description;
        this.conditions = conditions;
    }

    private checkConditions(): boolean {
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