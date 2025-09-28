import { beforeEach, describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { DatabaseStorage } from '../storage';
import type { Inspection } from '@shared/schema';

const createInspection = (overrides: Partial<Inspection> & { id: number; numero: string }): Inspection => {
  const baseDate = new Date('2023-01-01T00:00:00Z');

  return {
    id: overrides.id,
    numero: overrides.numero,
    unidadeInspecionada: overrides.unidadeInspecionada ?? 'Delegacia A',
    departamento: overrides.departamento ?? 'Operações',
    coorpin: overrides.coorpin ?? 'COORPIN 01',
    dataInspecao: overrides.dataInspecao ?? baseDate,
    delegadoCorregedor: overrides.delegadoCorregedor ?? 'Delegado Responsável',
    naoConformidade: overrides.naoConformidade ?? 'Infraestrutura',
    descricaoNaoConformidade: overrides.descricaoNaoConformidade ?? 'Descrição padrão',
    providenciasIniciais: overrides.providenciasIniciais ?? null,
    providenciasIntermediarias: overrides.providenciasIntermediarias ?? null,
    providenciasConclusivas: overrides.providenciasConclusivas ?? null,
    dataInicioPrazo: overrides.dataInicioPrazo ?? null,
    diasPrazo: overrides.diasPrazo ?? null,
    dataFimRegularizacao: overrides.dataFimRegularizacao ?? null,
    statusPrazo: overrides.statusPrazo ?? 'regularizado',
    dataDeterminadaNovaInspecao: overrides.dataDeterminadaNovaInspecao ?? null,
    criticidade: overrides.criticidade ?? null,
    createdAt: overrides.createdAt ?? baseDate,
    updatedAt: overrides.updatedAt ?? baseDate,
  };
};

const buildMockInspections = (): Inspection[] => [
  createInspection({
    id: 1,
    numero: '001',
    unidadeInspecionada: 'Delegacia A',
    departamento: 'Operações',
    naoConformidade: 'Infraestrutura',
    dataInspecao: new Date('2023-01-10T00:00:00Z'),
    statusPrazo: 'regularizado',
  }),
  createInspection({
    id: 2,
    numero: '002',
    unidadeInspecionada: 'Delegacia B',
    departamento: 'Administrativo',
    naoConformidade: 'Documentação',
    dataInspecao: new Date('2023-05-15T00:00:00Z'),
    statusPrazo: 'pendente',
  }),
  createInspection({
    id: 3,
    numero: '003',
    unidadeInspecionada: 'Delegacia A',
    departamento: 'Administrativo',
    naoConformidade: 'Infraestrutura',
    dataInspecao: new Date('2024-02-20T00:00:00Z'),
    statusPrazo: 'nao_regularizado',
  }),
  createInspection({
    id: 4,
    numero: '004',
    unidadeInspecionada: 'Delegacia C',
    departamento: 'Operações',
    naoConformidade: 'Equipamentos',
    dataInspecao: new Date('2024-08-05T00:00:00Z'),
    statusPrazo: 'pendente',
  }),
];

describe('DatabaseStorage.getInspectionsByFilters', () => {
  let storage: DatabaseStorage;

  beforeEach(() => {
    storage = new DatabaseStorage();
    (storage as unknown as { inMemoryInspections: Inspection[] }).inMemoryInspections = buildMockInspections();
  });

  it('retorna todas as inspeções quando nenhum filtro é informado', async () => {
    const inspections = await storage.getInspectionsByFilters({});
    assert.equal(inspections.length, 4);
  });

  it('filtra por unidade inspecionada', async () => {
    const inspections = await storage.getInspectionsByFilters({ unidade: ['Delegacia A'] });
    assert.equal(inspections.length, 2);
    inspections.forEach((inspection) => {
      assert.equal(inspection.unidadeInspecionada, 'Delegacia A');
    });
  });

  it('filtra por departamento', async () => {
    const inspections = await storage.getInspectionsByFilters({ departamento: ['Administrativo'] });
    assert.equal(inspections.length, 2);
    inspections.forEach((inspection) => {
      assert.equal(inspection.departamento, 'Administrativo');
    });
  });

  it('filtra por não conformidade', async () => {
    const inspections = await storage.getInspectionsByFilters({ naoConformidade: ['Infraestrutura'] });
    assert.equal(inspections.length, 2);
    inspections.forEach((inspection) => {
      assert.equal(inspection.naoConformidade, 'Infraestrutura');
    });
  });

  it('filtra pelo ano da inspeção', async () => {
    const inspections = await storage.getInspectionsByFilters({ ano: 2024 });
    assert.equal(inspections.length, 2);
    inspections.forEach((inspection) => {
      assert.equal(new Date(inspection.dataInspecao).getUTCFullYear(), 2024);
    });
  });

  it('filtra por intervalo de datas', async () => {
    const inspections = await storage.getInspectionsByFilters({
      dataInicial: new Date('2023-01-01T00:00:00Z'),
      dataFinal: new Date('2023-12-31T23:59:59Z'),
    });

    assert.equal(inspections.length, 2);
    inspections.forEach((inspection) => {
      const inspectionDate = new Date(inspection.dataInspecao).getTime();
      assert.ok(inspectionDate >= new Date('2023-01-01T00:00:00Z').getTime());
      assert.ok(inspectionDate <= new Date('2023-12-31T23:59:59Z').getTime());
    });
  });

  it('filtra por status do prazo', async () => {
    const inspections = await storage.getInspectionsByFilters({ statusPrazo: 'pendente' });
    assert.equal(inspections.length, 2);
    inspections.forEach((inspection) => {
      assert.equal(inspection.statusPrazo, 'pendente');
    });
  });

  it('combina múltiplos filtros simultaneamente', async () => {
    const inspections = await storage.getInspectionsByFilters({
      unidade: ['Delegacia A'],
      departamento: ['Administrativo'],
      naoConformidade: ['Infraestrutura'],
      ano: 2024,
      dataInicial: new Date('2024-01-01T00:00:00Z'),
      dataFinal: new Date('2024-12-31T23:59:59Z'),
      statusPrazo: 'nao_regularizado',
    });

    assert.equal(inspections.length, 1);
    assert.equal(inspections[0]?.numero, '003');
  });
});
