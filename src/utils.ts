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

export type FilteredLibraryObject = {
    score: number;
    object: LibraryObject;
}

export type LibraryObject = {
    id: string;
    name: string;
    object_type: string;
    material: string;
    object_placement: string;
    ifc_type: string;
    ifc_file_path: string;
    units: Record<string, any>;
    property_sets: Record<string, any>;
};