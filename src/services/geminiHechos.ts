import type { TutelaFormData } from '../components/tutela/types';
import {
    getEPSDisplay,
    getTipoNegativaLabel,
    getTipoPretensionLabel,
    getVulnerabilidadTexto,
    formatFecha,
    generarTextoHechos,
} from '../components/tutela/tutelaUtils';

const GEMINI_MODEL = 'gemini-2.5-flash-lite';
const GEMINI_URL = (key: string) =>
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${key}`;

function buildPrompt(data: TutelaFormData): string {
    const eps = getEPSDisplay(data);
    const regimen = data.regimen === 'contributivo' ? 'régimen contributivo' : 'régimen subsidiado';
    const tipoNeg = getTipoNegativaLabel(data.tipoNegativa);
    const vulnerabilidad = getVulnerabilidadTexto(data);
    const pretension =
        data.tipoPretension === 'otro' ? data.otraPretension : getTipoPretensionLabel(data.tipoPretension);
    const medicoInfo =
        data.tieneMedicoTratante === 'si' && data.nombreMedico
            ? `Médico tratante asignado: ${data.nombreMedico}`
            : 'Sin médico tratante especificado';

    return `Eres un abogado colombiano experto en acciones de tutela de salud. Redacta la sección de HECHOS de una acción de tutela en Colombia, en español formal y jurídico, en primera persona (el accionante habla). La sección debe tener exactamente 5 párrafos separados por doble salto de línea, sin numerarlos, sin encabezados, sin viñetas.

DATOS DEL CASO:
- Nombre del accionante: ${data.nombreCompleto || 'el accionante'}
- EPS accionada: ${eps}
- Régimen de afiliación: ${regimen}
- Ciudad de domicilio: ${data.ciudad || 'Colombia'}
- Diagnóstico médico: ${data.diagnostico || 'condición médica que requiere atención urgente'}
- Historia clínica relevante: ${data.historiaClinica || 'no detallada'}
- ${medicoInfo}
- Servicio, procedimiento o medicamento negado: ${data.servicioNegado || 'servicio médico requerido'}
- Tipo de negativa recibida: ${tipoNeg}
- Fecha aproximada de la negativa: ${formatFecha(data.fechaNegativa)}
- Condiciones de vulnerabilidad del accionante: ${vulnerabilidad || 'ninguna condición especial indicada'}
- Impacto en salud y vida: ${data.impactoSaludVida || 'afectación grave e irreversible a la salud'}
- Afectación laboral: ${data.afectaTrabajo === 'si' ? data.descripcionImpactoTrabajo || 'sí afecta su actividad laboral' : 'no aplica'}
- Afectación familiar: ${data.afectaFamilia === 'si' ? data.descripcionImpactoFamilia || 'sí afecta su núcleo familiar' : 'no aplica'}
- Pretensión principal: ${pretension || 'autorización inmediata del servicio médico'}
- Detalle específico de lo solicitado: ${data.detalleEspecifico || 'el servicio médico requerido por el médico tratante'}
- Número de solicitudes previas sin respuesta favorable: ${data.numeroSolicitudes}

ESTRUCTURA OBLIGATORIA — 5 párrafos en este orden:

PÁRRAFO 1 — CALIDAD DE AFILIADO Y VULNERABILIDAD: Redacta un párrafo extenso que exponga la calidad de afiliado(a) a la EPS, el régimen de afiliación, y todas las condiciones de vulnerabilidad que caracterizan al accionante como sujeto de especial protección constitucional. Si hay condiciones de vulnerabilidad, exagera su relevancia jurídica.

PÁRRAFO 2 — HISTORIA CLÍNICA Y NEGATIVA: Redacta un párrafo detallado con el diagnóstico médico, los antecedentes relevantes de la historia clínica, el nombre del médico tratante si aplica, y la negativa específica de la EPS indicando la fecha y la forma precisa en que ocurrió. Describe los hechos de forma cronológica y precisa.

PÁRRAFO 3 — IMPACTO INTEGRAL EN LA VIDA DEL ACCIONANTE: Redacta un párrafo extenso y contundente sobre cómo la negativa afecta gravemente la salud, la vida, la integridad personal, la dignidad humana, la actividad laboral y el núcleo familiar del accionante. Enfatiza la urgencia, el riesgo de daño irreversible y la vulneración de la vida digna.

PÁRRAFO 4 — RESPONSABILIDAD DIRECTA DE LA EPS: Redacta un párrafo que argumente por qué la EPS es directamente responsable de la vulneración, describiendo las omisiones, acciones negligentes y el incumplimiento de sus obligaciones legales y constitucionales. Menciona que tiene la obligación legal de garantizar los servicios de salud del accionante.

PÁRRAFO 5 — GARANTÍA DE DERECHOS Y ANTECEDENTES: Redacta un párrafo sobre cómo se puede garantizar la protección de los derechos vulnerados (con la entrega/autorización del servicio solicitado), mencionando explícitamente el número de solicitudes previas presentadas sin obtener respuesta favorable, y la urgencia de la intervención judicial.

REGLA CRÍTICA: NUNCA uses placeholders entre corchetes como [Número de Cédula], [Número de Afiliación], [dato desconocido] ni ninguna variante similar. Si no tienes un dato específico, omítelo por completo y redacta la oración sin hacer ninguna referencia a él. El documento debe leerse como si todos los datos estuvieran completos.

Responde ÚNICAMENTE con los 5 párrafos separados por doble salto de línea. Sin texto adicional antes ni después, sin encabezados, sin numeración, sin comillas.`;
}

export async function generarHechosConIA(data: TutelaFormData): Promise<string> {
    const apiKey = import.meta.env.PUBLIC_GEMINI_API_KEY as string | undefined;

    if (!apiKey) {
        return generarTextoHechos(data);
    }

    const prompt = buildPrompt(data);

    const response = await fetch(GEMINI_URL(apiKey), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
                temperature: 0.65,
                maxOutputTokens: 2048,
            },
        }),
    });

    if (!response.ok) {
        const errorBody = await response.text().catch(() => '');
        throw new Error(`Gemini API error ${response.status}: ${errorBody}`);
    }

    const result = await response.json();
    const text = result?.candidates?.[0]?.content?.parts?.[0]?.text as string | undefined;

    if (!text?.trim()) {
        throw new Error('Respuesta vacía de Gemini');
    }

    return text.trim();
}
