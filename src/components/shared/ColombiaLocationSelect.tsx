import { useState, useEffect } from 'react';

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
    idPrefix: string;
    cityLabel?: string;
    error?: string;
}

// Module-level cache so departments are only fetched once per page load
let cachedDepartments: Department[] | null = null;

const fieldClass =
    'h-12 w-full rounded-[12px] border border-slate-200 bg-white px-4 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed';

export default function ColombiaLocationSelect({
    value,
    onChange,
    idPrefix,
    cityLabel = 'Ciudad / Municipio',
    error,
}: ColombiaLocationSelectProps) {
    const [departments, setDepartments] = useState<Department[]>(cachedDepartments ?? []);
    const [cities, setCities] = useState<City[]>([]);
    const [selectedDeptId, setSelectedDeptId] = useState<number | ''>('');
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

    const handleDeptChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const deptId = e.target.value ? parseInt(e.target.value, 10) : '';
        setSelectedDeptId(deptId);
        onChange('');
        setCities([]);

        if (!deptId) return;

        setLoadingCities(true);
        fetch(`https://api-colombia.com/api/v1/Department/${deptId}/cities`)
            .then((r) => r.json())
            .then((data: City[]) => {
                setCities(data.sort((a, b) => a.name.localeCompare(b.name, 'es')));
                setLoadingCities(false);
            })
            .catch(() => {
                setLoadingCities(false);
            });
    };

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
                <select
                    id={`${idPrefix}-dept`}
                    value={selectedDeptId}
                    onChange={handleDeptChange}
                    disabled={loadingDepts}
                    className={fieldClass}
                >
                    <option value="">{loadingDepts ? 'Cargando...' : 'Seleccionar...'}</option>
                    {departments.map((d) => (
                        <option
                            key={d.id}
                            value={d.id}
                        >
                            {d.name}
                        </option>
                    ))}
                </select>
                {deptError && (
                    <p className="text-xs text-red-500 mt-1">No se pudo cargar los departamentos.</p>
                )}
            </div>

            {/* Ciudad */}
            <div className="flex flex-col gap-1.5">
                <label
                    htmlFor={`${idPrefix}-city`}
                    className="text-sm font-semibold text-slate-700"
                >
                    {cityLabel}
                </label>
                <select
                    id={`${idPrefix}-city`}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    disabled={!selectedDeptId || loadingCities}
                    className={fieldClass}
                >
                    <option value="">
                        {!selectedDeptId
                            ? 'Selecciona un departamento'
                            : loadingCities
                              ? 'Cargando...'
                              : 'Seleccionar...'}
                    </option>
                    {cities.map((c) => (
                        <option
                            key={c.id}
                            value={c.name}
                        >
                            {c.name}
                        </option>
                    ))}
                </select>
                {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
            </div>
        </div>
    );
}
