export type ToolSlug =
    | 'contrato-arrendamiento'
    | 'pagare'
    | 'liquidacion-de-intereses'
    | 'promesa-compraventa'
    | 'accion-de-tutela'
    | 'contrato-laboral';

export interface ToolConfig {
    slug: ToolSlug;
    name: string;
    shortName: string;
    description: string;
    icon: string;
    legalBasis: string;
    href: { landing: string; form: string };
    heroHeadline: { prefix: string; highlight: string; suffix: string };
    heroSubtitle: string;
    trustBadges: Array<{ icon: string; label: string }>;
    howItWorksSteps: Array<{ icon: string; title: string; description: string }>;
    /** Main hero background photo URL */
    heroImage: string;
    /** Lawyer name shown in the floating chat widget */
    heroLawyerName: string;
    /** Specialty + status line (e.g. "Arrendamientos · En línea") */
    heroLawyerSpecialty: string;
    /** Lawyer avatar photo URL */
    heroLawyerAvatar: string;
    /** Message the lawyer says in the chat widget */
    heroChat: string;
    comingSoon?: boolean;
}

export const TOOLS: ToolConfig[] = [
    {
        slug: 'contrato-arrendamiento',
        name: 'Contrato de Arrendamiento',
        shortName: 'Arrendamiento',
        description:
            'Genera contratos de arrendamiento residencial y comercial con validez legal en Colombia. Gratis, sin registro.',
        icon: 'home_work',
        legalBasis: 'Ley 820 de 2003 · Código de Comercio',
        href: {
            landing: 'herramientas/contrato-arrendamiento',
            form: 'herramientas/contrato-arrendamiento/generar',
        },
        heroHeadline: {
            prefix: 'Tu contrato de',
            highlight: 'arrendamiento',
            suffix: 'listo en segundos',
        },
        heroSubtitle:
            'Genera tu contrato gratis con validez legal en Colombia. Vivienda, local comercial u oficina, sin registro, sin letra pequeña. Listo para descargar en PDF.',
        trustBadges: [
            { icon: 'check_circle', label: 'Gratis · Sin registro' },
            { icon: 'verified', label: 'Validez legal garantizada' },
            { icon: 'download', label: 'Descarga en PDF' },
            { icon: 'balance', label: 'Redactado por abogados' },
        ],
        howItWorksSteps: [
            {
                icon: 'edit_note',
                title: 'Rellena el formulario',
                description:
                    'Ingresa los datos del inmueble, arrendador y arrendatario. Solo toma unos segundos y no necesitas registrarte.',
            },
            {
                icon: 'description',
                title: 'Generamos tu contrato',
                description:
                    'El sistema ensambla tu contrato usando plantillas jurídicas validadas por abogados, ajustadas a la Ley 820 de 2003 para vivienda o al Código de Comercio para locales y oficinas.',
            },
            {
                icon: 'picture_as_pdf',
                title: 'Descarga en PDF',
                description:
                    'Revisa tu contrato, descárgalo en PDF y fírmalo. Listo para usar, sin costo y sin trámites adicionales.',
            },
        ],
        heroImage:
            'https://lh3.googleusercontent.com/aida-public/AB6AXuDWv17QOVbfZPk9kO3e46KtKbJzpucPs99OOaVCKHmz2kSkcOdNeEneM_-NRb0z92MAptlBCnGHUtZ9a_zBH9FGGGc3CuUb5FBGZGlifDi5G7uZ5iuyYO4-XH-fNOuHZVEJqpkHIyIpA0sf1h01qqAIy9P5MIEPwc6XnRwYvAVz2exUikaWK2bWALEyVH_2h-FOjnU3mTm7OzCqoq3dSX7sjL8mmij62DeQaz1SBWDPC-d1luqm6r6HJQoOrBM14byZqO3OL7Fk9NVP',
        heroLawyerName: 'Abogada Camila',
        heroLawyerSpecialty: 'Arrendamientos · En línea',
        heroLawyerAvatar:
            'https://lh3.googleusercontent.com/aida-public/AB6AXuBbKs5sbl-utIVdovJPKbQzcWod4y2hOz3kaztBtj7Ls3bW6Kwmulsoiz5mSwSe2xDUiCjKSkRA7MeGhg8cxHWwaNE4sUc7vM8NgEfuyvXUSfK-_8h-qTmuKvgfNs9HM5_6k1bDeqmeqTf_U8nzSQTcle8h9MK-z7KwRb0iVKgWMNIOKIQ6X2NBC1UZSHH2VZf0kPHx6cxsAUtjbnXpTUI6yYFmebZ030BxfSNRfNOqTMagqtzDJ2s7yUHVvK_pWBiCF0Ljmgeen1EQ',
        heroChat: 'Hola, ¿necesitas ayuda con tu contrato de arrendamiento? Estoy disponible.',
    },
    {
        slug: 'pagare',
        name: 'Pagaré',
        shortName: 'Pagaré',
        description:
            'Genera pagarés con validez legal en Colombia. Documento de obligación de pago entre acreedor y deudor, conforme al Código de Comercio.',
        icon: 'receipt_long',
        legalBasis: 'Código de Comercio',
        href: {
            landing: 'herramientas/pagare',
            form: 'herramientas/pagare/generar',
        },
        heroHeadline: {
            prefix: 'Tu pagaré',
            highlight: 'legal',
            suffix: 'listo en segundos',
        },
        heroSubtitle:
            'Genera un pagaré con validez legal en Colombia conforme al Código de Comercio. Sin registro, sin complicaciones. Descarga en PDF.',
        trustBadges: [
            { icon: 'check_circle', label: 'Gratis · Sin registro' },
            { icon: 'verified', label: 'Código de Comercio' },
            { icon: 'download', label: 'Descarga en PDF' },
            { icon: 'balance', label: 'Redactado por abogados' },
        ],
        howItWorksSteps: [
            {
                icon: 'person',
                title: 'Datos del acreedor y deudor',
                description:
                    'Ingresa la información de quien otorga el crédito y de quien se compromete a pagar. Rápido y sencillo.',
            },
            {
                icon: 'payments',
                title: 'Define la obligación',
                description:
                    'Establece el monto, fecha de vencimiento y modalidad de pago (único o cuotas). El sistema adapta el documento automáticamente.',
            },
            {
                icon: 'picture_as_pdf',
                title: 'Descarga en PDF',
                description:
                    'Revisa tu pagaré, descárgalo en PDF y fírmalo. Listo para usar como título valor con plena validez legal.',
            },
        ],
        heroImage: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=800&q=80',
        heroLawyerName: 'Abogado Carlos',
        heroLawyerSpecialty: 'Títulos Valor · En línea',
        heroLawyerAvatar:
            'https://lh3.googleusercontent.com/aida-public/AB6AXuCfp-jh4m6Wbqi9eNLW5obsxwye-auLWzPod3k8AJEROlnlaC_1aesC1FHe7w3PXdQekpmc1AW1_i3T5me0j8M5OUwqa88kbLcNPK3-4JyenI6zUb4QR6Av2Yh4wh10lu4brK_rCWq_2EIcu93vRZ4rWuRPfxhmVwSAVnZVNXWprqEEhh8Pv6fQZO5Hir-sQmpAv-PUqk9Lx0iPvBHpG-Ufxf9VoI2PTL81xeLGJ_9uZ5UabQYR-HFeNlBSdNJxQeWQyU2Tj0VbSAw9',
        heroChat: 'Hola, ¿necesitas generar un pagaré con validez legal? Puedo orientarte.',
    },
    {
        slug: 'liquidacion-de-intereses',
        name: 'Liquidador de Intereses',
        shortName: 'Intereses',
        description:
            'Calcula intereses judiciales corrientes y moratorios con tasas certificadas por la Superintendencia Financiera de Colombia. Gratis, sin registro.',
        icon: 'calculate',
        legalBasis: 'Superfinanciera Colombia',
        href: {
            landing: 'herramientas/liquidacion-de-intereses',
            form: 'herramientas/liquidacion-de-intereses/generar',
        },
        heroHeadline: {
            prefix: 'Liquida tus',
            highlight: 'intereses judiciales',
            suffix: 'en segundos',
        },
        heroSubtitle:
            'Calcula intereses corrientes y moratorios con las tasas oficiales de la Superfinanciera. Sin registro, sin complicaciones. Descarga el reporte en PDF.',
        trustBadges: [
            { icon: 'check_circle', label: 'Gratis · Sin registro' },
            { icon: 'verified', label: 'Tasas Superfinanciera' },
            { icon: 'download', label: 'Reporte en PDF' },
            { icon: 'balance', label: 'Validado por abogados' },
        ],
        howItWorksSteps: [
            {
                icon: 'edit_note',
                title: 'Ingresa la obligación',
                description:
                    'Indica el capital, tipo de interés (corriente o moratorio), fecha de inicio de mora y fecha de pago.',
            },
            {
                icon: 'calculate',
                title: 'Calculamos automáticamente',
                description:
                    'El sistema aplica las tasas certificadas por la Superfinanciera para cada período y genera la liquidación detallada.',
            },
            {
                icon: 'picture_as_pdf',
                title: 'Descarga el reporte',
                description:
                    'Obtén el reporte completo con detalle por período, detalle mensual y advertencias legales, listo para presentar en proceso judicial.',
            },
        ],
        heroImage: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=800&q=80',
        heroLawyerName: 'Abogado Rodrigo',
        heroLawyerSpecialty: 'Litigios civiles · En línea',
        heroLawyerAvatar:
            'https://lh3.googleusercontent.com/aida-public/AB6AXuCfp-jh4m6Wbqi9eNLW5obsxwye-auLWzPod3k8AJEROlnlaC_1aesC1FHe7w3PXdQekpmc1AW1_i3T5me0j8M5OUwqa88kbLcNPK3-4JyenI6zUb4QR6Av2Yh4wh10lu4brK_rCWq_2EIcu93vRZ4rWuRPfxhmVwSAVnZVNXWprqEEhh8Pv6fQZO5Hir-sQmpAv-PUqk9Lx0iPvBHpG-Ufxf9VoI2PTL81xeLGJ_9uZ5UabQYR-HFeNlBSdNJxQeWQyU2Tj0VbSAw9',
        heroChat: 'Hola, ¿necesitas liquidar intereses judiciales? Te ayudo a calcularlo correctamente.',
    },
    {
        slug: 'promesa-compraventa',
        name: 'Promesa de Compraventa',
        shortName: 'Compraventa',
        description:
            'Genera tu promesa de compraventa de inmueble con validez legal en Colombia. Gratis, sin registro, conforme al Codigo Civil.',
        icon: 'real_estate_agent',
        legalBasis: 'Codigo Civil Art. 1611',
        href: {
            landing: 'herramientas/promesa-compraventa',
            form: 'herramientas/promesa-compraventa/generar',
        },
        heroHeadline: {
            prefix: 'Tu promesa de',
            highlight: 'compraventa',
            suffix: 'lista en segundos',
        },
        heroSubtitle:
            'Genera tu promesa de compraventa de inmueble gratis con validez legal en Colombia (Codigo Civil Art. 1611). Sin registro, sin complicaciones. Descarga en PDF.',
        trustBadges: [
            { icon: 'check_circle', label: 'Gratis · Sin registro' },
            { icon: 'verified', label: 'Codigo Civil Art. 1611' },
            { icon: 'download', label: 'Descarga en PDF' },
            { icon: 'balance', label: 'Redactado por abogados' },
        ],
        howItWorksSteps: [
            {
                icon: 'edit_note',
                title: 'Completa los datos',
                description:
                    'Ingresa los datos del vendedor, comprador, inmueble, condiciones economicas y escritura. Solo toma unos segundos.',
            },
            {
                icon: 'description',
                title: 'Generamos tu promesa',
                description:
                    'El sistema ensambla tu promesa de compraventa usando plantillas jurídicas con 18 cláusulas validadas por abogados, ajustadas al Código Civil colombiano.',
            },
            {
                icon: 'picture_as_pdf',
                title: 'Descarga en PDF',
                description:
                    'Revisa tu promesa de compraventa, descargala en PDF y firmala. Lista para usar, sin costo y sin tramites adicionales.',
            },
        ],
        heroImage: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=80',
        heroLawyerName: 'Abogada Laura',
        heroLawyerSpecialty: 'Derecho Inmobiliario · En linea',
        heroLawyerAvatar:
            'https://lh3.googleusercontent.com/aida-public/AB6AXuBbKs5sbl-utIVdovJPKbQzcWod4y2hOz3kaztBtj7Ls3bW6Kwmulsoiz5mSwSe2xDUiCjKSkRA7MeGhg8cxHWwaNE4sUc7vM8NgEfuyvXUSfK-_8h-qTmuKvgfNs9HM5_6k1bDeqmeqTf_U8nzSQTcle8h9MK-z7KwRb0iVKgWMNIOKIQ6X2NBC1UZSHH2VZf0kPHx6cxsAUtjbnXpTUI6yYFmebZ030BxfSNRfNOqTMagqtzDJ2s7yUHVvK_pWBiCF0Ljmgeen1EQ',
        heroChat: 'Hola, ¿necesitas generar una promesa de compraventa? Te guio paso a paso.',
    },
    {
        slug: 'accion-de-tutela',
        name: 'Acción de Tutela',
        shortName: 'Tutela',
        description: 'Genera tu acción de tutela para proteger tus derechos fundamentales. Gratis, sin registro.',
        icon: 'gavel',
        legalBasis: 'Art. 86 Constitución Política',
        href: {
            landing: 'herramientas/accion-de-tutela',
            form: 'herramientas/accion-de-tutela/generar',
        },
        heroHeadline: {
            prefix: 'Tu acción de',
            highlight: 'tutela',
            suffix: 'lista en segundos',
        },
        heroSubtitle:
            'Protege tus derechos fundamentales con una tutela generada por Grexia. Sin registro, sin complicaciones. Lista para presentar ante un juez.',
        trustBadges: [
            { icon: 'check_circle', label: 'Gratis · Sin registro' },
            { icon: 'verified', label: 'Art. 86 Constitución Política' },
            { icon: 'download', label: 'Descarga en PDF' },
            { icon: 'balance', label: 'Redactado por abogados' },
        ],
        howItWorksSteps: [
            {
                icon: 'edit_note',
                title: 'Rellena el formulario',
                description:
                    'Selecciona la temática, ingresa tus datos y cuéntanos qué derecho fue vulnerado. Solo toma unos segundos.',
            },
            {
                icon: 'description',
                title: 'Generamos tu tutela',
                description:
                    'El sistema ensambla tu acción de tutela usando plantillas jurídicas validadas por abogados especializados en derechos fundamentales.',
            },
            {
                icon: 'picture_as_pdf',
                title: 'Descarga y presenta',
                description:
                    'Descarga el PDF y preséntalo ante cualquier juzgado. Tienes 48 horas para la primera respuesta.',
            },
        ],
        heroImage: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=800&q=80',
        heroLawyerName: 'Abogada Sofía',
        heroLawyerSpecialty: 'Derechos Fundamentales · En línea',
        heroLawyerAvatar:
            'https://lh3.googleusercontent.com/aida-public/AB6AXuBbKs5sbl-utIVdovJPKbQzcWod4y2hOz3kaztBtj7Ls3bW6Kwmulsoiz5mSwSe2xDUiCjKSkRA7MeGhg8cxHWwaNE4sUc7vM8NgEfuyvXUSfK-_8h-qTmuKvgfNs9HM5_6k1bDeqmeqTf_U8nzSQTcle8h9MK-z7KwRb0iVKgWMNIOKIQ6X2NBC1UZSHH2VZf0kPHx6cxsAUtjbnXpTUI6yYFmebZ030BxfSNRfNOqTMagqtzDJ2s7yUHVvK_pWBiCF0Ljmgeen1EQ',
        heroChat: 'Hola, ¿vulneraron alguno de tus derechos fundamentales? Te ayudo a preparar tu tutela.',
    },
    {
        slug: 'contrato-laboral',
        name: 'Contrato Laboral',
        shortName: 'Laboral',
        description:
            'Genera contratos de trabajo a término fijo y por obra o labor con validez legal en Colombia. Gratis, sin registro.',
        icon: 'work',
        legalBasis: 'Código Sustantivo del Trabajo',
        href: {
            landing: 'herramientas/contrato-laboral',
            form: 'herramientas/contrato-laboral/generar',
        },
        heroHeadline: {
            prefix: 'Tu contrato',
            highlight: 'laboral',
            suffix: 'listo en segundos',
        },
        heroSubtitle:
            'Genera tu contrato de trabajo con validez legal en Colombia (Código Sustantivo del Trabajo). Sin registro, sin letra pequeña. Listo para descargar en PDF.',
        trustBadges: [
            { icon: 'check_circle', label: 'Gratis · Sin registro' },
            { icon: 'verified', label: 'Cód. Sust. del Trabajo' },
            { icon: 'download', label: 'Descarga en PDF' },
            { icon: 'balance', label: 'Redactado por abogados' },
        ],
        howItWorksSteps: [
            {
                icon: 'article',
                title: 'Elige el tipo de contrato',
                description:
                    'Selecciona entre contrato a término fijo o por obra y labor. Ambos con plena validez legal en Colombia.',
            },
            {
                icon: 'edit_note',
                title: 'Ingresa los datos',
                description:
                    'Completa los datos del empleador, trabajador y las condiciones laborales. Solo toma unos segundos.',
            },
            {
                icon: 'picture_as_pdf',
                title: 'Descarga en PDF',
                description:
                    'Revisa tu contrato, descárgalo en PDF y fírmalo. Listo para usar, sin costo y sin trámites adicionales.',
            },
        ],
        heroImage: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=800&q=80',
        heroLawyerName: 'Abogado Andrés',
        heroLawyerSpecialty: 'Derecho Laboral · En línea',
        heroLawyerAvatar:
            'https://lh3.googleusercontent.com/aida-public/AB6AXuCfp-jh4m6Wbqi9eNLW5obsxwye-auLWzPod3k8AJEROlnlaC_1aesC1FHe7w3PXdQekpmc1AW1_i3T5me0j8M5OUwqa88kbLcNPK3-4JyenI6zUb4QR6Av2Yh4wh10lu4brK_rCWq_2EIcu93vRZ4rWuRPfxhmVwSAVnZVNXWprqEEhh8Pv6fQZO5Hir-sQmpAv-PUqk9Lx0iPvBHpG-Ufxf9VoI2PTL81xeLGJ_9uZ5UabQYR-HFeNlBSdNJxQeWQyU2Tj0VbSAw9',
        heroChat: 'Hola, ¿necesitas generar un contrato laboral? Te ayudo a crearlo correctamente.',
    },
];

export function getToolBySlug(slug: ToolSlug): ToolConfig | undefined {
    return TOOLS.find((t) => t.slug === slug);
}
