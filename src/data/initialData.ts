import type { Company, DocumentControl, UserAccount, CheckRecord } from '../types';

export const INITIAL_COMPANIES: Company[] = [
  // EMPRESA 1: HERBARIUM
  {
    id: 'comp-herbarium',
    name: 'Herbarium',
    tradeName: 'Herbarium Laboratório Botânico Ltda.',
    cnpj: '78.950.040/0001-20',
    documentCodePrefix: 'HLB',
    primaryColor: 'emerald',
    logoUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 60"><rect width="240" height="60" rx="12" fill="%23064e3b"/><g transform="translate(15, 10)"><rect width="40" height="40" rx="10" fill="%23059669"/><path d="M20 8 C14 16, 12 28, 20 34 C28 28, 26 16, 20 8 Z M12 20 C18 22, 22 26, 20 32 M28 20 C22 22, 18 26, 20 32" fill="none" stroke="%23a7f3d0" stroke-width="2.5" stroke-linecap="round"/></g><text x="70" y="38" font-family="serif" font-size="28" font-weight="bold" fill="%23ffffff" letter-spacing="-0.5">herbarium</text></svg>',
    createdAt: '2024-01-15T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z',
    controls: [
      // MODELO 1: O MODELO OFICIAL DA IMAGEM
      {
        id: 'ctrl-almox-prod-mod3',
        companyId: 'comp-herbarium',
        title: 'REGISTRO DE LIMPEZA ALMOXARIFADO E PRODUÇÃO MÓDULO 3',
        docCode: 'HLB-ANX-0025',
        revision: 'Rv. 2',
        pageInfo: 'Pág: 1 de 2',
        popRef: 'Ref.: HLB-POP-ENG-0048',
        emissionDate: '10/05/2024',
        companyName: 'herbarium',
        documentType: 'ANEXO CONTROLADO',
        confidentialText: 'Documento confidencial e de propriedade HLB. Proibida sua reprodução total ou parcial.',
        createdAt: '2024-05-10T00:00:00.000Z',
        updatedAt: '2026-09-01T00:00:00.000Z',
        sectors: [
          { id: 'sec-almoxarifado', name: 'DIÁRIO – ALMOXARIFADO/EXPEDIÇÃO', category: 'DIARIO_ALMOXARIFADO', color: 'emerald' },
          { id: 'sec-producao', name: 'DIÁRIO - PRODUÇÃO', category: 'DIARIO_PRODUCAO', color: 'blue' },
          { id: 'sec-semanal', name: 'SEMANAL', category: 'SEMANAL', color: 'purple' }
        ],
        tasks: [
          {
            id: 'task-1',
            code: 'ALM-01',
            name: 'Bebedouro',
            sectorId: 'sec-almoxarifado',
            recurrence: 'DAILY',
            scheduledTime: '08:00',
            toleranceMinutes: 45,
            description: 'Higienização e desinfecção de bicos e bandejas do bebedouro.',
            popRef: 'HLB-POP-ENG-0048',
            qrPayload: 'HLB-CHECK:comp-herbarium:ctrl-almox-prod-mod3:ALM-01:BEBEDOURO',
            active: true
          },
          {
            id: 'task-2',
            code: 'ALM-02',
            name: 'Piso Epoxi: todos os corredores',
            sectorId: 'sec-almoxarifado',
            recurrence: 'DAILY',
            scheduledTime: '08:30',
            toleranceMinutes: 60,
            description: 'Varrição úmida e aplicação de detergente neutro nos corredores de piso epóxi.',
            popRef: 'HLB-POP-ENG-0048',
            qrPayload: 'HLB-CHECK:comp-herbarium:ctrl-almox-prod-mod3:ALM-02:PISO_EPOXI',
            active: true
          },
          {
            id: 'task-3',
            code: 'ALM-03',
            name: 'Vidros, Visores e Maçanetas',
            sectorId: 'sec-almoxarifado',
            recurrence: 'DAILY',
            scheduledTime: '09:00',
            toleranceMinutes: 45,
            description: 'Limpeza de superfícies de contato com álcool 70%.',
            popRef: 'HLB-POP-ENG-0048',
            qrPayload: 'HLB-CHECK:comp-herbarium:ctrl-almox-prod-mod3:ALM-03:VIDROS_MACANETAS',
            active: true
          },
          {
            id: 'task-4',
            code: 'ALM-04',
            name: 'Reposição e Resíduos',
            sectorId: 'sec-almoxarifado',
            recurrence: 'DAILY',
            scheduledTime: '10:00',
            toleranceMinutes: 30,
            description: 'Retirada de sacos de lixo e reposição de papel toalha e sabonete.',
            popRef: 'HLB-POP-ENG-0048',
            qrPayload: 'HLB-CHECK:comp-herbarium:ctrl-almox-prod-mod3:ALM-04:REPOSICAO_RESIDUOS',
            active: true
          },
          {
            id: 'task-5',
            code: 'ALM-05',
            name: 'Docas de entrada e saída de materiais',
            sectorId: 'sec-almoxarifado',
            recurrence: 'DAILY',
            scheduledTime: '11:00',
            toleranceMinutes: 60,
            description: 'Higienização de chão e contenções da área de recebimento/expedição.',
            popRef: 'HLB-POP-ENG-0048',
            qrPayload: 'HLB-CHECK:comp-herbarium:ctrl-almox-prod-mod3:ALM-05:DOCAS',
            active: true
          },
          {
            id: 'task-6',
            code: 'ALM-06',
            name: 'Salas adm',
            sectorId: 'sec-almoxarifado',
            recurrence: 'DAILY',
            scheduledTime: '13:30',
            toleranceMinutes: 60,
            description: 'Limpeza das mesas, pisos e lixeiras das salas administrativas.',
            popRef: 'HLB-POP-ENG-0048',
            qrPayload: 'HLB-CHECK:comp-herbarium:ctrl-almox-prod-mod3:ALM-06:SALAS_ADM',
            active: true
          },
          {
            id: 'task-7',
            code: 'ALM-07',
            name: 'Amostragem',
            sectorId: 'sec-almoxarifado',
            recurrence: 'DAILY',
            scheduledTime: '14:30',
            toleranceMinutes: 30,
            description: 'Desinfecção de bancadas e piso da sala de amostragem de matérias-primas.',
            popRef: 'HLB-POP-ENG-0048',
            qrPayload: 'HLB-CHECK:comp-herbarium:ctrl-almox-prod-mod3:ALM-07:AMOSTRAGEM',
            active: true
          },
          {
            id: 'task-8',
            code: 'ALM-08',
            name: 'SPY012',
            sectorId: 'sec-almoxarifado',
            recurrence: 'DAILY',
            scheduledTime: '15:30',
            toleranceMinutes: 30,
            description: 'Limpeza técnica e checagem de integridade do equipamento SPY012.',
            popRef: 'HLB-POP-ENG-0048',
            qrPayload: 'HLB-CHECK:comp-herbarium:ctrl-almox-prod-mod3:ALM-08:SPY012',
            active: true
          },
          {
            id: 'task-9',
            code: 'PRD-01',
            name: 'Corredor e eclusas (teto, paredes e chão) - primária',
            sectorId: 'sec-producao',
            recurrence: 'DAILY',
            scheduledTime: '07:30',
            toleranceMinutes: 45,
            description: 'Sanitização completa com sanitizante grau farmacêutico.',
            popRef: 'HLB-POP-ENG-0048',
            qrPayload: 'HLB-CHECK:comp-herbarium:ctrl-almox-prod-mod3:PRD-01:ECLUSAS_PRIMARIA',
            active: true
          },
          {
            id: 'task-10',
            code: 'PRD-02',
            name: 'Área secundária',
            sectorId: 'sec-producao',
            recurrence: 'DAILY',
            scheduledTime: '08:45',
            toleranceMinutes: 45,
            description: 'Higienização de pisos e bancadas da área secundária.',
            popRef: 'HLB-POP-ENG-0048',
            qrPayload: 'HLB-CHECK:comp-herbarium:ctrl-almox-prod-mod3:PRD-02:AREA_SECUNDARIA',
            active: true
          },
          {
            id: 'task-11',
            code: 'PRD-03',
            name: 'Reposição e Resíduos',
            sectorId: 'sec-producao',
            recurrence: 'DAILY',
            scheduledTime: '11:30',
            toleranceMinutes: 30,
            description: 'Descarte seguro de resíduos do processo produtivo e reposição de insumos.',
            popRef: 'HLB-POP-ENG-0048',
            qrPayload: 'HLB-CHECK:comp-herbarium:ctrl-almox-prod-mod3:PRD-03:RESIDUOS_PRODUCAO',
            active: true
          },
          {
            id: 'task-12',
            code: 'PRD-04',
            name: 'Portas Basculantes',
            sectorId: 'sec-producao',
            recurrence: 'DAILY',
            scheduledTime: '16:00',
            toleranceMinutes: 30,
            description: 'Limpeza e inspeção de vedação e maçanetas das portas basculantes.',
            popRef: 'HLB-POP-ENG-0048',
            qrPayload: 'HLB-CHECK:comp-herbarium:ctrl-almox-prod-mod3:PRD-04:PORTAS_BASCULANTES',
            active: true
          },
          {
            id: 'task-13',
            code: 'SEM-01',
            name: 'Divisórias, Paredes internas e Portas Verificação de sujidades (insetos, teia de aranha etc.)',
            sectorId: 'sec-semanal',
            recurrence: 'WEEKLY',
            daysOfWeek: [5],
            scheduledTime: '14:00',
            toleranceMinutes: 120,
            description: 'Inspeção minuciosa contra insetos, teias e sujidades acumuladas.',
            popRef: 'HLB-POP-ENG-0048',
            qrPayload: 'HLB-CHECK:comp-herbarium:ctrl-almox-prod-mod3:SEM-01:INSPECAO_DIVISORIAS',
            active: true
          },
          {
            id: 'task-14',
            code: 'SEM-02',
            name: 'Sala de Higienização',
            sectorId: 'sec-semanal',
            recurrence: 'WEEKLY',
            daysOfWeek: [3],
            scheduledTime: '15:00',
            toleranceMinutes: 120,
            description: 'Limpeza pesada e desincrustação dos tanques e ralos da sala de higienização.',
            popRef: 'HLB-POP-ENG-0048',
            qrPayload: 'HLB-CHECK:comp-herbarium:ctrl-almox-prod-mod3:SEM-02:SALA_HIGIENIZACAO',
            active: true
          }
        ]
      },

      // MODELO 2: CONTROLE DE QUALIDADE E LABORATÓRIOS
      {
        id: 'ctrl-lab-cq-mod1',
        companyId: 'comp-herbarium',
        title: 'REGISTRO DE HIGIENIZAÇÃO E SANITIZAÇÃO - LABORATÓRIOS E CQ',
        docCode: 'HLB-ANX-0026',
        revision: 'Rv. 1',
        pageInfo: 'Pág: 1 de 1',
        popRef: 'Ref.: HLB-POP-CQ-0015',
        emissionDate: '15/08/2024',
        companyName: 'herbarium',
        documentType: 'ANEXO CONTROLADO',
        confidentialText: 'Documento confidencial e de propriedade HLB. Proibida sua reprodução total ou parcial.',
        createdAt: '2024-08-15T00:00:00.000Z',
        updatedAt: '2026-09-01T00:00:00.000Z',
        sectors: [
          { id: 'sec-lab-fisico', name: 'DIÁRIO - LAB. FÍSICO-QUÍMICO', category: 'CUSTOM', color: 'cyan' },
          { id: 'sec-lab-micro', name: 'DIÁRIO - LAB. MICROBIOLOGIA', category: 'CUSTOM', color: 'indigo' },
          { id: 'sec-lab-semanal', name: 'SEMANAL - DESINFECÇÃO PROFUNDA', category: 'SEMANAL', color: 'rose' }
        ],
        tasks: [
          {
            id: 'task-cq-01',
            code: 'CQ-01',
            name: 'Bancadas de Titulação e pH',
            sectorId: 'sec-lab-fisico',
            recurrence: 'DAILY',
            scheduledTime: '07:45',
            toleranceMinutes: 30,
            description: 'Limpeza das bancadas analíticas com água destilada e etanol 70%.',
            popRef: 'HLB-POP-CQ-0015',
            qrPayload: 'HLB-CHECK:comp-herbarium:ctrl-lab-cq-mod1:CQ-01:BANCADAS_FQ',
            active: true
          },
          {
            id: 'task-cq-02',
            code: 'CQ-02',
            name: 'Capelas de Exaustão',
            sectorId: 'sec-lab-fisico',
            recurrence: 'DAILY',
            scheduledTime: '08:30',
            toleranceMinutes: 30,
            description: 'Descontaminação do interior e visores das capelas.',
            popRef: 'HLB-POP-CQ-0015',
            qrPayload: 'HLB-CHECK:comp-herbarium:ctrl-lab-cq-mod1:CQ-02:CAPELAS',
            active: true
          },
          {
            id: 'task-cq-03',
            code: 'CQ-03',
            name: 'Balanças Analíticas de Precisão',
            sectorId: 'sec-lab-fisico',
            recurrence: 'DAILY',
            scheduledTime: '09:00',
            toleranceMinutes: 20,
            description: 'Limpeza do prato e câmara de pesagem com pincel antiestático.',
            popRef: 'HLB-POP-CQ-0015',
            qrPayload: 'HLB-CHECK:comp-herbarium:ctrl-lab-cq-mod1:CQ-03:BALANCAS',
            active: true
          },
          {
            id: 'task-cq-04',
            code: 'CQ-04',
            name: 'Fluxo Laminar e Eclusa Micro',
            sectorId: 'sec-lab-micro',
            recurrence: 'DAILY',
            scheduledTime: '08:00',
            toleranceMinutes: 20,
            description: 'Radiação UV por 15 min e aspersão de álcool 70% estéril.',
            popRef: 'HLB-POP-CQ-0015',
            qrPayload: 'HLB-CHECK:comp-herbarium:ctrl-lab-cq-mod1:CQ-04:FLUXO_LAMINAR',
            active: true
          },
          {
            id: 'task-cq-05',
            code: 'CQ-05',
            name: 'Estufas de Incubação e Autoclave',
            sectorId: 'sec-lab-micro',
            recurrence: 'DAILY',
            scheduledTime: '13:00',
            toleranceMinutes: 45,
            description: 'Inspeção térmica e desinfecção externa dos equipamentos.',
            popRef: 'HLB-POP-CQ-0015',
            qrPayload: 'HLB-CHECK:comp-herbarium:ctrl-lab-cq-mod1:CQ-05:ESTUFAS',
            active: true
          },
          {
            id: 'task-cq-06',
            code: 'CQ-06',
            name: 'Sanitização Completa de Tetos e Paredes',
            sectorId: 'sec-lab-semanal',
            recurrence: 'WEEKLY',
            daysOfWeek: [5],
            scheduledTime: '16:00',
            toleranceMinutes: 120,
            description: 'Aplicação de sanitizante quaternário de amônio.',
            popRef: 'HLB-POP-CQ-0015',
            qrPayload: 'HLB-CHECK:comp-herbarium:ctrl-lab-cq-mod1:CQ-06:SANITIZACAO_TETO_PAREDE',
            active: true
          }
        ]
      },

      // MODELO 3: INSPEÇÃO DE CÂMARAS FRIAS E ENVASE
      {
        id: 'ctrl-envase-camaras',
        companyId: 'comp-herbarium',
        title: 'CONTROLE DE HIGIENE E INSPEÇÃO DE ENVASE E CÂMARAS',
        docCode: 'HLB-ANX-0027',
        revision: 'Rv. 0',
        pageInfo: 'Pág: 1 de 1',
        popRef: 'Ref.: HLB-POP-PRD-0089',
        emissionDate: '01/02/2025',
        companyName: 'herbarium',
        documentType: 'ANEXO CONTROLADO',
        confidentialText: 'Documento confidencial e de propriedade HLB. Proibida sua reprodução total ou parcial.',
        createdAt: '2025-02-01T00:00:00.000Z',
        updatedAt: '2026-09-01T00:00:00.000Z',
        sectors: [
          { id: 'sec-envase', name: 'DIÁRIO - LINHA DE ENVASE', category: 'CUSTOM', color: 'teal' },
          { id: 'sec-camaras', name: 'DIÁRIO - CÂMARAS CLIMATIZADAS', category: 'CUSTOM', color: 'sky' }
        ],
        tasks: [
          {
            id: 'task-env-01',
            code: 'ENV-01',
            name: 'Esteira de Frascos e Enchedora',
            sectorId: 'sec-envase',
            recurrence: 'DAILY',
            scheduledTime: '07:00',
            toleranceMinutes: 30,
            description: 'Sanitização das guias e bicos de dosagem antes do lote.',
            popRef: 'HLB-POP-PRD-0089',
            qrPayload: 'HLB-CHECK:comp-herbarium:ctrl-envase-camaras:ENV-01:ESTEIRA_ENCHEDORA',
            active: true
          },
          {
            id: 'task-env-02',
            code: 'ENV-02',
            name: 'Rotuladora e Fechadora de Caixas',
            sectorId: 'sec-envase',
            recurrence: 'DAILY',
            scheduledTime: '11:00',
            toleranceMinutes: 30,
            description: 'Remoção de resíduos de cola e poeira de papelão.',
            popRef: 'HLB-POP-PRD-0089',
            qrPayload: 'HLB-CHECK:comp-herbarium:ctrl-envase-camaras:ENV-02:ROTULADORA',
            active: true
          },
          {
            id: 'task-env-03',
            code: 'CAM-01',
            name: 'Câmara Fria 01 (2°C a 8°C)',
            sectorId: 'sec-camaras',
            recurrence: 'DAILY',
            scheduledTime: '08:30',
            toleranceMinutes: 45,
            description: 'Conferência de termo-higrômetro e higienização das portas.',
            popRef: 'HLB-POP-PRD-0089',
            qrPayload: 'HLB-CHECK:comp-herbarium:ctrl-envase-camaras:CAM-01:CAMARA_01',
            active: true
          },
          {
            id: 'task-env-04',
            code: 'CAM-02',
            name: 'Câmara Climatizada 02 (15°C a 25°C)',
            sectorId: 'sec-camaras',
            recurrence: 'DAILY',
            scheduledTime: '09:30',
            toleranceMinutes: 45,
            description: 'Checagem de temperatura e ausência de condensação.',
            popRef: 'HLB-POP-PRD-0089',
            qrPayload: 'HLB-CHECK:comp-herbarium:ctrl-envase-camaras:CAM-02:CAMARA_02',
            active: true
          }
        ]
      },

      // MODELO 4: REGISTRO DE LIMPEZA SANITÁRIOS (HLB-ANX-0003) - MULTI-HORÁRIO
      {
        id: 'ctrl-sanitarios-hlb-0003',
        companyId: 'comp-herbarium',
        title: 'REGISTRO DE LIMPEZA SANITÁRIOS',
        docCode: 'HLB-ANX-0003',
        revision: 'Rv. 2',
        pageInfo: 'Pág: 1 de 2',
        popRef: 'Ref.: HLB-POP-ENG-0047',
        emissionDate: '10/05/2024',
        companyName: 'herbarium',
        documentType: 'ANEXO CONTROLADO',
        confidentialText: 'Documento confidencial e de propriedade HLB. Proibida sua reprodução total ou parcial.',
        createdAt: '2024-05-10T00:00:00.000Z',
        updatedAt: '2026-09-03T00:00:00.000Z',
        sectors: [
          {
            id: 'sec-abastecimento',
            name: 'ABASTECIMENTO',
            category: 'CUSTOM',
            color: 'emerald'
          }
        ],
        tasks: [
          {
            id: 'task-san-01',
            code: 'ABAST-01',
            name: 'Papel Higiênico',
            sectorId: 'sec-abastecimento',
            recurrence: 'DAILY',
            scheduledTime: '09:30',
            scheduledTimes: ['09:30', '14:00', '16:00'],
            toleranceMinutes: 45,
            description: 'Verificação e reposição de papel higiênico nos suportes.',
            popRef: 'Ref.: HLB-POP-ENG-0047',
            qrPayload: 'HLB-CHECK:comp-herbarium:ctrl-sanitarios-hlb-0003:ABAST-01:PAPEL_HIGIENICO',
            active: true
          },
          {
            id: 'task-san-02',
            code: 'ABAST-02',
            name: 'Papel Toalha',
            sectorId: 'sec-abastecimento',
            recurrence: 'DAILY',
            scheduledTime: '09:30',
            scheduledTimes: ['09:30', '14:00', '16:00'],
            toleranceMinutes: 45,
            description: 'Abastecimento dos dispensers de papel toalha interfolhado.',
            popRef: 'Ref.: HLB-POP-ENG-0047',
            qrPayload: 'HLB-CHECK:comp-herbarium:ctrl-sanitarios-hlb-0003:ABAST-02:PAPEL_TOALHA',
            active: true
          },
          {
            id: 'task-san-03',
            code: 'ABAST-03',
            name: 'Sabonete líquido',
            sectorId: 'sec-abastecimento',
            recurrence: 'DAILY',
            scheduledTime: '09:30',
            scheduledTimes: ['09:30', '14:00', '16:00'],
            toleranceMinutes: 45,
            description: 'Nível e recarga de sabonete líquido antibacteriano nos dosadores.',
            popRef: 'Ref.: HLB-POP-ENG-0047',
            qrPayload: 'HLB-CHECK:comp-herbarium:ctrl-sanitarios-hlb-0003:ABAST-03:SABONETE_LIQUIDO',
            active: true
          }
        ]
      }
    ]
  },

  // EMPRESA 2: PHARMATECH
  {
    id: 'comp-pharmatech',
    name: 'PharmaTech',
    tradeName: 'PharmaTech Soluções Farmacêuticas S/A',
    cnpj: '12.345.678/0001-90',
    documentCodePrefix: 'PHT',
    primaryColor: 'blue',
    logoUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 60"><rect width="240" height="60" rx="12" fill="%231e3a8a"/><g transform="translate(15, 10)"><rect width="40" height="40" rx="10" fill="%232563eb"/><path d="M12 20 L28 20 M20 12 L20 28 M14 26 L26 14" stroke="%2393c5fd" stroke-width="3" stroke-linecap="round"/></g><text x="70" y="38" font-family="sans-serif" font-size="24" font-weight="900" fill="%23ffffff" letter-spacing="0">PHARMATECH</text></svg>',
    createdAt: '2024-06-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z',
    controls: [
      {
        id: 'ctrl-pht-cleanroom',
        companyId: 'comp-pharmatech',
        title: 'CHECKLIST DE CONTROLE DE SALAS LIMPAS CLASSE B E C',
        docCode: 'PHT-ANX-0010',
        revision: 'Rv. 3',
        pageInfo: 'Pág: 1 de 1',
        popRef: 'Ref.: PHT-POP-GAR-0022',
        emissionDate: '01/03/2025',
        companyName: 'PharmaTech',
        documentType: 'ANEXO CONTROLADO',
        confidentialText: 'Documento confidencial e de propriedade PharmaTech S/A.',
        createdAt: '2025-03-01T00:00:00.000Z',
        updatedAt: '2026-09-01T00:00:00.000Z',
        sectors: [
          { id: 'sec-pht-grade-b', name: 'DIÁRIO - ÁREA GRAU B', color: 'blue' },
          { id: 'sec-pht-grade-c', name: 'DIÁRIO - ÁREA GRAU C', color: 'cyan' }
        ],
        tasks: [
          {
            id: 'task-pht-01',
            code: 'GRB-01',
            name: 'Pressão Diferencial e Cascata de Ar',
            sectorId: 'sec-pht-grade-b',
            recurrence: 'DAILY',
            scheduledTime: '06:30',
            toleranceMinutes: 20,
            description: 'Conferência de manômetros de coluna de líquido.',
            popRef: 'PHT-POP-GAR-0022',
            qrPayload: 'HLB-CHECK:comp-pharmatech:ctrl-pht-cleanroom:GRB-01:PRESSAO_DIFERENCIAL',
            active: true
          },
          {
            id: 'task-pht-02',
            code: 'GRB-02',
            name: 'Desinfecção com Sporicida Químico',
            sectorId: 'sec-pht-grade-b',
            recurrence: 'DAILY',
            scheduledTime: '08:00',
            toleranceMinutes: 30,
            description: 'Nebulização de peróxido de hidrogênio acelerado.',
            popRef: 'PHT-POP-GAR-0022',
            qrPayload: 'HLB-CHECK:comp-pharmatech:ctrl-pht-cleanroom:GRB-02:SPORICIDA',
            active: true
          },
          {
            id: 'task-pht-03',
            code: 'GRC-01',
            name: 'Lavatório de Paramentação e Eclusas',
            sectorId: 'sec-pht-grade-c',
            recurrence: 'DAILY',
            scheduledTime: '09:00',
            toleranceMinutes: 45,
            description: 'Reposição de propés e álcool em gel 70%.',
            popRef: 'PHT-POP-GAR-0022',
            qrPayload: 'HLB-CHECK:comp-pharmatech:ctrl-pht-cleanroom:GRC-01:PARAMENTACAO',
            active: true
          }
        ]
      }
    ]
  }
];

