# VerifIQ - Gestão e Rastreabilidade Digital BPF

> Sistema Integrado de Controle, Digitalização de Anexos Regulatórios e Rastreabilidade Metrológica para Indústrias Farmacêuticas, Cosméticas e Alimentícias (BPF / GMP / ANVISA).

---

## 📋 Sobre o Projeto

O **VerifIQ** é uma plataforma que substitui os controles manuais em papel por matrizes digitais inteligentes com validação via QR Code, conferência por horários programados, rubricas de operadores e geração de folhas oficiais de impressão em conformidade com as normas BPF (Boas Práticas de Fabricação).

### 🚀 Principais Recursos

- **Matriz Digital de Documentos Controlados:** Visualização mensal dinâmica por dia, turno e colunas de atividades (ex.: registros diários, semanais e mensais).
- **Atividades Multi-Horário:** Suporte a tarefas com múltiplas rodadas por dia (ex.: abastecimentos às 09:30, 14:00 e 16:00) com sub-linhas e agrupamento inteligente.
- **Modo Apenas Conferência:** Flexibilidade para alternar atividades com horário programado vs. checagem livre sem exigência de horário.
- **Validação por QR Code:** Leitor de câmera integrado e gerador de etiquetas industriais com QR Codes únicos por ponto de checagem.
- **Controle de Tolerância e Atrasos:** Cálculo metrológico automático do status do check (`No Prazo`, `Atrasado`, `Adiantado`).
- **Gestão Multi-Empresa & Multi-Unidades:** Segregação de documentos, setores e usuários por planta fabril.
- **Construtor Visual de Modelos:** Criação e edição completa de documentos, colunas-mãe (setores), atividades e horários.
- **Impressão Oficial A4 Paisagem:** Layout padronizado fiel aos anexos regulatórios em papel.
- **Exportação para Excel (.xlsx):** Relatórios de conformidade e auditoria com 1 clique.
- **Zerar Lançamentos:** Ferramenta segura para limpeza pontual de registros (mês atual ou histórico completo).

---

## 🛠️ Tecnologias Utilizadas

- **React 19** + **TypeScript**
- **Vite** (Build tool e HMR ultra-rápido)
- **Tailwind CSS v4**
- **Lucide Icons**
- **Html5-Qrcode** (Leitor de câmera)
- **Qrcode.react** (Geração de QR Codes vetoriais)
- **XLSX** (Planilhas e relatórios)
- **Canvas-Confetti** (Feedback visual de checagem)

---

## 💻 Como Rodar o Projeto Localmente

### Pré-requisitos
- **Node.js** (versão 18 ou superior)
- **npm** ou **yarn**

### Instalação

```bash
# Clonar o repositório
git clone https://github.com/adamoquadros/verifiq.git

# Entrar na pasta
cd verifiq

# Instalar as dependências
npm install

# Iniciar o servidor de desenvolvimento
npm run dev
```

Acesse [http://localhost:5173](http://localhost:5173) no seu navegador.

### Build de Produção

```bash
npm run build
```

---

## 🔒 Conformidade Regulatória
Desenvolvido com foco nas diretrizes da ANVISA (RDC 658/2022 e RDC 301/2019), padrões de integridade de dados ALCOA+ e normas BPF/GMP.
