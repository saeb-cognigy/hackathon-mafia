import { Character } from './abstract';

class Doctor extends Character {
    take_action(): void {
        console.log(`Doctor ${this.name} is treating patients`);
    }
}

export { Doctor }; 