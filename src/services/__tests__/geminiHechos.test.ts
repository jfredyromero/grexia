import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { generarHechosConIA } from '../geminiHechos';
import { generarTextoHechos } from '../../components/tutela/tutelaUtils';
import type { TutelaFormData } from '../../components/tutela/types';
import { INITIAL_TUTELA_DATA } from '../../components/tutela/types';

// ── Datos de prueba ────────────────────────────────────────────────────────────

const datosDePrueba: TutelaFormData = {
    ...INITIAL_TUTELA_DATA,
    nombreCompleto: 'María Camila Torres',
    cedula: '1023456789',
    ciudad: 'Bogotá D.C.',
    telefono: '3001234567',
    correo: 'maria@test.com',
    nombreEPS: 'Sura EPS',
    regimen: 'contributivo',
    sedeEPS: 'Bogotá D.C.',
    diagnostico: 'Diabetes tipo 2',
    servicioNegado: 'Insulina Glargina 100 UI/mL',
    tipoNegativa: 'no_autorizacion',
    fechaNegativa: '2024-03-15',
    historiaClinica: 'Paciente con diabetes desde hace 5 años.',
    tieneMedicoTratante: 'si',
    nombreMedico: 'Dr. Carlos Pérez',
    condicionesVulnerabilidad: ['enfermedad_cronica'],
    impactoSaludVida: 'Sin insulina mi glucosa sube a niveles peligrosos.',
    afectaTrabajo: 'si',
    descripcionImpactoTrabajo: 'No puedo trabajar como docente.',
    afectaFamilia: 'no',
    tipoPretension: 'medicamento',
    detalleEspecifico: 'Insulina Glargina 100 UI/mL, 5 cartuchos mensuales',
    numeroSolicitudes: 3,
    documentosGuia: ['historia_clinica', 'carta_negativa'],
};

// ── Helpers ────────────────────────────────────────────────────────────────────

function geminiOkResponse(text: string): Response {
    return new Response(JSON.stringify({ candidates: [{ content: { parts: [{ text }] } }] }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
    });
}

function capturePromptFromFetch(): string {
    const [, options] = vi.mocked(fetch).mock.calls[0];
    const body = JSON.parse(options?.body as string) as {
        contents: Array<{ parts: Array<{ text: string }> }>;
    };
    return body.contents[0].parts[0].text;
}

// ── Suite ─────────────────────────────────────────────────────────────────────

