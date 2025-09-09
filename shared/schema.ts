import { pgTable, text, serial, integer, date, timestamp, uniqueIndex } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const inspections = pgTable("inspections", {
  id: serial("id").primaryKey(),
  numero: text("numero").notNull(),
  unidadeInspecionada: text("unidade_inspecionada").notNull(),
  departamento: text("departamento").notNull(),
  coorpin: text("coorpin").notNull(),
  dataInspecao: date("data_inspecao").notNull(),
  delegadoCorregedor: text("delegado_corregedor").notNull(),
  naoConformidade: text("nao_conformidade").notNull(),
  descricaoNaoConformidade: text("descricao_nao_conformidade").notNull(),
  providenciasIniciais: text("providencias_iniciais"),
  providenciasIntermediarias: text("providencias_intermediarias"),
  providenciasConclusivas: text("providencias_conclusivas"),
  dataInicioPrazo: date("data_inicio_prazo"),
  diasPrazo: integer("dias_prazo"),
  dataFimRegularizacao: date("data_fim_regularizacao"),
  statusPrazo: text("status_prazo"),
  dataDeterminadaNovaInspecao: date("data_determinada_nova_inspecao"),
  criticidade: text("criticidade"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  uniqueInspection: uniqueIndex("unique_inspection_idx").on(
    table.numero,
    table.unidadeInspecionada,
    table.departamento,
    table.naoConformidade
  ),
}));

export const controlePrazos = pgTable("controle_prazos", {
  id: serial("id").primaryKey(),
  unidade: text("unidade").notNull(),
  oficio: text("oficio").notNull(),
  linkSei: text("link_sei"),
  linkCoda: text("link_coda"),
  naoConformidade: text("nao_conformidade").notNull(),
  dataRecebimento: date("data_recebimento").notNull(),
  dataPrazo: date("data_prazo").notNull(),
  status: text("status").notNull().default("pendente"), // "regularizado" | "nao_regularizado" | "pendente"
  observacoes: text("observacoes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  uniqueControlePrazo: uniqueIndex("unique_controle_prazo_idx").on(
    table.oficio,
    table.unidade,
    table.naoConformidade
  ),
}));

export const galleryPhotos = pgTable("gallery_photos", {
  id: serial("id").primaryKey(),
  unidade: text("unidade").notNull(),
  fileName: text("file_name").notNull(),
  fileType: text("file_type").notNull(),
  fileSize: integer("file_size").notNull(),
  imageData: text("image_data").notNull(), // base64 compressed image
  createdAt: timestamp("created_at").defaultNow(),
});

export const documents = pgTable("documents", {
  id: serial("id").primaryKey(),
  tipo: text("tipo").notNull(), // 'Lei' | 'Instrução Normativa' | 'Portaria' | 'Ofício Circular' | 'Nota Técnica' | 'Termo de Cooperação Técnica'
  numero: text("numero").notNull(),
  ano: text("ano").notNull(),
  titulo: text("titulo").notNull(),
  descricao: text("descricao"),
  orgaoEmissor: text("orgao_emissor"),
  dataPublicacao: date("data_publicacao"),
  dataVigencia: date("data_vigencia"),
  status: text("status").notNull().default("Vigente"), // 'Vigente' | 'Revogado' | 'Suspenso'
  assunto: text("assunto"),
  arquivoUrl: text("arquivo_url"), // URL or path to the document file
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  uniqueDocument: uniqueIndex("unique_document_idx").on(
    table.tipo,
    table.numero,
    table.ano
  ),
}));

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertInspectionSchema = createInsertSchema(inspections).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertControlePrazoSchema = createInsertSchema(controlePrazos).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertGalleryPhotoSchema = createInsertSchema(galleryPhotos).omit({
  id: true,
  createdAt: true,
});

export const insertDocumentSchema = createInsertSchema(documents).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const loginSchema = z.object({
  username: z.string().min(1, "Nome de usuário é obrigatório"),
  password: z.string().min(1, "Senha é obrigatória"),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertInspection = z.infer<typeof insertInspectionSchema>;
export type Inspection = typeof inspections.$inferSelect;
export type InsertControlePrazo = z.infer<typeof insertControlePrazoSchema>;
export type ControlePrazo = typeof controlePrazos.$inferSelect;
export type InsertGalleryPhoto = z.infer<typeof insertGalleryPhotoSchema>;
export type GalleryPhoto = typeof galleryPhotos.$inferSelect;
export type InsertDocument = z.infer<typeof insertDocumentSchema>;
export type Document = typeof documents.$inferSelect;
export type LoginRequest = z.infer<typeof loginSchema>;
