export class Rationals {
    constructor(numer, denom) {
        // find the greatest common divisor to normalize the rational
        // apply Euclid's algorithm for GCD finding:
        // Given |a| >= |b|, find r = a % b, if r = 0, then b is the GCD,
        // otherwise assign a <- b, b <- r
        let a = Math.abs(numer);
        let b = Math.abs(denom);
        while (b !== 0) {
            // note if a < b, the first iteration will result in that r == a, thus swapping a and b
            let r = a % b;
            a = b;
            b = r;
        }
        // upon completion of while loop, the GCD is held in a
        this.gcd = a;
        if (denom < 0 && numer > 0) {
            // ensure the negative sign is on the numerator
            this.numerator = -(numer / a);
            this.denominator = -(denom / a);
        } else {
            this.numerator = numer / a;
            this.denominator = denom / a;
        }
    }

    // reduces the fraction to normalized representation
    reduce() {
        // since already stored in normalized form, just set the gcd to 1 to "reduce" the fraction
        this.gcd = 1;
    }

    // display the rational for debugging purposes
    display(reduced) {
        if (this.denominator !== 1) {
            if (reduced) {
                return `${this.numerator}/${this.denominator}`;
            } else {
                return `${this.numerator*this.gcd}/${this.denominator*this.gcd}`;
            }
            
        } else {
            return `${this.numerator}`;
        }
    }

    // return the rational to display properly in html
    toString() {
        if (this.denominator !== 1) {
            return `<sup>${this.numerator*this.gcd}</sup>&frasl;<sub>${this.denominator*this.gcd}</sub>`;
        } else {
            return `${this.numerator}`;
        }
    }

    // equal if and only if the numerators and denominators in normalized representation are equal
    equals(to_compare) {
        return (this.numerator === to_compare.numerator) && (this.denominator === to_compare.denominator);
    }

    add(addend) {
        let new_denom = this.denominator*addend.denominator;
        let new_numer = this.numerator*addend.denominator + addend.numerator*this.denominator;
        return new Rationals(new_numer, new_denom);
    }

    // negate the subtrahend and call add
    sub(subtrahend) {
        let negated_subtrahend = new Rationals(-(subtrahend.numerator), subtrahend.denominator);
        return this.add(negated_subtrahend);
    }

    mul(multiplier) {
        return new Rationals(this.numerator*multiplier.numerator, this.denominator*multiplier.denominator);
    }

    // take reciprocal of divisor and call mul
    div(divisor) {
        let reciprocal = new Rationals(divisor.denominator, divisor.numerator);
        return this.mul(reciprocal);
    }

    static max(num_1, num_2) {
        let diff = num_1.sub(num_2);
        if (diff.numerator > 0) {
            return num_1;
        } else {
            return num_2;
        }
    }

    static min(num_1, num_2) {
        let diff = num_1.sub(num_2);
        if (diff.numerator > 0) {
            return num_2;
        } else {
            return num_1;
        }
    }
}