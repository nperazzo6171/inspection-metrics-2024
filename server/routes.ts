import type { Express, Request, Response, NextFunction } from "express";

// Estender Request para incluir user
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { loginSchema, insertInspectionSchema, insertControlePrazoSchema } from "@shared/schema";
import Papa from 'papaparse';
import fs from 'fs';
import path from 'path';
import multer from 'multer';
import * as XLSX from 'xlsx';

// Middleware para verificar autenticação
const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Token de acesso requerido' });
    }

    const token = authHeader.substring(7);
    // Verificar se o token é válido (username:password base64)
    const decoded = Buffer.from(token, 'base64').toString('utf-8');
    const [username, password] = decoded.split(':');
    
    const user = await storage.getUserByUsername(username);
    if (!user || user.password !== password) {
      return res.status(401).json({ success: false, message: 'Credenciais inválidas' });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ success: false, message: 'Token inválido' });
  }
};

// Configuração do multer para upload de arquivos
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
        file.mimetype === 'application/vnd.ms-excel') {
      cb(null, true);
    } else {
      cb(new Error('Apenas arquivos Excel (.xlsx, .xls) são permitidos'));
    }
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication endpoint
  app.post('/api/login', async (req, res) => {
    try {
      const { username, password } = loginSchema.parse(req.body);
      
      const user = await storage.getUserByUsername(username);
      if (user && user.password === password) {
        // Gerar token de acesso para uploads protegidos
        const token = Buffer.from(`${username}:${password}`).toString('base64');
        res.json({ 
          success: true, 
          user: { id: user.id, username: user.username },
          accessToken: token
        });
      } else {
        res.status(401).json({ success: false, message: 'Credenciais inválidas' });
      }
    } catch (error) {
      res.status(400).json({ success: false, message: 'Dados inválidos' });
    }
  });

  // Get all inspections
  app.get('/api/inspections', async (req, res) => {
    try {
      const inspections = await storage.getAllInspections();
      res.json(inspections);
    } catch (error) {
      res.status(500).json({ error: 'Erro ao buscar inspeções' });
    }
  });

  // Autenticação administrativa adicional
  app.post('/api/admin/authenticate', requireAuth, async (req, res) => {
    try {
      const { adminPassword } = req.body;
      
      if (!adminPassword) {
        return res.status(400).json({ success: false, message: 'Senha administrativa é obrigatória' });
      }

      // Senha administrativa específica (mais segura que as credenciais principais)
      const ADMIN_PASSWORD = 'ASTEC@Admin#2025!BA';
      
      if (adminPassword === ADMIN_PASSWORD) {
        console.log(`✅ Acesso administrativo concedido para ${req.user.username}`);
        res.json({ 
          success: true, 
          message: 'Acesso administrativo concedido',
          user: req.user.username 
        });
      } else {
        console.log(`❌ Tentativa de acesso administrativo negada para ${req.user.username}`);
        res.status(401).json({ success: false, message: 'Senha administrativa incorreta' });
      }
    } catch (error) {
      res.status(500).json({ success: false, message: 'Erro interno do servidor' });
    }
  });

  // Upload de planilha Excel protegido por autenticação
  app.post('/api/admin/upload-excel', requireAuth, upload.single('excel'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'Arquivo Excel é obrigatório' });
      }

      // Processar arquivo Excel
      const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      
      // Converter para JSON
      const rawData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      
      if (rawData.length < 2) {
        return res.status(400).json({ error: 'Planilha deve conter pelo menos um cabeçalho e uma linha de dados' });
      }

      // Processar dados da planilha
      const headers = rawData[0] as string[];
      const processedData = [];
      
      for (let i = 1; i < rawData.length; i++) {
        const row = rawData[i] as any[];
        const inspection: any = {};
        
        headers.forEach((header, index) => {
          const value = row[index];
          
          // Mapear colunas da planilha para campos do banco
          switch (header) {
            case 'Nº':
            case 'Numero':
              inspection.numero = value?.toString() || '';
              break;
            case 'Unidade Inspecionada':
              inspection.unidadeInspecionada = value?.toString() || '';
              break;
            case 'Departamento':
              inspection.departamento = value?.toString() || '';
              break;
            case 'COORPIN':
              inspection.coorpin = value?.toString() || '';
              break;
            case 'Data da Inspeção':
              if (typeof value === 'number') {
                // Converter data serial do Excel
                const date = new Date((value - 25569) * 86400 * 1000);
                inspection.dataInspecao = date.toISOString().split('T')[0];
              } else if (value) {
                inspection.dataInspecao = value.toString();
              }
              break;
            case 'Delegado Corregedor Responsável':
              inspection.delegadoCorregedor = value?.toString() || '';
              break;
            case 'Não Conformidade Identificada':
              inspection.naoConformidade = value?.toString() || '';
              break;
            case 'Descrição da Não Conformidade Identificada':
              inspection.descricaoNaoConformidade = value?.toString() || '';
              break;
            case 'Providências Iniciais':
              inspection.providenciasIniciais = value?.toString() || '';
              break;
            case 'Providências Intermediárias':
              inspection.providenciasIntermediarias = value?.toString() || '';
              break;
            case 'Providências Conclusivas':
              inspection.providenciasConclusivas = value?.toString() || '';
              break;
            case 'Data Início Prazo Regularização':
              if (typeof value === 'number') {
                const date = new Date((value - 25569) * 86400 * 1000);
                inspection.dataInicioPrazo = date.toISOString().split('T')[0];
              } else if (value) {
                inspection.dataInicioPrazo = value.toString();
              }
              break;
            case 'Dias Prazo':
              inspection.diasPrazo = typeof value === 'number' ? value : parseInt(value) || 0;
              break;
            case 'Data Fim para Regularização':
              if (typeof value === 'number') {
                const date = new Date((value - 25569) * 86400 * 1000);
                inspection.dataFimRegularizacao = date.toISOString().split('T')[0];
              } else if (value) {
                inspection.dataFimRegularizacao = value.toString();
              }
              break;
            case 'Status Prazo para Regularização':
              inspection.statusPrazo = value?.toString() || '';
              break;
            case 'Data Determinada para Nova Inspeção':
              if (typeof value === 'number') {
                const date = new Date((value - 25569) * 86400 * 1000);
                inspection.dataDeterminadaNovaInspecao = date.toISOString().split('T')[0];
              } else if (value) {
                inspection.dataDeterminadaNovaInspecao = value.toString();
              }
              break;
            case 'Criticidade':
              inspection.criticidade = value?.toString() || '';
              break;
          }
        });
        
        // Validar dados mínimos
        if (inspection.unidadeInspecionada && inspection.departamento) {
          processedData.push(inspection);
        }
      }

      if (processedData.length === 0) {
        return res.status(400).json({ error: 'Nenhum dado válido encontrado na planilha' });
      }

      // Salvar dados no banco - APENAS INSPEÇÕES, NUNCA CONTROLE DE PRAZOS
      await storage.bulkCreateInspections(processedData);
      
      console.log(`✅ UPLOAD DE INSPEÇÕES: Administrador ${req.user.username} carregou ${processedData.length} registros via Excel`);
      console.log(`🔒 SEPARAÇÃO DE DADOS: Este upload alimenta APENAS Dashboard/Relatórios, NÃO Status Regularização`);
      
      res.json({
        success: true,
        message: `${processedData.length} registros processados e carregados com sucesso`,
        count: processedData.length,
        uploadedBy: req.user.username,
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      console.error('Erro no upload de Excel:', error);
      res.status(500).json({ error: 'Erro ao processar planilha Excel' });
    }
  });

  // Bulk insert inspections
  app.post('/api/inspections/bulk', async (req, res) => {
    try {
      const { inspections } = req.body;
      if (!inspections || !Array.isArray(inspections)) {
        return res.status(400).json({ error: 'Array de inspeções requerido' });
      }

      const validInspections = inspections.map(inspection => ({
        numero: inspection.numero || '001',
        unidadeInspecionada: inspection.unidadeInspecionada || '',
        departamento: inspection.departamento || '',
        coorpin: inspection.coorpin || '',
        dataInspecao: inspection.dataInspecao,
        delegadoCorregedor: inspection.delegadoCorregedor || '',
        naoConformidade: inspection.naoConformidade || '',
        descricaoNaoConformidade: inspection.descricaoNaoConformidade || '',
        providenciasIniciais: inspection.providenciasIniciais || '',
        providenciasIntermediarias: inspection.providenciasIntermediarias || '',
        providenciasConclusivas: inspection.providenciasConclusivas || '',
        dataInicioPrazo: inspection.dataInicioRegularizacao,
        diasPrazo: inspection.diasPrazo || 0,
        dataFimRegularizacao: inspection.dataFimRegularizacao,
        statusPrazo: inspection.statusPrazo || '',
        dataDeterminadaNovaInspecao: inspection.dataNovaInspecao,
        criticidade: inspection.criticidade || ''
      }));

      await storage.bulkCreateInspections(validInspections);
      res.json({ 
        success: true, 
        message: `${validInspections.length} inspeções carregadas`,
        count: validInspections.length 
      });
    } catch (error) {
      console.error('Erro no bulk insert:', error);
      res.status(500).json({ error: 'Erro ao carregar inspeções em lote' });
    }
  });

  // Get filtered inspections
  app.get('/api/inspections/filtered', async (req, res) => {
    try {
      const filters = req.query;
      const inspections = await storage.getInspectionsByFilters(filters);
      res.json(inspections);
    } catch (error) {
      res.status(500).json({ error: 'Erro ao filtrar inspeções' });
    }
  });

  // Load CSV data
  app.post('/api/inspections/load-csv', async (req, res) => {
    try {
      const csvFilePath = path.join(process.cwd(), 'data', 'inspections.csv');
      
      if (!fs.existsSync(csvFilePath)) {
        return res.status(404).json({ error: 'Arquivo CSV não encontrado' });
      }

      const csvData = fs.readFileSync(csvFilePath, 'utf8');
      
      Papa.parse(csvData, {
        header: true,
        skipEmptyLines: true,
        transformHeader: (header: string) => {
          // Transform CSV headers to match schema
          const headerMap: { [key: string]: string } = {
            'Nº': 'numero',
            'Unidade Inspecionada': 'unidadeInspecionada',
            'Departamento': 'departamento',
            'COORPIN': 'coorpin',
            'Data da Inspeção': 'dataInspecao',
            'Delegado Corregedor Responsável': 'delegadoCorregedor',
            'Não Conformidade Identificada': 'naoConformidade',
            'Descrição da Não Conformidade Identificada': 'descricaoNaoConformidade',
            'Providências Iniciais': 'providenciasIniciais',
            'Providências Intermediárias': 'providenciasIntermediarias',
            'Providências Conclusivas': 'providenciasConclusivas',
            'Data Início Prazo Regularização': 'dataInicioPrazo',
            'Dias Prazo': 'diasPrazo',
            'Data Fim para Regularização': 'dataFimRegularizacao',
            'Status Prazo para Regularização': 'statusPrazo',
            'Data Determinada para Nova Inspeção': 'dataDeterminadaNovaInspecao',
            'Criticidade': 'criticidade'
          };
          return headerMap[header] || header;
        },
        transform: (value: string, field: string) => {
          // Handle date conversions and Excel serial dates
          if (field === 'dataInspecao' || field === 'dataInicioPrazo' || 
              field === 'dataFimRegularizacao' || field === 'dataDeterminadaNovaInspecao') {
            if (value && !isNaN(Number(value))) {
              // Convert Excel serial date to JavaScript Date
              const excelDate = new Date((Number(value) - 25569) * 86400 * 1000);
              return excelDate.toISOString().split('T')[0];
            }
          }
          if (field === 'diasPrazo') {
            return value ? parseInt(value) : null;
          }
          return value || null;
        },
        complete: async (results: any) => {
          try {
            const validInspections = results.data
              .filter((row: any) => row.numero && row.unidadeInspecionada)
              .map((row: any) => {
                // Validate and create inspection object
                return {
                  numero: row.numero,
                  unidadeInspecionada: row.unidadeInspecionada,
                  departamento: row.departamento || '',
                  coorpin: row.coorpin || '',
                  dataInspecao: row.dataInspecao,
                  delegadoCorregedor: row.delegadoCorregedor || '',
                  naoConformidade: row.naoConformidade || '',
                  descricaoNaoConformidade: row.descricaoNaoConformidade || '',
                  providenciasIniciais: row.providenciasIniciais,
                  providenciasIntermediarias: row.providenciasIntermediarias,
                  providenciasConclusivas: row.providenciasConclusivas,
                  dataInicioPrazo: row.dataInicioPrazo,
                  diasPrazo: row.diasPrazo,
                  dataFimRegularizacao: row.dataFimRegularizacao,
                  statusPrazo: row.statusPrazo || '',
                  dataDeterminadaNovaInspecao: row.dataDeterminadaNovaInspecao,
                  criticidade: row.criticidade || ''
                };
              });

            await storage.bulkCreateInspections(validInspections);
            res.json({ 
              success: true, 
              message: `${validInspections.length} inspeções carregadas com sucesso`,
              count: validInspections.length 
            });
          } catch (error) {
            res.status(500).json({ error: 'Erro ao processar dados CSV' });
          }
        },
        error: (error: any) => {
          res.status(400).json({ error: 'Erro ao processar arquivo CSV' });
        }
      });
    } catch (error) {
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  });

  // Generate report data
  app.get('/api/reports/data', async (req, res) => {
    try {
      console.log('Filters received:', req.query);
      
      // Convert query parameters properly
      const filters: any = {};
      
      if (req.query.ano) {
        filters.ano = parseInt(req.query.ano as string);
      }
      
      if (req.query.departamento) {
        filters.departamento = [req.query.departamento as string];
      }
      
      if (req.query.unidade) {
        filters.unidade = [req.query.unidade as string];
      }
      
      if (req.query.dataInicial) {
        filters.dataInicial = req.query.dataInicial as string;
      }
      
      if (req.query.dataFinal) {
        filters.dataFinal = req.query.dataFinal as string;
      }
      
      if (req.query.statusPrazo) {
        filters.statusPrazo = req.query.statusPrazo as string;
      }
      
      
      console.log('Processed filters:', filters);
      
      const inspections = await storage.getInspectionsByFilters(filters);
      console.log(`Found ${inspections.length} inspections`);
      
      // Buscar dados de controle de prazos para calcular "Com Prazo Definido"
      const allControlePrazos = await storage.getAllControlePrazos();
      
      // Filtrar controle de prazos baseado nas unidades das inspeções filtradas
      const filteredUnidades = new Set(inspections.map(i => i.unidadeInspecionada));
      const controlePrazos = allControlePrazos.filter(cp => 
        filteredUnidades.size === 0 || filteredUnidades.has(cp.unidade)
      );
      
      console.log(`Found ${controlePrazos.length} controle de prazos records (filtered from ${allControlePrazos.length})`);
      
      // Count unique inspections by unit, date and inspector (more accurate)
      const uniqueInspections = new Set();
      inspections.forEach(inspection => {
        const key = `${inspection.unidadeInspecionada}-${inspection.dataInspecao}-${inspection.delegadoCorregedor}`;
        uniqueInspections.add(key);
      });

      // Calculate status counts for unique inspections
      const statusCounts = { withinDeadline: 0, nearDeadline: 0, overdue: 0 };
      const inspectionStatusMap = new Map();
      
      inspections.forEach(inspection => {
        const key = `${inspection.unidadeInspecionada}-${inspection.dataInspecao}-${inspection.delegadoCorregedor}`;
        if (!inspectionStatusMap.has(key)) {
          inspectionStatusMap.set(key, inspection.statusPrazo);
          if (inspection.statusPrazo === 'Dentro do prazo') statusCounts.withinDeadline++;
          else if (inspection.statusPrazo === 'Próximo do vencimento') statusCounts.nearDeadline++;
          else if (inspection.statusPrazo === 'Prazo expirado') statusCounts.overdue++;
        }
      });

      // Calcular unidades com prazo definido baseado nos dados de controle de prazos
      const unidadesComPrazoDefinido = new Set(controlePrazos.map(cp => cp.unidade)).size;
      
      // Calcular unidades com prazo vencido (data prazo menor que hoje)
      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0); // Zerar horários para comparação apenas de datas
      
      const unidadesComPrazoVencido = new Set(
        controlePrazos
          .filter(cp => {
            if (!cp.dataPrazo) return false;
            const dataPrazo = new Date(cp.dataPrazo);
            dataPrazo.setHours(0, 0, 0, 0);
            return dataPrazo < hoje;
          })
          .map(cp => cp.unidade)
      ).size;
      
      // Calcular dados específicos do Status de Regularização
      const regularizados = controlePrazos.filter(cp => cp.status === 'regularizado').length;
      const pendentes = controlePrazos.filter(cp => cp.status === 'pendente').length;
      const naoRegularizados = controlePrazos.filter(cp => cp.status === 'nao_regularizado').length;

      // Process data for reports
      const reportData = {
        inspections,
        summary: {
          totalInspections: uniqueInspections.size, // Unique inspections by unit, date, inspector
          totalNonCompliances: inspections.length, // Total non-conformities
          withinDeadline: unidadesComPrazoDefinido, // Unidades com prazo definido
          nearDeadline: unidadesComPrazoVencido, // Unidades com prazo vencido
          overdue: unidadesComPrazoVencido, // Também usar para overdue
          // Dados específicos do Status de Regularização
          regularizados: regularizados,
          pendentes: pendentes,
          naoRegularizados: naoRegularizados,
          totalControlePrazos: controlePrazos.length
        },
        charts: {
          departmentData: inspections.reduce((acc: any[], item) => {
            const key = `${item.unidadeInspecionada}-${item.dataInspecao}-${item.delegadoCorregedor}`;
            const dept = acc.find(d => d.name === item.departamento);
            if (dept) {
              if (!dept.uniqueInspections) dept.uniqueInspections = new Set();
              if (!dept.uniqueInspections.has(key)) {
                dept.uniqueInspections.add(key);
                dept.value += 1; // Count unique inspections only
              }
            } else {
              const uniqueInspections = new Set([key]);
              acc.push({ name: item.departamento, value: 1, uniqueInspections });
            }
            return acc;
          }, []).map((item: any) => ({ name: item.name, value: item.value })),
          statusData: controlePrazos.reduce((acc: any[], item) => {
            // Categorizar baseado na situação do prazo
            let statusName = '';
            
            if (!item.dataPrazo) {
              statusName = 'Sem Prazo Definido';
            } else {
              const dataPrazo = new Date(item.dataPrazo);
              dataPrazo.setHours(0, 0, 0, 0);
              const hoje = new Date();
              hoje.setHours(0, 0, 0, 0);
              
              if (dataPrazo < hoje) {
                statusName = 'Com Prazo Vencido';
              } else {
                // Verificar se está próximo do vencimento (próximos 15 dias)
                const diasRestantes = Math.ceil((dataPrazo.getTime() - hoje.getTime()) / (1000 * 3600 * 24));
                if (diasRestantes <= 15) {
                  statusName = 'Próximo do Vencimento';
                } else {
                  statusName = 'Com Prazo Definido';
                }
              }
            }
            
            const status = acc.find(s => s.name === statusName);
            if (status) {
              status.value += 1;
            } else {
              acc.push({ name: statusName, value: 1 });
            }
            return acc;
          }, []),
          nonComplianceData: inspections.reduce((acc: any[], item) => {
            const compliance = acc.find(c => c.name === item.naoConformidade);
            if (compliance) {
              compliance.value += 1;
            } else {
              acc.push({ name: item.naoConformidade, value: 1 });
            }
            return acc;
          }, [])
        }
      };
      
      res.json(reportData);
    } catch (error) {
      console.error('Error in /api/reports/data:', error);
      res.status(500).json({ error: 'Erro ao gerar dados do relatório', details: error });
    }
  });

  // Upload endpoint for controle de prazos
  app.post('/api/admin/upload-controle-prazos', requireAuth, upload.single('excel'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'Nenhum arquivo foi enviado' });
      }

      console.log(`📤 Admin upload de controle de prazos iniciado pelo usuário: ${req.user.username}`);
      console.log(`📄 Arquivo: ${req.file.originalname} (${req.file.size} bytes)`);

      // Ler arquivo Excel
      const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      
      // Converter para JSON
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      console.log(`📊 Total de linhas no Excel: ${jsonData.length}`);
      
      if (jsonData.length < 2) {
        return res.status(400).json({ error: 'Arquivo Excel deve conter pelo menos uma linha de cabeçalho e uma linha de dados' });
      }

      // Primeira linha são os cabeçalhos
      const headers = jsonData[0] as string[];
      const dataRows = jsonData.slice(1);
      
      console.log('📋 Cabeçalhos encontrados:', headers);

      // Mapeamento de colunas (flexível para aceitar variações de nomes)
      const findColumnIndex = (possibleNames: string[]): number => {
        for (const name of possibleNames) {
          const index = headers.findIndex(h => 
            h && h.toString().toLowerCase().trim().includes(name.toLowerCase())
          );
          if (index !== -1) return index;
        }
        return -1;
      };

      const columnMapping = {
        unidade: findColumnIndex(['unidade', 'unit']),
        oficio: findColumnIndex(['ofício', 'oficio', 'documento', 'doc']),
        linkSei: findColumnIndex(['link sei', 'sei', 'link']),
        naoConformidade: findColumnIndex(['não conformidade', 'nao conformidade', 'conformidade']),
        dataRecebimento: findColumnIndex(['data recebimento', 'recebimento', 'data rec']),
        dataPrazo: findColumnIndex(['data prazo', 'prazo', 'vencimento']),
        status: findColumnIndex(['status', 'situação', 'situacao', 'regularizado'])
      };

      console.log('🗂️ Mapeamento de colunas:', columnMapping);

      // Verificar se colunas obrigatórias foram encontradas
      const requiredColumns = ['unidade', 'oficio', 'naoConformidade', 'dataRecebimento', 'dataPrazo', 'status'] as const;
      const missingColumns = requiredColumns.filter(col => columnMapping[col] === -1);
      
      if (missingColumns.length > 0) {
        return res.status(400).json({ 
          error: `Colunas obrigatórias não encontradas: ${missingColumns.join(', ')}`,
          found: headers,
          required: requiredColumns
        });
      }

      const parseExcelDate = (value: any): Date | null => {
        if (!value) return null;
        
        // Se é um número (data serial do Excel)
        if (typeof value === 'number') {
          return new Date((value - 25569) * 86400 * 1000);
        }
        
        // Se é string, tentar parsear
        if (typeof value === 'string') {
          // Tentar formato DD/MM/AAAA
          const ddmmyyyy = value.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
          if (ddmmyyyy) {
            return new Date(parseInt(ddmmyyyy[3]), parseInt(ddmmyyyy[2]) - 1, parseInt(ddmmyyyy[1]));
          }
          
          // Tentar outros formatos
          const parsed = new Date(value);
          if (!isNaN(parsed.getTime())) {
            return parsed;
          }
        }
        
        return null;
      };

      // Função para normalizar status
      const normalizeStatus = (value: any): string => {
        if (!value) return 'pendente';
        const str = value.toString().toLowerCase().trim();
        
        if (str.includes('regular')) return 'regularizado';
        if (str.includes('não regular') || str.includes('nao regular')) return 'nao_regularizado';
        if (str.includes('pendent')) return 'pendente';
        
        return 'pendente';
      };

      // Processar dados
      const controlePrazosData = [];
      let processedCount = 0;
      let errorCount = 0;

      for (let i = 0; i < dataRows.length; i++) {
        const row = dataRows[i] as any[];
        
        try {
          const unidade = row[columnMapping.unidade]?.toString()?.trim();
          const oficio = row[columnMapping.oficio]?.toString()?.trim();
          const naoConformidade = row[columnMapping.naoConformidade]?.toString()?.trim();
          
          if (!unidade || !oficio || !naoConformidade) {
            console.log(`⚠️ Linha ${i + 2}: Dados obrigatórios em branco`);
            errorCount++;
            continue;
          }

          const dataRecebimento = parseExcelDate(row[columnMapping.dataRecebimento]);
          const dataPrazo = parseExcelDate(row[columnMapping.dataPrazo]);
          
          if (!dataRecebimento || !dataPrazo) {
            console.log(`⚠️ Linha ${i + 2}: Datas inválidas`);
            errorCount++;
            continue;
          }

          const controlePrazoData = {
            unidade,
            oficio,
            linkSei: row[columnMapping.linkSei]?.toString()?.trim() || null,
            naoConformidade,
            dataRecebimento: dataRecebimento.toISOString().split('T')[0],
            dataPrazo: dataPrazo.toISOString().split('T')[0],
            status: normalizeStatus(row[columnMapping.status]),
            observacoes: null
          };

          controlePrazosData.push(controlePrazoData);
          processedCount++;
          
        } catch (error) {
          console.error(`❌ Erro na linha ${i + 2}:`, error);
          errorCount++;
        }
      }

      console.log(`✅ Dados processados: ${processedCount}, Erros: ${errorCount}`);

      if (controlePrazosData.length === 0) {
        return res.status(400).json({ 
          error: 'Nenhum registro válido foi encontrado na planilha',
          details: `${errorCount} linhas com erro`
        });
      }

      // Inserir dados com deduplicação automática - UPLOAD EXPLÍCITO DE CONTROLE DE PRAZOS
      console.log(`🔒 CONTROLE DE PRAZOS: Upload explícito iniciado pelo administrador ${req.user.username}`);
      await storage.insertControlePrazosInBatch(controlePrazosData);
      console.log(`✅ SEPARAÇÃO DE DADOS: Este upload alimenta APENAS Status Regularização, NÃO Dashboard/Relatórios`);

      const result = {
        success: true,
        count: controlePrazosData.length,
        errors: errorCount,
        uploadedBy: req.user.username,
        timestamp: new Date().toISOString(),
        message: `${controlePrazosData.length} registros de controle de prazos carregados com sucesso. ${errorCount > 0 ? `${errorCount} linhas com erro foram ignoradas.` : ''}`
      };

      console.log('✅ Upload de controle de prazos concluído:', result);
      res.json(result);

    } catch (error) {
      console.error('❌ Erro no upload de controle de prazos:', error);
      console.error('Stack trace:', error instanceof Error ? error.stack : error);
      res.status(500).json({ 
        error: 'Erro interno do servidor durante o upload',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  });

  // Admin delete endpoints
  app.delete('/api/admin/delete-all-inspections', requireAuth, async (req, res) => {
    try {
      await storage.deleteAllInspections();
      
      const result = {
        success: true,
        message: 'Todos os dados de inspeções foram removidos',
        deletedBy: req.user.username,
        timestamp: new Date().toISOString()
      };
      
      console.log('🗑️ Todos os dados de inspeções removidos por:', req.user.username);
      res.json(result);
    } catch (error) {
      console.error('Erro ao remover dados de inspeções:', error);
      res.status(500).json({ 
        error: 'Erro interno do servidor', 
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  });

  app.delete('/api/admin/delete-all-controle-prazos', requireAuth, async (req, res) => {
    try {
      await storage.deleteAllControlePrazos();
      
      const result = {
        success: true,
        message: 'Todos os dados de controle de prazos foram removidos',
        deletedBy: req.user.username,
        timestamp: new Date().toISOString()
      };
      
      console.log('🗑️ Todos os dados de controle de prazos removidos por:', req.user.username);
      res.json(result);
    } catch (error) {
      console.error('Erro ao remover dados de controle de prazos:', error);
      res.status(500).json({ 
        error: 'Erro interno do servidor', 
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  });

  // Controle de Prazos routes
  app.get('/api/controle-prazos', async (req, res) => {
    try {
      const controlePrazos = await storage.getAllControlePrazos();
      res.json(controlePrazos);
    } catch (error) {
      console.error('Erro ao buscar controle de prazos:', error);
      res.status(500).json({ error: 'Erro ao buscar registros de controle de prazos' });
    }
  });

  app.post('/api/controle-prazos', async (req, res) => {
    try {
      const validData = insertControlePrazoSchema.parse(req.body);
      const controlePrazo = await storage.createControlePrazo(validData);
      res.json(controlePrazo);
    } catch (error) {
      console.error('Erro ao criar controle de prazo:', error);
      res.status(500).json({ error: 'Erro ao criar registro de controle de prazo' });
    }
  });

  app.patch('/api/controle-prazos/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updateData = req.body;
      
      if (isNaN(id)) {
        return res.status(400).json({ error: 'ID inválido' });
      }

      console.log(`Updating controle-prazo ${id} with data:`, updateData);
      
      const controlePrazo = await storage.updateControlePrazo(id, updateData);
      
      if (!controlePrazo) {
        return res.status(404).json({ error: 'Registro não encontrado' });
      }
      
      res.json(controlePrazo);
    } catch (error) {
      console.error('Erro ao atualizar controle de prazo:', error);
      res.status(500).json({ error: 'Erro ao atualizar registro de controle de prazo' });
    }
  });

  app.delete('/api/controle-prazos/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteControlePrazo(id);
      res.json({ success: true });
    } catch (error) {
      console.error('Erro ao deletar controle de prazo:', error);
      res.status(500).json({ error: 'Erro ao deletar registro de controle de prazo' });
    }
  });

  // Gallery routes
  app.get('/api/gallery/photos', async (req, res) => {
    try {
      const photos = await storage.getAllPhotos();
      res.json(photos);
    } catch (error) {
      console.error('Erro ao buscar fotos da galeria:', error);
      res.status(500).json({ error: 'Erro ao buscar fotos da galeria' });
    }
  });

  app.get('/api/gallery/photos/unidade/:unidade', async (req, res) => {
    try {
      const { unidade } = req.params;
      const photos = await storage.getPhotosByUnidade(decodeURIComponent(unidade));
      res.json(photos);
    } catch (error) {
      console.error('Erro ao buscar fotos por unidade:', error);
      res.status(500).json({ error: 'Erro ao buscar fotos da unidade' });
    }
  });

  app.post('/api/gallery/photos', async (req, res) => {
    try {
      const { unidade, fileName, fileType, fileSize, imageData } = req.body;
      
      if (!unidade || !fileName || !fileType || !imageData) {
        return res.status(400).json({ error: 'Dados obrigatórios faltando' });
      }

      const photoData = {
        unidade,
        fileName,
        fileType,
        fileSize: fileSize || 0,
        imageData
      };

      const photo = await storage.createPhoto(photoData);
      res.json(photo);
    } catch (error) {
      console.error('Erro ao salvar foto na galeria:', error);
      res.status(500).json({ error: 'Erro ao salvar foto na galeria' });
    }
  });

  app.delete('/api/gallery/photos/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deletePhoto(id);
      res.json({ success: true });
    } catch (error) {
      console.error('Erro ao deletar foto da galeria:', error);
      res.status(500).json({ error: 'Erro ao deletar foto da galeria' });
    }
  });

  // Document routes
  app.get('/api/documents', async (req, res) => {
    try {
      const documents = await storage.getAllDocuments();
      res.json(documents);
    } catch (error) {
      console.error('Erro ao buscar documentos:', error);
      res.status(500).json({ error: 'Erro ao buscar documentos' });
    }
  });

  app.post('/api/documents', async (req, res) => {
    try {
      const { tipo, numero, ano, titulo, descricao, orgaoEmissor, dataPublicacao, dataVigencia, status, assunto, arquivoUrl } = req.body;
      
      if (!tipo || !numero || !ano || !titulo) {
        return res.status(400).json({ error: 'Tipo, número, ano e título são obrigatórios' });
      }

      const documentData = {
        tipo,
        numero,
        ano,
        titulo,
        descricao: descricao || null,
        orgaoEmissor: orgaoEmissor || null,
        dataPublicacao: dataPublicacao || null,
        dataVigencia: dataVigencia || null,
        status: status || 'Vigente',
        assunto: assunto || null,
        arquivoUrl: arquivoUrl || null
      };

      const document = await storage.createDocument(documentData);
      res.json(document);
    } catch (error) {
      console.error('Erro ao criar documento:', error);
      res.status(500).json({ error: 'Erro ao criar documento' });
    }
  });

  app.put('/api/documents/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updateData = req.body;
      
      const document = await storage.updateDocument(id, updateData);
      res.json(document);
    } catch (error) {
      console.error('Erro ao atualizar documento:', error);
      res.status(500).json({ error: 'Erro ao atualizar documento' });
    }
  });

  app.delete('/api/documents/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteDocument(id);
      res.json({ success: true });
    } catch (error) {
      console.error('Erro ao deletar documento:', error);
      res.status(500).json({ error: 'Erro ao deletar documento' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
