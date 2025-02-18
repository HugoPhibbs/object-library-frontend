export function booleanToYesNo(value: boolean): string {
    return value ? "Yes" : "No";
}

export enum UnitsToString {
    WEIGHT = "kg",
    LENGTH = "mm",
    AREA = "m^2",
    ELECTRIC_ENERGY = "kWh",
    TENSILE_STRENGTH = "MPa/mm^2",
    WARPING_CONSTANT = "mm^6",
    MODULUS = "MPa",
    VOLUME = "m^3",
    TIME_YEARS = "yrs"
}