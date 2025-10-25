import { pgTable, text, serial, integer, date, timestamp, uniqueIndex, boolean, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  twoFactorSecret: text("two_factor_secret"),
  twoFactorEnabled: boolean("two_factor_enabled").default(false),
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

export const unidadesPoliciais = pgTable("unidades_policiais", {
  id: serial("id").primaryKey(),
  nome: text("nome").notNull().unique(),
  departamento: text("departamento").notNull(),
  latitude: decimal("latitude", { precision: 10, scale: 8 }),
  longitude: decimal("longitude", { precision: 11, scale: 8 }),
  endereco: text("endereco"),
  telefone: text("telefone"),
  status: text("status").notNull().default("ativo"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const cvliData = pgTable("cvli_data", {
  id: serial("id").primaryKey(),
  unidadeId: integer("unidade_id").references(() => unidadesPoliciais.id),
  unidadeNome: text("unidade_nome").notNull(),
  ano: integer("ano").notNull(),
  mes: integer("mes").notNull(),
  totalCvli: integer("total_cvli").notNull().default(0),
  homicidios: integer("homicidios").notNull().default(0),
  latrocinios: integer("latrocinios").notNull().default(0),
  lesoesCorporaisSeguidas: integer("lesoes_corporais_seguidas").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const miaeData = pgTable("miae_data", {
  id: serial("id").primaryKey(),
  unidadeId: integer("unidade_id").references(() => unidadesPoliciais.id),
  unidadeNome: text("unidade_nome").notNull(),
  boletimOcorrencia: text("boletim_ocorrencia").notNull(),
  dataOcorrencia: date("data_ocorrencia").notNull(),
  tipoOcorrencia: text("tipo_ocorrencia").notNull(),
  statusInquerito: text("status_inquerito").notNull().default("sem_ip"),
  observacoes: text("observacoes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const padsData = pgTable("pads_data", {
  id: serial("id").primaryKey(),
  numeroProcesso: text("numero_processo").notNull().unique(),
  comissaoProcessante: text("comissao_processante").notNull(),
  dataInstauracao: date("data_instauracao").notNull(),
  dataConclusao: date("data_conclusao"),
  status: text("status").notNull().default("em_andamento"),
  autoridade: text("autoridade").notNull(),
  objeto: text("objeto"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const cadeiasCustodia = pgTable("cadeias_custodia", {
  id: serial("id").primaryKey(),
  unidadeId: integer("unidade_id").references(() => unidadesPoliciais.id),
  unidadeNome: text("unidade_nome").notNull(),
  statusImplementacao: text("status_implementacao").notNull(),
  dataAvaliacao: date("data_avaliacao").notNull(),
  observacoes: text("observacoes"),
  acoesCorretivas: text("acoes_corretivas"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const carceragens = pgTable("carceragens", {
  id: serial("id").primaryKey(),
  unidadeId: integer("unidade_id").references(() => unidadesPoliciais.id),
  unidadeNome: text("unidade_nome").notNull(),
  statusInterdicao: text("status_interdicao").notNull(),
  decisaoJudicial: text("decisao_judicial"),
  dataInterdicao: date("data_interdicao"),
  medidaDeterminada: text("medida_determinada"),
  historico: text("historico"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const acoesCivisPublicas = pgTable("acoes_civis_publicas", {
  id: serial("id").primaryKey(),
  unidadeId: integer("unidade_id").references(() => unidadesPoliciais.id),
  unidadeNome: text("unidade_nome").notNull(),
  numeroAcao: text("numero_acao").notNull().unique(),
  objeto: text("objeto").notNull(),
  status: text("status").notNull().default("em_andamento"),
  prazoAtendimento: date("prazo_atendimento"),
  determinacoes: text("determinacoes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const chatMessages = pgTable("chat_messages", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  message: text("message").notNull(),
  response: text("response").notNull(),
  context: text("context"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUnidadePolicialSchema = createInsertSchema(unidadesPoliciais).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCvliDataSchema = createInsertSchema(cvliData).omit({
  id: true,
  createdAt: true,
});

export const insertMiaeDataSchema = createInsertSchema(miaeData).omit({
  id: true,
  createdAt: true,
});

export const insertPadsDataSchema = createInsertSchema(padsData).omit({
  id: true,
  createdAt: true,
});

export const insertCadeiaCustodiaSchema = createInsertSchema(cadeiasCustodia).omit({
  id: true,
  createdAt: true,
});

export const insertCarceragemSchema = createInsertSchema(carceragens).omit({
  id: true,
  createdAt: true,
});

export const insertAcaoCivilPublicaSchema = createInsertSchema(acoesCivisPublicas).omit({
  id: true,
  createdAt: true,
});

export const insertChatMessageSchema = createInsertSchema(chatMessages).omit({
  id: true,
  createdAt: true,
});

export const loginSchema = z.object({
  username: z.string().min(1, "Nome de usuário é obrigatório"),
  password: z.string().min(1, "Senha é obrigatória"),
  twoFactorToken: z.string().optional(),
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
export type InsertUnidadePolicial = z.infer<typeof insertUnidadePolicialSchema>;
export type UnidadePolicial = typeof unidadesPoliciais.$inferSelect;
export type InsertCvliData = z.infer<typeof insertCvliDataSchema>;
export type CvliData = typeof cvliData.$inferSelect;
export type InsertMiaeData = z.infer<typeof insertMiaeDataSchema>;
export type MiaeData = typeof miaeData.$inferSelect;
export type InsertPadsData = z.infer<typeof insertPadsDataSchema>;
export type PadsData = typeof padsData.$inferSelect;
export type InsertCadeiaCustodia = z.infer<typeof insertCadeiaCustodiaSchema>;
export type CadeiaCustodia = typeof cadeiasCustodia.$inferSelect;
export type InsertCarceragem = z.infer<typeof insertCarceragemSchema>;
export type Carceragem = typeof carceragens.$inferSelect;
export type InsertAcaoCivilPublica = z.infer<typeof insertAcaoCivilPublicaSchema>;
export type AcaoCivilPublica = typeof acoesCivisPublicas.$inferSelect;
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;
export type ChatMessage = typeof chatMessages.$inferSelect;
export type LoginRequest = z.infer<typeof loginSchema>;