export const INITIAL_USERS: UserAccount[] = [
  {
    id: 'usr-1',
    name: 'Adamo Rocha',
    email: 'admin@herbarium.com',
    password: 'admin',
    initials: 'AR',
    badgeNumber: '2085',
    role: 'ADMIN',
    avatarColor: 'bg-purple-700'
  },
  {
    id: 'usr-2',
    name: 'Carlos Silva',
    email: 'carlos.silva@herbarium.com',
    password: 'admin',
    initials: 'CS',
    badgeNumber: '1042',
    role: 'ADMIN',
    avatarColor: 'bg-blue-600'
  },
  {
    id: 'usr-3',
    name: 'Mariana Ramos',
    email: 'mariana.ramos@herbarium.com',
    password: 'admin',
    initials: 'MR',
    badgeNumber: '1109',
    role: 'ADMIN',
    avatarColor: 'bg-emerald-600'
  },
  {
    id: 'usr-4',
    name: 'João Costa',
    email: 'joao.costa@herbarium.com',
    password: 'admin',
    initials: 'JC',
    badgeNumber: '1054',
    role: 'ADMIN',
    avatarColor: 'bg-amber-600'
  }
];

export function generateSampleRecords(currentDate = new Date()): CheckRecord[] {
  const records: CheckRecord[] = [];
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;
  const currentDay = currentDate.getDate();

  INITIAL_COMPANIES.forEach((comp) => {
    comp.controls.forEach((control) => {
      for (let day = 1; day <= currentDay; day++) {
        const dayDate = new Date(currentYear, currentMonth - 1, day);
        const dayOfWeek = dayDate.getDay();
        const isToday = day === currentDay;

        control.tasks.forEach((task, taskIdx) => {
          if (task.recurrence === 'WEEKLY') {
            if (!task.daysOfWeek || !task.daysOfWeek.includes(dayOfWeek)) {
              return;
            }
          }

          if (isToday && taskIdx > 3) {
            return;
          }

          const user = INITIAL_USERS[(day + taskIdx) % INITIAL_USERS.length];
          const [schedHour, schedMin] = (task.scheduledTime || '08:00').split(':').map(Number);
          
          let delay = (taskIdx % 5 === 0) ? 18 : (taskIdx % 7 === 0) ? 35 : (taskIdx % 3 === 0) ? -4 : 5;
          
          let status: CheckRecord['status'] = 'ON_TIME';
          if (delay > task.toleranceMinutes) {
            status = 'DELAYED';
          } else if (delay < -10) {
            status = 'EARLY';
          }

          const totalCheckMin = schedHour * 60 + schedMin + delay;
          const actualHour = Math.floor(totalCheckMin / 60);
          const actualMin = totalCheckMin % 60;
          const checkedTime = `${String(actualHour).padStart(2, '0')}:${String(actualMin).padStart(2, '0')}`;
          
          const padDay = String(day).padStart(2, '0');
          const padMonth = String(currentMonth).padStart(2, '0');
          const dateStr = `${currentYear}-${padMonth}-${padDay}`;
          const checkedAt = `${dateStr}T${checkedTime}:00.000Z`;

          records.push({
            id: `rec-${comp.id}-${control.id}-${currentYear}-${padMonth}-${padDay}-${task.id}`,
            companyId: comp.id,
            controlId: control.id,
            taskId: task.id,
            taskName: task.name,
            sectorId: task.sectorId,
            date: dateStr,
            dayNumber: day,
            month: currentMonth,
            year: currentYear,
            scheduledTime: task.scheduledTime,
            checkedAt,
            checkedTime,
            userId: user.id,
            userName: user.name,
            userInitials: user.initials,
            status,
            delayMinutes: delay,
            method: (taskIdx % 4 === 0) ? 'MANUAL' : 'QR_CODE',
            locationValidation: true,
            notes: delay > task.toleranceMinutes ? 'Atraso operacional pontual.' : undefined
          });
        });
      }
    });
  });

  return records;
}
