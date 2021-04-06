class BrainfuckInterpreter {
    constructor(program, inputs, max = 100) {
        this.inputs = inputs;
        this.program = program;
        this.escapeChars();

        this.max = max - 1;

        this.values = [0];
        this.index = 0;
        this.output = '';

        this.errors = [];
    }

    escapeChars() {
        this.program = this.program.match(/[.,><\+\-\[\]]+/g).join('');
    }

    execute() {
        const instructions = this.calculateBrackets(
            this.program.split('')
        );

        if(this.hasError()) {
            return this.getError();
        }

        instructions.forEach(instruction => {
            this.doInstruction(instruction);
        });

        return this.getOutput();
    }

    doInstruction(instruction) {
        switch(instruction) {
            case '+':
                this.incrementValue();
                break;
            case '-':
                this.decrementValue();
                break;
            case '.':
                this.outputChar();
                break;
            case ',':
                this.setValue(this.getInput());
                break;
            case '>':
                this.pointerPlus();
                break;
            case '<':
                this.pointerMin();
                break;
        }

        if(Array.isArray(instruction)) {
            this.doLoop(instruction);
        }
    }

    getOutput() {
        return this.hasError()?this.getError():this.output;
    }

    doLoop(instructions) {
        while(true) {
            instructions.forEach(instruction => {
                this.doInstruction(instruction);
            });

            if(this.getValue() === 0) {
                break;
            }
        }
    }

    calculateBrackets(instructions) {
        let instructionTree = [];
        let bracketCount = 0;
        instructions.forEach(instruction => {
            if(instruction === '[') {
                if(bracketCount === 0) {
                    instructionTree.push([]);
                    bracketCount++;
                    return;
                } else {
                    bracketCount++;
                }
            }

            if(instruction === ']') {
                bracketCount--;
            }

            if(bracketCount > 0) {
                instructionTree[instructionTree.length - 1].push(instruction);
                return;
            }

            if(instruction !== ']') {
                instructionTree.push(instruction);
            }
        });

        if(bracketCount !== 0) {
            this.errors.push('SYNTAX ERROR');
            return null;
        }

        instructionTree = instructionTree.map(treeItem => {
            if(Array.isArray(treeItem)) {
                return this.calculateBrackets(treeItem);
            }
            return treeItem
        });

        return instructionTree
    }

    getError() {
        if(this.errors.length === 0) {
            return null;
        }
        return this.errors[0];
    }

    hasError() {
        return this.errors.length > 0;
    }

    checkIndex() {
        if(this.index > this.values.length - 1) {
            this.values[this.index] = 0;
        }
    }

    setValue(value) {
        this.values[this.index] = value;
    }

    getValue() {
        return this.values[this.index];
    }

    getChar(number) {
        return String.fromCharCode(number);
    }

    getInput() {
        return this.inputs.shift();
    }

    incrementValue() {
        this.checkIndex();
        if(this.getValue() >= 255) {
            this.errors.push('INCORRECT VALUE');
            return;
        }

        this.setValue(
            this.getValue() + 1
        );
    }

    decrementValue() {
        this.checkIndex();
        if(this.getValue() <= 0) {
            this.errors.push('INCORRECT VALUE');
            return;
        }
        this.setValue(
            this.getValue() - 1
        );
    }

    outputChar() {
        this.checkIndex();
        const char = this.getChar(this.getValue());
        this.output+=char;
    }

    pointerPlus() {
        if(this.index >= this.max) {
            this.errors.push("POINTER OUT OF BOUNDS");
            return;
        }
        this.index++;
    }

    pointerMin() {
        if(this.index<=0) {
            this.errors.push("POINTER OUT OF BOUNDS");
            return;
        }
        this.index--;
    }
}
