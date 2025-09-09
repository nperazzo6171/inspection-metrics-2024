import fs from 'fs';
import { Pool } from '@neondatabase/serverless';
import ws from 'ws';

// Configure WebSocket for serverless
const neonConfig = { webSocketConstructor: ws };

async function loadRealData() {
  console.log('Carregando dados reais do arquivo JSON...');
  
  try {
    // Read the JSON file
    const jsonData = fs.readFileSync('../data/real-inspections.json', 'utf8');
    const inspections = JSON.parse(jsonData);
    
    console.log(`Total de registros encontrados: ${inspections.length}`);
    
    // Connect to database
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    
    // Clear existing data
    await pool.query('DELETE FROM inspections');
    console.log('Dados anteriores removidos');
    
    // Insert data in batches
    const batchSize = 500;
    let totalInserted = 0;
    
    for (let i = 0; i < inspections.length; i += batchSize) {
      const batch = inspections.slice(i, i + batchSize);
      
      const values = batch.map(inspection => [
        inspection.numero,
        inspection.unidadeInspecionada,
        inspection.departamento,
        inspection.coorpin,
        inspection.dataInspecao,
        inspection.delegadoCorregedor,
        inspection.naoConformidade,
        inspection.descricaoNaoConformidade,
        inspection.providenciasIniciais,
        inspection.providenciasIntermediarias,
        inspection.providenciasConclusivas,
        inspection.dataInicioRegularizacao,
        inspection.diasPrazo,
        inspection.dataFimRegularizacao,
        inspection.statusPrazo,
        inspection.dataNovaInspecao,
        inspection.criticidade
      ]);
      
      const placeholders = values.map((_, index) => 
        `($${index * 17 + 1}, $${index * 17 + 2}, $${index * 17 + 3}, $${index * 17 + 4}, $${index * 17 + 5}, $${index * 17 + 6}, $${index * 17 + 7}, $${index * 17 + 8}, $${index * 17 + 9}, $${index * 17 + 10}, $${index * 17 + 11}, $${index * 17 + 12}, $${index * 17 + 13}, $${index * 17 + 14}, $${index * 17 + 15}, $${index * 17 + 16}, $${index * 17 + 17})`
      ).join(', ');
      
      const flatValues = values.flat();
      
      const query = `
        INSERT INTO inspections (
          numero, unidade_inspecionada, departamento, coorpin, data_inspecao,
          delegado_corregedor, nao_conformidade, descricao_nao_conformidade,
          providencias_iniciais, providencias_intermediarias, providencias_conclusivas,
          data_inicio_prazo_regularizacao, dias_prazo, data_fim_regularizacao,
          status_prazo, data_determinada_nova_inspecao, criticidade
        ) VALUES ${placeholders}
      `;
      
      await pool.query(query, flatValues);
      totalInserted += batch.length;
      
      console.log(`Processados ${totalInserted}/${inspections.length} registros`);
    }
    
    // Verify data
    const result = await pool.query(`
      SELECT 
        COUNT(*) as total_records,
        COUNT(DISTINCT CONCAT(unidade_inspecionada, '-', data_inspecao)) as unique_inspections,
        EXTRACT(YEAR FROM data_inspecao) as ano,
        COUNT(*) as quantidade
      FROM inspections 
      WHERE data_inspecao IS NOT NULL
      GROUP BY EXTRACT(YEAR FROM data_inspecao)
      ORDER BY ano
    `);
    
    console.log('\n✅ Dados carregados com sucesso!');
    console.log(`Total de registros: ${totalInserted}`);
    console.log('Distribuição por ano:', result.rows);
    
    await pool.end();
    
  } catch (error) {
    console.error('❌ Erro durante o carregamento:', error.message);
    process.exit(1);
  }
}

loadRealData();