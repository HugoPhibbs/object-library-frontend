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

export interface FilteredLibraryResult<T> {
    score: number;
    data: T;
}

export type LibraryObjectData = {
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

export type LibraryConnectionData = {
    connection: {
        bolts: {
            diameter: number,
            total_bottom: number,
            total_top: number
        },
        cleat: {
            length: number,
            thickness: number
            width: number
        },
        fillet_welds: {
            flange: number,
            web: string
        },
    },
    design_capacity: {
        moment_bottom: number,
        moment_top: number,
        shear_capacity: number
    }
    connection_type: string,
    id: string,
    mass: number,
    moment: number,
    shear: number,
    section: string,
}