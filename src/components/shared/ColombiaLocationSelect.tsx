import { useState, useEffect } from 'react';
import { Combobox, ComboboxInput, ComboboxOptions, ComboboxOption } from '@headlessui/react';

interface Department {
    id: number;
    name: string;
}

interface City {
    id: number;
    name: string;
}

interface ColombiaLocationSelectProps {
    value: string;
    onChange: (cityName: string) => void;
    onDepartmentChange?: (deptName: string) => void;
    idPrefix: string;
    cityLabel?: string;
    error?: string;
}

// Module-level cache so departments are only fetched once per page load
let cachedDepartments: Department[] | null = null;

const inputClass =
    'h-12 w-full rounded-[12px] border border-slate-200 bg-white px-4 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed';

const optionsClass =
    'z-50 w-[var(--input-width)] rounded-[8px] border border-slate-200 bg-white shadow-lg max-h-48 overflow-y-auto focus:outline-none empty:invisible';

const optionClass =
    'cursor-pointer select-none px-4 py-2.5 text-sm text-slate-700 data-focus:bg-slate-50 data-selected:font-semibold data-selected:text-secondary';

export default function ColombiaLocationSelect({
    value,
    onChange,
    onDepartmentChange,
    idPrefix,
    cityLabel = 'Ciudad / Municipio',
    error,
}: ColombiaLocationSelectProps) {
    const [departments, setDepartments] = useState<Department[]>(cachedDepartments ?? []);
    const [cities, setCities] = useState<City[]>([]);
    const [selectedDept, setSelectedDept] = useState<Department | null>(null);
    const [deptQuery, setDeptQuery] = useState('');
    const [cityQuery, setCityQuery] = useState('');
    const [loadingDepts, setLoadingDepts] = useState(!cachedDepartments);
    const [loadingCities, setLoadingCities] = useState(false);
    const [deptError, setDeptError] = useState(false);

    useEffect(() => {
        if (cachedDepartments) return;
        fetch('https://api-colombia.com/api/v1/Department')
            .then((r) => r.json())
            .then((data: Department[]) => {
                const sorted = data.sort((a, b) => a.name.localeCompare(b.name, 'es'));
                cachedDepartments = sorted;
                setDepartments(sorted);
                setLoadingDepts(false);
            })
            .catch(() => {
                setLoadingDepts(false);
                setDeptError(true);
            });
    }, []);

    const filteredDepts =
        deptQuery === ''
            ? departments
            : departments.filter((d) => d.name.toLowerCase().includes(deptQuery.toLowerCase()));

    const filteredCities =
        cityQuery === '' ? cities : cities.filter((c) => c.name.toLowerCase().includes(cityQuery.toLowerCase()));

    const handleDeptChange = (dept: Department | null) => {
        setSelectedDept(dept);
        onChange('');
        setCities([]);
        if (onDepartmentChange) onDepartmentChange(dept?.name ?? '');

        if (!dept) return;

        setLoadingCities(true);
        fetch(`https://api-colombia.com/api/v1/Department/${dept.id}/cities`)
            .then((r) => r.json())
            .then((data: City[]) => {
                setCities(data.sort((a, b) => a.name.localeCompare(b.name, 'es')));
                setLoadingCities(false);
            })
            .catch(() => setLoadingCities(false));
    };

    const handleCityChange = (city: City | null) => {
        onChange(city?.name ?? '');
    };

    const selectedCity = cities.find((c) => c.name === value) ?? null;

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Departamento */}
            <div className="flex flex-col gap-1.5">
                <label
                    htmlFor={`${idPrefix}-dept`}
                    className="text-sm font-semibold text-slate-700"
                >
                    Departamento
                </label>
                <Combobox
                    value={selectedDept}
                    onChange={handleDeptChange}
                    onClose={() => setDeptQuery('')}
                >
                    <ComboboxInput
                        id={`${idPrefix}-dept`}
                        className={inputClass}
                        displayValue={(dept: Department | null) => dept?.name ?? ''}
                        onChange={(e) => setDeptQuery(e.target.value)}
                        placeholder={loadingDepts ? 'Cargando...' : 'Buscar departamento...'}
                        disabled={loadingDepts}
                        autoComplete="off"
                    />
                    <ComboboxOptions
                        anchor="bottom start"
                        modal={false}
                        className={optionsClass}
                    >
                        {filteredDepts.map((d) => (
                            <ComboboxOption
                                key={d.id}
                                value={d}
                                className={optionClass}
                            >
                                {d.name}
                            </ComboboxOption>
                        ))}
                        {filteredDepts.length === 0 && (
                            <p className="px-4 py-2.5 text-sm text-slate-400">Sin resultados</p>
                        )}
                    </ComboboxOptions>
                </Combobox>
                {deptError && <p className="text-xs text-red-500 mt-1">No se pudo cargar los departamentos.</p>}
            </div>

            {/* Ciudad */}
            <div className="flex flex-col gap-1.5">
                <label
                    htmlFor={`${idPrefix}-city`}
                    className="text-sm font-semibold text-slate-700"
                >
                    {cityLabel}
                </label>
                <Combobox
                    value={selectedCity}
                    onChange={handleCityChange}
                    onClose={() => setCityQuery('')}
                    disabled={!selectedDept || loadingCities}
                >
                    <ComboboxInput
                        id={`${idPrefix}-city`}
                        className={inputClass}
                        displayValue={(city: City | null) => city?.name ?? ''}
                        onChange={(e) => setCityQuery(e.target.value)}
                        placeholder={
                            !selectedDept
                                ? 'Selecciona un departamento'
                                : loadingCities
                                  ? 'Cargando...'
                                  : 'Buscar ciudad...'
                        }
                        autoComplete="off"
                    />
                    <ComboboxOptions
                        anchor="bottom start"
                        modal={false}
                        className={optionsClass}
                    >
                        {filteredCities.map((c) => (
                            <ComboboxOption
                                key={c.id}
                                value={c}
                                className={optionClass}
                            >
                                {c.name}
                            </ComboboxOption>
                        ))}
                        {filteredCities.length === 0 && (
                            <p className="px-4 py-2.5 text-sm text-slate-400">Sin resultados</p>
                        )}
                    </ComboboxOptions>
                </Combobox>
                {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
            </div>
        </div>
    );
}
