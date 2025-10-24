# Prompt para geração de landing page com acesso seguro

Você é um especialista em UX/UI e desenvolvimento full-stack focado em aplicações web de inspeção institucional. Gere um projeto de landing page responsiva, moderna e acessível que atenda aos requisitos abaixo. Siga as instruções na ordem, mantendo uma linguagem profissional e adaptando componentes visuais a dashboards contemporâneos.

## Objetivo geral
Criar uma landing page institucional com autenticação segura, múltiplas abas de navegação e dashboards ricos em dados para monitoramento de indicadores de inspeção e gestão administrativa de unidades da polícia civil.

## Diretrizes obrigatórias
1. **Autenticação e segurança**
   - Implementar fluxo de login com usuário e senha.
   - Adicionar segunda etapa de autenticação (2FA) via token temporário.
   - Garantir comunicação segura (HTTPS) e boas práticas de proteção de sessão.
   - Configurar autenticação automática integrada ao banco de dados institucional, contemplando sincronização de credenciais, trilhas de auditoria e políticas de expiração.
   - Posicionar o brasão oficial da Polícia Civil da Bahia no topo da tela de login, com descrição alternativa e preservação de nitidez.

2. **Arquitetura de navegação**
   - Incluir um cabeçalho com logotipo institucional, nome do sistema e menu principal com múltiplas abas.
   - Fornecer área de destaque para métricas principais logo após a dobra.
   - Criar barra lateral (ou menu tabulado) para alternar entre dashboards específicos.
   - Exibir o brasão oficial da Polícia Civil da Bahia (mesmo arquivo da tela de login) no cabeçalho interno, mantendo proporções e contraste adequados.
   - Disponibilizar um botão de "Voltar" para retornar ao módulo ou aba anterior e um botão de "Sair" para encerrar a sessão com confirmação.

3. **Abas e seções funcionais**
   - Dashboard geral de indicadores de inspeção.
   - Controle de não conformidades identificadas, com status, prioridade e responsáveis.
   - Painel de controle de prazos para regularização, com alertas e linha do tempo.
   - Upload de arquivos (XLSX e CSV) com validação e feedback visual.
   - Download de relatórios consolidados em PDF.
   - Gestão de resposta MPE (Ministério Público Estadual) com status e histórico.
   - Seção de drogas apreendidas nas unidades da polícia civil.
   - Seção de armas apreendidas.
   - Indicadores PPE (Programa de Proteção Escolar) com gráficos comparativos.
   - Controle de veículos apreendidos.
   - Galeria de fotos das unidades inspecionadas, organizada por unidade policial e departamento.
   - Monitoramento da passagem de gestão (timeline, responsáveis, pendências).
   - Controle de convênios vencidos (Termo de Cooperação Técnica) com filtros por status e data.
   - Controle de ofícios não respondidos dos tipos CAC e CCC.
   - Relatórios de inspeções realizadas, drogas apreendidas e armas apreendidas, com opção de filtragem e exportação.

4. **Integrações e automações**
   - Planejar integrações com sistemas SEI, SICORQ e e-PAD, indicando pontos de API e fluxos de sincronização.
   - Descrever notificações automáticas para prazos críticos e pendências.
   - Definir estratégia de ingestão e normalização de dados a partir de planilhas (XLSX/CSV) fornecidas pela corporação, incluindo roteiros para modelagem de tabelas, relacionamentos e rotinas de ETL que permitam orientar a equipe a estruturar o banco de dados a partir desses arquivos.

5. **Design e UX**
   - Utilizar paleta de cores sóbria com contrastes adequados (tons de azul, cinza e acentos em laranja ou verde).
   - Incluir componentes modernos: cards, gráficos, tabelas responsivas, badges de status, timeline, heatmaps.
   - Garantir responsividade (desktop, tablet e mobile) com breakpoints descritos.
   - Incluir microinterações (hover, loading states, feedback visual de sucesso/erro).
   - Destacar indicadores-chave com badges numéricos e gráficos de linha/rosca.

6. **Conteúdo textual**
   - Criar textos institucionais em português, formais e objetivos.
   - Inserir chamadas para ação claras ("Acessar painel", "Baixar relatório", "Enviar atualização").
   - Especificar legendas e tooltips para gráficos.

7. **Entrega do prompt**
   - Estruturar a saída com seções: "Arquitetura da página", "Componentes principais", "Fluxos de usuário", "Integrações previstas", "Conteúdo textual sugerido", "Estilo visual" e "Checklist de requisitos".
   - Fornecer indicações de bibliotecas ou frameworks front-end adequados (ex.: React, Next.js, Tailwind CSS, Chart.js) e estratégias para implementação de 2FA.
   - Incluir exemplos de dados fictícios para gráficos e tabelas.

## Critérios de qualidade
- A solução deve ser escalável, segura e facilmente mantida por equipes de TI públicas.
- Priorizar acessibilidade (WCAG 2.1), performance e observabilidade (logs e métricas).
- Prever testes automatizados básicos (autenticação, upload/download, renderização de gráficos).

Entregue a descrição final em português, com tom consultivo e foco na implementação prática.
