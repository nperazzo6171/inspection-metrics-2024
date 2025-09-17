import { users, inspections, controlePrazos, galleryPhotos, documents, type User, type InsertUser, type Inspection, type InsertInspection, type ControlePrazo, type InsertControlePrazo, type GalleryPhoto, type InsertGalleryPhoto, type Document, type InsertDocument } from "@shared/schema";
import { db } from "./db";
import { eq, and, inArray, gte, lte, sql } from "drizzle-orm";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getAllInspections(): Promise<Inspection[]>;
  getInspectionsByFilters(filters: any): Promise<Inspection[]>;
  createInspection(inspection: InsertInspection): Promise<Inspection>;
  bulkCreateInspections(inspections: InsertInspection[]): Promise<Inspection[]>;
  getAllControlePrazos(): Promise<ControlePrazo[]>;
  createControlePrazo(controlePrazo: InsertControlePrazo): Promise<ControlePrazo>;
  updateControlePrazo(id: number, controlePrazo: Partial<InsertControlePrazo>): Promise<ControlePrazo>;
  deleteControlePrazo(id: number): Promise<void>;
  clearControlePrazos(): Promise<void>;
  deleteAllInspections(): Promise<void>;
  deleteAllControlePrazos(): Promise<void>;
  insertControlePrazosInBatch(controlePrazosData: InsertControlePrazo[]): Promise<ControlePrazo[]>;
  bulkCreateControlePrazos(controlePrazosData: InsertControlePrazo[]): Promise<ControlePrazo[]>;
  // Gallery methods
  getPhotosByUnidade(unidade: string): Promise<GalleryPhoto[]>;
  getAllPhotos(): Promise<GalleryPhoto[]>;
  createPhoto(photo: InsertGalleryPhoto): Promise<GalleryPhoto>;
  deletePhoto(id: number): Promise<void>;
  // Document methods
  getAllDocuments(): Promise<Document[]>;
  createDocument(document: InsertDocument): Promise<Document>;
  updateDocument(id: number, document: Partial<InsertDocument>): Promise<Document>;
  deleteDocument(id: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  private inMemoryInspections: Inspection[] = [];

  constructor() {
    if (process.env.DATABASE_URL) {
      this.initializeAdminUser();
      this.initializeSampleControlePrazos();
      this.loadRealInspectionData();
    }
  }

  private async initializeAdminUser() {
    const adminUser = await this.getUserByUsername('astec.admin');
    if (!adminUser) {
      await this.createUser({ username: 'astec.admin', password: 'Correpol@2025#BA' });
    }
    
    // Initialize some sample controle-prazos data if none exists
    // await this.initializeSampleControlePrazos(); // Comentado - não criar dados de amostra
  }

  private async initializeSampleControlePrazos() {
    try {
      const existingRecords = await this.getAllControlePrazos();
      
      if (existingRecords.length === 0) {
        console.log('Creating sample controle-prazos data...');
        
        const sampleData = [
          {
            unidade: "1ª DRPC - Santo Antônio de Jesus",
            oficio: "OF-001/2025",
            linkSei: null,
            naoConformidade: "Ausência de livro de ocorrências atualizado",
            dataRecebimento: "2025-01-01",
            dataPrazo: "2025-02-01",
            status: "pendente" as const,
            observacoes: "Prazo inicial de 30 dias"
          },
          {
            unidade: "2ª DRPC - Feira de Santana",
            oficio: "OF-002/2025",
            linkSei: null,
            naoConformidade: "Falta de organização do arquivo geral",
            dataRecebimento: "2025-01-05",
            dataPrazo: "2025-02-05",
            status: "regularizado" as const,
            observacoes: "Regularizado conforme ofício de resposta"
          },
          {
            unidade: "3ª DRPC - Itabuna",
            oficio: "OF-003/2025",
            linkSei: null,
            naoConformidade: "Irregularidades no controle de armamento",
            dataRecebimento: "2025-01-10",
            dataPrazo: "2025-02-10",
            status: "nao_regularizado" as const,
            observacoes: "Pendente de documentação complementar"
          }
        ];
        
        for (const item of sampleData) {
          await this.createControlePrazo(item);
        }
        
        console.log('Sample controle-prazos data created successfully');
      }
    } catch (error) {
      console.error('Error initializing sample controle-prazos data:', error);
    }
  }

  private async loadRealInspectionData() {
    try {
      const fs = await import('fs');
      const path = await import('path');
      
      const dataPath = path.join(process.cwd(), 'data', 'real-inspections.json');
      
      if (fs.existsSync(dataPath)) {
        const existingInspections = await this.getAllInspections();
        
        // Only load if database is empty or has less than 100 records
        if (existingInspections.length < 100) {
          console.log('Loading real inspection data from Excel files...');
          
          const rawData = fs.readFileSync(dataPath, 'utf-8');
          const realData = JSON.parse(rawData);
          
          // Transform data to match our schema
          const inspectionsToInsert = realData.map((item: any) => ({
            numero: item.numero,
            unidadeInspecionada: item.unidadeInspecionada,
            departamento: item.departamento,
            coorpin: item.coorpin,
            dataInspecao: item.dataInspecao,
            delegadoCorregedor: item.delegadoCorregedor,
            naoConformidade: item.naoConformidade,
            descricaoNaoConformidade: item.descricaoNaoConformidade,
            providenciasIniciais: item.providenciasIniciais,
            providenciasIntermediarias: item.providenciasIntermediarias,
            providenciasConclusivas: item.providenciasConclusivas,
            dataInicioRegularizacao: item.dataInicioRegularizacao,
            diasPrazo: item.diasPrazo,
            dataFimRegularizacao: item.dataFimRegularizacao,
            statusPrazo: item.statusPrazo,
            dataNovaInspecao: item.dataNovaInspecao,
            criticidade: item.criticidade
          }));
          
          await this.bulkCreateInspections(inspectionsToInsert);
          console.log(`✅ Loaded ${inspectionsToInsert.length} real inspection records from Excel files`);
        }
      }
    } catch (error) {
      console.warn('Could not load real inspection data:', error);
    }
  }

  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    // Se não há banco de dados, retornar usuário padrão para desenvolvimento
    if (!process.env.DATABASE_URL) {
      if (username === 'astec.admin') {
        return {
          id: 1,
          username: 'astec.admin',
          password: 'Correpol@2025#BA',
          createdAt: new Date(),
          updatedAt: new Date()
        };
      }
      return undefined;
    }
    
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async getAllInspections(): Promise<Inspection[]> {
    if (!process.env.DATABASE_URL) {
      return [...this.inMemoryInspections];
    }
    return await db.select().from(inspections);
  }

  async getInspectionsByFilters(filters: any): Promise<Inspection[]> {
    if (!process.env.DATABASE_URL) {
      return this.filterInMemoryInspections(filters);
    }

    const conditions = [];
    
    if (filters.unidade && filters.unidade.length > 0) {
      conditions.push(inArray(inspections.unidadeInspecionada, filters.unidade));
    }
    
    if (filters.departamento && filters.departamento.length > 0) {
      conditions.push(inArray(inspections.departamento, filters.departamento));
    }
    
    if (filters.naoConformidade && filters.naoConformidade.length > 0) {
      conditions.push(inArray(inspections.naoConformidade, filters.naoConformidade));
    }

    // Add year filter
    if (filters.ano) {
      conditions.push(sql`EXTRACT(YEAR FROM ${inspections.dataInspecao}) = ${filters.ano}`);
    }

    // Add date range filters
    if (filters.dataInicial) {
      conditions.push(gte(inspections.dataInspecao, filters.dataInicial));
    }

    if (filters.dataFinal) {
      conditions.push(lte(inspections.dataInspecao, filters.dataFinal));
    }

    // Add status prazo filter
    if (filters.statusPrazo) {
      conditions.push(eq(inspections.statusPrazo, filters.statusPrazo));
    }

    if (conditions.length > 0) {
      return await db.select().from(inspections).where(and(...conditions));
    }

    return await db.select().from(inspections);
  }

  private filterInMemoryInspections(filters: any): Inspection[] {
    if (this.inMemoryInspections.length === 0) {
      return [];
    }

    const ensureArray = (value: unknown): string[] => {
      return Array.isArray(value) ? value : [];
    };

    const toDate = (value: Date | string | null | undefined): Date | null => {
      if (!value) {
        return null;
      }

      if (value instanceof Date) {
        return value;
      }

      const parsed = new Date(value);
      return Number.isNaN(parsed.getTime()) ? null : parsed;
    };

    const unidadeFilter = ensureArray(filters?.unidade);
    const departamentoFilter = ensureArray(filters?.departamento);
    const naoConformidadeFilter = ensureArray(filters?.naoConformidade);
    const anoFilter = filters?.ano ? Number(filters.ano) : null;
    const dataInicial = toDate(filters?.dataInicial);
    const dataFinal = toDate(filters?.dataFinal);
    const statusPrazoFilter = filters?.statusPrazo ?? null;

    return this.inMemoryInspections.filter((inspection) => {
      if (unidadeFilter.length > 0 && !unidadeFilter.includes(inspection.unidadeInspecionada)) {
        return false;
      }

      if (departamentoFilter.length > 0 && !departamentoFilter.includes(inspection.departamento)) {
        return false;
      }

      if (naoConformidadeFilter.length > 0 && !naoConformidadeFilter.includes(inspection.naoConformidade)) {
        return false;
      }

      const inspectionDate = toDate(inspection.dataInspecao);

      if (anoFilter !== null && inspectionDate?.getUTCFullYear() !== anoFilter) {
        return false;
      }

      if (dataInicial && inspectionDate && inspectionDate < dataInicial) {
        return false;
      }

      if (dataFinal && inspectionDate && inspectionDate > dataFinal) {
        return false;
      }

      if (statusPrazoFilter && inspection.statusPrazo !== statusPrazoFilter) {
        return false;
      }

      return true;
    });
  }

  async createInspection(insertInspection: InsertInspection): Promise<Inspection> {
    const [inspection] = await db
      .insert(inspections)
      .values(insertInspection)
      .returning();
    return inspection;
  }

  async bulkCreateInspections(insertInspections: InsertInspection[]): Promise<Inspection[]> {
    if (insertInspections.length === 0) return [];
    
    // Process in smaller batches to avoid parameter limit
    const batchSize = 500;
    const results: Inspection[] = [];
    
    for (let i = 0; i < insertInspections.length; i += batchSize) {
      const batch = insertInspections.slice(i, i + batchSize);
      
      // Use upsert (insert or update) to avoid duplicates
      // Conflict resolution based on: numero + unidadeInspecionada + departamento + naoConformidade
      for (const inspection of batch) {
        const [upsertResult] = await db
          .insert(inspections)
          .values(inspection)
          .onConflictDoUpdate({
            target: [inspections.numero, inspections.unidadeInspecionada, inspections.departamento, inspections.naoConformidade],
            set: {
              dataInspecao: inspection.dataInspecao,
              delegadoCorregedor: inspection.delegadoCorregedor,
              descricaoNaoConformidade: inspection.descricaoNaoConformidade,
              providenciasIniciais: inspection.providenciasIniciais,
              providenciasIntermediarias: inspection.providenciasIntermediarias,
              providenciasConclusivas: inspection.providenciasConclusivas,
              dataInicioPrazo: inspection.dataInicioPrazo,
              diasPrazo: inspection.diasPrazo,
              dataFimRegularizacao: inspection.dataFimRegularizacao,
              statusPrazo: inspection.statusPrazo,
              dataDeterminadaNovaInspecao: inspection.dataDeterminadaNovaInspecao,
              criticidade: inspection.criticidade,
            },
          })
          .returning();
        
        if (upsertResult) {
          results.push(upsertResult);
        }
      }
      
      console.log(`Processed batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(insertInspections.length/batchSize)} (${batch.length} records) with deduplication`);
    }
    
    // GARANTIA: Nunca criar automaticamente dados de controle de prazos
    // quando dados de inspeção são inseridos
    console.log(`✅ Bulk insert de ${results.length} inspeções concluído - SEPARAÇÃO TOTAL DE DADOS`);
    
    return results;
  }

  // Controle de Prazos methods
  async getAllControlePrazos(): Promise<ControlePrazo[]> {
    if (!process.env.DATABASE_URL) {
      return [];
    }
    return await db.select().from(controlePrazos).orderBy(controlePrazos.dataPrazo);
  }

  async createControlePrazo(insertControlePrazo: InsertControlePrazo): Promise<ControlePrazo> {
    const [controlePrazo] = await db
      .insert(controlePrazos)
      .values(insertControlePrazo)
      .returning();
    return controlePrazo;
  }

  async updateControlePrazo(id: number, updateData: Partial<InsertControlePrazo>): Promise<ControlePrazo> {
    const [controlePrazo] = await db
      .update(controlePrazos)
      .set(updateData)
      .where(eq(controlePrazos.id, id))
      .returning();
    return controlePrazo;
  }

  async deleteControlePrazo(id: number): Promise<void> {
    await db.delete(controlePrazos).where(eq(controlePrazos.id, id));
  }

  async clearControlePrazos(): Promise<void> {
    await db.delete(controlePrazos);
  }

  async deleteAllInspections(): Promise<void> {
    await db.delete(inspections);
  }

  async deleteAllControlePrazos(): Promise<void> {
    await db.delete(controlePrazos);
  }

  async insertControlePrazosInBatch(controlePrazosData: InsertControlePrazo[]): Promise<ControlePrazo[]> {
    if (controlePrazosData.length === 0) {
      return [];
    }
    
    // LOG: Confirmar que este método só é chamado para uploads explícitos de controle de prazos
    console.log(`🔒 CONTROLE DE PRAZOS: Inserindo ${controlePrazosData.length} registros via upload EXPLÍCITO`);

    // Process in smaller batches to avoid parameter limit
    const batchSize = 500;
    const results: ControlePrazo[] = [];
    
    for (let i = 0; i < controlePrazosData.length; i += batchSize) {
      const batch = controlePrazosData.slice(i, i + batchSize);
      
      // Use upsert to avoid duplicates based on: oficio + unidade + naoConformidade
      for (const controlePrazo of batch) {
        try {
          const [upsertResult] = await db
            .insert(controlePrazos)
            .values(controlePrazo)
            .onConflictDoUpdate({
              target: [controlePrazos.oficio, controlePrazos.unidade, controlePrazos.naoConformidade],
              set: {
                linkSei: controlePrazo.linkSei,
                dataRecebimento: controlePrazo.dataRecebimento,
                dataPrazo: controlePrazo.dataPrazo,
                status: controlePrazo.status,
                observacoes: controlePrazo.observacoes,
              },
            })
            .returning();
          
          if (upsertResult) {
            results.push(upsertResult);
          }
        } catch (error) {
          console.error(`Erro ao inserir controle de prazo (oficio: ${controlePrazo.oficio}, unidade: ${controlePrazo.unidade}):`, error);
          // Continue processing other records even if one fails
        }
      }
      
      console.log(`Processed controle de prazos batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(controlePrazosData.length/batchSize)} (${batch.length} records) with deduplication`);
    }
    
    return results;
  }

  async bulkCreateControlePrazos(controlePrazosData: InsertControlePrazo[]): Promise<ControlePrazo[]> {
    return this.insertControlePrazosInBatch(controlePrazosData);
  }

  // Gallery methods
  async getAllPhotos(): Promise<GalleryPhoto[]> {
    if (!process.env.DATABASE_URL) {
      return [];
    }
    return await db.select().from(galleryPhotos).orderBy(galleryPhotos.createdAt);
  }

  async getPhotosByUnidade(unidade: string): Promise<GalleryPhoto[]> {
    return await db.select().from(galleryPhotos)
      .where(eq(galleryPhotos.unidade, unidade))
      .orderBy(galleryPhotos.createdAt);
  }

  async createPhoto(insertPhoto: InsertGalleryPhoto): Promise<GalleryPhoto> {
    const [photo] = await db
      .insert(galleryPhotos)
      .values(insertPhoto)
      .returning();
    return photo;
  }

  async deletePhoto(id: number): Promise<void> {
    await db.delete(galleryPhotos).where(eq(galleryPhotos.id, id));
  }

  // Document methods
  async getAllDocuments(): Promise<Document[]> {
    if (!process.env.DATABASE_URL) {
      return [];
    }
    return await db.select().from(documents).orderBy(documents.createdAt);
  }

  async createDocument(insertDocument: InsertDocument): Promise<Document> {
    const [document] = await db
      .insert(documents)
      .values(insertDocument)
      .returning();
    return document;
  }

  async updateDocument(id: number, updateDocument: Partial<InsertDocument>): Promise<Document> {
    const [document] = await db
      .update(documents)
      .set({
        ...updateDocument,
        updatedAt: new Date(),
      })
      .where(eq(documents.id, id))
      .returning();
    return document;
  }

  async deleteDocument(id: number): Promise<void> {
    await db.delete(documents).where(eq(documents.id, id));
  }
}

export const storage = new DatabaseStorage();
