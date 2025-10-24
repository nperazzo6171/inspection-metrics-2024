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
   - Inserir um mapa interativo com geolocalização das unidades policiais, permitindo zoom, filtragem e visualização de bolhas coloridas (preto, vermelho, amarelo e verde) proporcionais à quantidade de casos.
   - Incluir ponto de acesso fixo ao assistente virtual (chatbot com IA), visível em todas as telas e aderente às diretrizes de acessibilidade.

3. **Abas e seções funcionais**
   - Dashboard geral de indicadores de inspeção.
   - Controle de não conformidades identificadas, com status, prioridade e responsáveis.
   - Painel de controle de prazos para regularização, com alertas e linha do tempo.
   - Upload de arquivos (XLSX e CSV) com validação e feedback visual.
   - Download de relatórios consolidados em PDF, com opção de exportação em todas as abas relevantes.
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
   - Assistente virtual com IA embutido em todas as abas, oferecendo chatbot contextual para dúvidas e orientações operacionais.
   - Painel CVLI (Crimes Violentos Letais Intencionais) com métricas por unidade.
   - Aba dedicada a boletins de ocorrência do MIAE sem inquérito instaurado, com filtros por data e unidade.
   - Seção de dados MIAE COGER, podendo redirecionar para link oficial com dados complementares.
   - Controle de infrações de viaturas sem defesa registrada.
   - Monitoramento de unidades policiais com viaturas sem utilização de placa ostensiva.
   - Painel de PADs instaurados e concluídos por comissão processante.
   - Indicadores de investigações preliminares em andamento da CORREPOL por autoridade policial.
   - Controle de processos correicionais instaurados e não respondidos pelas unidades policiais.
   - Dashboard de unidades policiais inauguradas, reformadas e que necessitam de reforma.
   - Listagem de autoridades policiais respondendo cumulativamente.
   - Painel de RH da PCBA com dados de efetivo, afastamentos e capacitações.
   - Monitoramento de armas e EPIs não devolvidos por servidores após aposentadoria.
   - Indicadores de produtividade dos DPCs nas unidades policiais.
   - Controle de requisições do Ministério Público às unidades policiais sem resposta.
   - Inventário de inquéritos físicos sem digitalização e migração.
   - Prontuário do servidor com informações correicionais agregadas.
   - Visualização de dados do PIMA (Programa de Integridade e Monitoramento de Atividades).
   - Aba de cadeia de custódia, categorizando unidades policiais com implementação plena, parcial ou não implementada, com indicadores visuais e ações corretivas sugeridas.
   - Sobreposição do mapa de geolocalização com os indicadores relevantes quando aplicável.

4. **Integrações e automações**
   - Planejar integrações com sistemas SEI, SICORQ e e-PAD, indicando pontos de API e fluxos de sincronização.
   - Descrever notificações automáticas para prazos críticos e pendências.
   - Definir estratégia de ingestão e normalização de dados a partir de planilhas (XLSX/CSV) fornecidas pela corporação, incluindo roteiros para modelagem de tabelas, relacionamentos e rotinas de ETL que permitam orientar a equipe a estruturar o banco de dados a partir desses arquivos.
   - Integrar o mapa interativo com serviços de geolocalização (por exemplo, Mapbox, Leaflet ou ArcGIS) e prever camadas de dados específicos das unidades policiais.
   - Especificar orquestração de chatbot com assistente de IA (ex.: Azure OpenAI, Dialogflow, Rasa) conectado às bases internas, com regras de confidencialidade e fallback para atendimento humano.

5. **Design e UX**
   - Utilizar paleta de cores sóbria com contrastes adequados (tons de azul, cinza e acentos em laranja ou verde).
   - Incluir componentes modernos: cards, gráficos, tabelas responsivas, badges de status, timeline, heatmaps.
   - Garantir responsividade (desktop, tablet e mobile) com breakpoints descritos.
   - Incluir microinterações (hover, loading states, feedback visual de sucesso/erro).
   - Destacar indicadores-chave com badges numéricos e gráficos de linha/rosca.
   - Definir legendas e escalas claras para as bolhas coloridas do mapa (preto, vermelho, amarelo, verde) e sua relação com os níveis de casos.
   - Planejar janela modal ou dock lateral para interação com o assistente de IA, com histórico de conversas e sugestões contextualizadas.

6. **Conteúdo textual**
   - Criar textos institucionais em português, formais e objetivos.
   - Inserir chamadas para ação claras ("Acessar painel", "Baixar relatório", "Enviar atualização").
   - Especificar legendas e tooltips para gráficos.

7. **Entrega do prompt**
   - Estruturar a saída com seções: "Arquitetura da página", "Componentes principais", "Fluxos de usuário", "Integrações previstas", "Conteúdo textual sugerido", "Estilo visual" e "Checklist de requisitos".
   - Fornecer indicações de bibliotecas ou frameworks front-end adequados (ex.: React, Next.js, Tailwind CSS, Chart.js) e estratégias para implementação de 2FA.
   - Incluir exemplos de dados fictícios para gráficos e tabelas.
   - Orientar sobre bibliotecas de mapas e frameworks de chatbot adequados para o contexto governamental.

## Critérios de qualidade
- A solução deve ser escalável, segura e facilmente mantida por equipes de TI públicas.
- Priorizar acessibilidade (WCAG 2.1), performance e observabilidade (logs e métricas).
- Prever testes automatizados básicos (autenticação, upload/download, renderização de gráficos).

Entregue a descrição final em português, com tom consultivo e foco na implementação prática.