describe('generarHechosConIA', () => {
    beforeEach(() => {
        vi.stubGlobal('fetch', vi.fn());
    });

    afterEach(() => {
        vi.unstubAllGlobals();
        vi.unstubAllEnvs();
    });

    // ── Sin API key ────────────────────────────────────────────────────────────

    describe('sin API key configurada', () => {
        beforeEach(() => {
            vi.stubEnv('PUBLIC_GEMINI_API_KEY', '');
        });

        it('retorna el texto estático sin llamar a la API', async () => {
            const resultado = await generarHechosConIA(datosDePrueba);
            const fallback = generarTextoHechos(datosDePrueba);

            expect(resultado).toBe(fallback);
            expect(fetch).not.toHaveBeenCalled();
        });

        it('el texto estático contiene datos clave del caso', async () => {
            const resultado = await generarHechosConIA(datosDePrueba);

            expect(resultado).toContain('Sura EPS');
            expect(resultado).toContain('Diabetes tipo 2');
        });
    });

    // ── Con API key ────────────────────────────────────────────────────────────

    describe('con API key configurada', () => {
        beforeEach(() => {
            vi.stubEnv('PUBLIC_GEMINI_API_KEY', 'test-api-key-123');
        });

        it('llama al endpoint de Gemini con la key en la URL', async () => {
            vi.mocked(fetch).mockResolvedValueOnce(geminiOkResponse('Texto generado.'));

            await generarHechosConIA(datosDePrueba);

            expect(fetch).toHaveBeenCalledOnce();
            const [url] = vi.mocked(fetch).mock.calls[0] as [string, RequestInit];
            expect(url).toContain('generativelanguage.googleapis.com');
            expect(url).toContain('test-api-key-123');
            expect(url).toContain('gemini-2.5-flash-lite');
        });

        it('usa el método POST con Content-Type application/json', async () => {
            vi.mocked(fetch).mockResolvedValueOnce(geminiOkResponse('Texto.'));

            await generarHechosConIA(datosDePrueba);

            const [, options] = vi.mocked(fetch).mock.calls[0] as [string, RequestInit];
            expect(options.method).toBe('POST');
            expect((options.headers as Record<string, string>)['Content-Type']).toBe('application/json');
        });

        it('el prompt incluye la regla de no usar placeholders entre corchetes', async () => {
            vi.mocked(fetch).mockResolvedValueOnce(geminiOkResponse('Texto.'));

            await generarHechosConIA(datosDePrueba);

            const prompt = capturePromptFromFetch();
            expect(prompt).toContain('NUNCA uses placeholders entre corchetes');
        });

        it('el prompt incluye los datos clave del caso (EPS, diagnóstico, servicio)', async () => {
            vi.mocked(fetch).mockResolvedValueOnce(geminiOkResponse('Texto.'));

            await generarHechosConIA(datosDePrueba);

            const prompt = capturePromptFromFetch();
            expect(prompt).toContain('Sura EPS');
            expect(prompt).toContain('Diabetes tipo 2');
            expect(prompt).toContain('Insulina Glargina 100 UI/mL');
        });

        it('el prompt incluye el nombre del médico tratante', async () => {
            vi.mocked(fetch).mockResolvedValueOnce(geminiOkResponse('Texto.'));

            await generarHechosConIA(datosDePrueba);

            const prompt = capturePromptFromFetch();
            expect(prompt).toContain('Dr. Carlos Pérez');
        });

        it('retorna el texto del primer candidato de Gemini con trim()', async () => {
            const textoConEspacios = '  Párrafo 1.\n\nPárrafo 2.  ';
            vi.mocked(fetch).mockResolvedValueOnce(geminiOkResponse(textoConEspacios));

            const resultado = await generarHechosConIA(datosDePrueba);

            expect(resultado).toBe('Párrafo 1.\n\nPárrafo 2.');
        });

        it('lanza error con el status cuando la respuesta HTTP no es exitosa', async () => {
            vi.mocked(fetch).mockResolvedValueOnce(new Response('Too Many Requests', { status: 429 }));

            await expect(generarHechosConIA(datosDePrueba)).rejects.toThrow('429');
        });

        it('lanza error cuando la respuesta no contiene candidatos', async () => {
            vi.mocked(fetch).mockResolvedValueOnce(
                new Response(JSON.stringify({ candidates: [] }), {
                    status: 200,
                    headers: { 'Content-Type': 'application/json' },
                })
            );

            await expect(generarHechosConIA(datosDePrueba)).rejects.toThrow();
        });

        it('lanza error cuando el texto del candidato está vacío o solo espacios', async () => {
            vi.mocked(fetch).mockResolvedValueOnce(geminiOkResponse('   '));

            await expect(generarHechosConIA(datosDePrueba)).rejects.toThrow('Respuesta vacía de Gemini');
        });

        it('el body del request incluye generationConfig con temperature y maxOutputTokens', async () => {
            vi.mocked(fetch).mockResolvedValueOnce(geminiOkResponse('Texto.'));

            await generarHechosConIA(datosDePrueba);

            const [, options] = vi.mocked(fetch).mock.calls[0] as [string, RequestInit];
            const body = JSON.parse(options.body as string) as {
                generationConfig: { temperature: number; maxOutputTokens: number };
            };
            expect(body.generationConfig.temperature).toBeGreaterThan(0);
            expect(body.generationConfig.maxOutputTokens).toBeGreaterThan(0);
        });
    });
});
